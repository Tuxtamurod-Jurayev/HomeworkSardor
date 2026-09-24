import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Edit,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import "./students.css";

type StudentStatus = "active" | "blocked";

type Student = {
  id: string | number;
  firstName: string;
  lastName: string;
  phone: string;
  username: string;
  password: string;
  group: string;
  parentPhone: string;
  status: StudentStatus;
};

type StudentForm = Omit<Student, "id">;

const defaultGroupOptions = [
  "Elementary A1",
  "Pre-Intermediate A2",
  "Intermediate B1",
  "Upper-Intermediate B2",
];

const initialStudents: Student[] = [
  {
    id: "initial-1",
    firstName: "Ali",
    lastName: "Karimov",
    phone: "+998 90 123 45 67",
    username: "ali_karimov",
    password: "12345",
    group: "Elementary A1",
    parentPhone: "+998 91 111 22 33",
    status: "active",
  },
  {
    id: "initial-2",
    firstName: "Madina",
    lastName: "Rahimova",
    phone: "+998 93 222 33 44",
    username: "madina_rahimova",
    password: "12345",
    group: "Pre-Intermediate A2",
    parentPhone: "+998 94 555 66 77",
    status: "active",
  },
];

const emptyForm: StudentForm = {
  firstName: "",
  lastName: "",
  phone: "",
  username: "",
  password: "",
  group: "",
  parentPhone: "",
  status: "active",
};

function Students() {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [groupOptions, setGroupOptions] = useState<string[]>(defaultGroupOptions);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Bazadan guruhlarni yuklash
  const loadGroups = async () => {
    try {
      const { data, error: groupErr } = await supabase
        .from("groups")
        .select("name")
        .order("name", { ascending: true });

      if (!groupErr && data && data.length > 0) {
        const names = Array.from(
          new Set(data.map((g) => g.name).filter(Boolean)),
        );
        if (names.length > 0) {
          setGroupOptions(names);
        }
      }
    } catch (err) {
      console.warn("Guruhlarni yuklashda xatolik:", err);
    }
  };

  // 2. Supabase users jadvalidan o‘quvchilarni yuklash
  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from("users")
        .select("id, login, password, first_name, last_name, full_name, status")
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (!fetchErr && data) {
        const loadedStudents: Student[] = data.map((u) => {
          const metaStr =
            localStorage.getItem(`homework_student_meta_${u.id}`) ||
            localStorage.getItem(`homework_student_meta_${u.login}`);
          const meta = metaStr ? JSON.parse(metaStr) : {};

          return {
            id: u.id,
            firstName:
              u.first_name ||
              u.full_name?.split(" ")[0] ||
              "",
            lastName:
              u.last_name ||
              u.full_name?.split(" ").slice(1).join(" ") ||
              "",
            username: u.login,
            password: u.password || "12345",
            phone: meta.phone || "",
            parentPhone: meta.parentPhone || "",
            group: meta.group || defaultGroupOptions[0],
            status: u.status === "Nofaol" ? "blocked" : "active",
          };
        });

        if (loadedStudents.length > 0) {
          setStudents(loadedStudents);
        } else {
          setStudents(initialStudents);
        }
      }
    } catch (err) {
      console.warn("O‘quvchilarni yuklash xatosi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadGroups();
    void loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return students;
    }

    return students.filter((student) =>
      [
        student.firstName,
        student.lastName,
        student.username,
        student.phone,
        student.group,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search, students]);

  const openCreateModal = () => {
    setEditingStudent(null);
    setForm({
      ...emptyForm,
      group: groupOptions[0] || "",
    });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      phone: student.phone,
      username: student.username,
      password: student.password,
      group: student.group,
      parentPhone: student.parentPhone,
      status: student.status,
    });
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingStudent(null);
    setForm(emptyForm);
    setError("");
  };

  const handleChange = (
    field: keyof StudentForm,
    value: string | StudentStatus,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const username = form.username.trim().toLowerCase();
    const password = form.password.trim();
    const group = form.group.trim();
    const phone = form.phone.trim();
    const parentPhone = form.parentPhone.trim();
    const status = form.status;

    if (!firstName || !lastName || !username || !password || !group) {
      setError("Majburiy maydonlarni to‘ldiring.");
      return;
    }

    if (password.length < 5) {
      setError("Parol kamida 5 ta belgidan iborat bo‘lishi kerak.");
      return;
    }

    setIsSaving(true);

    try {
      const fullName = `${firstName} ${lastName}`;
      const dbStatus = status === "active" ? "Faol" : "Nofaol";

      if (editingStudent) {
        // Tahrirlash
        const { error: updateError } = await supabase
          .from("users")
          .update({
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            password,
            status: dbStatus,
          })
          .eq("id", editingStudent.id);

        if (updateError) {
          console.warn("Supabase update error:", updateError);
        }

        // Metadata saqlash
        localStorage.setItem(
          `homework_student_meta_${editingStudent.id}`,
          JSON.stringify({ phone, parentPhone, group }),
        );
        localStorage.setItem(
          `homework_student_meta_${username}`,
          JSON.stringify({ phone, parentPhone, group }),
        );

        setStudents((previous) =>
          previous.map((s) =>
            s.id === editingStudent.id
              ? {
                  ...s,
                  firstName,
                  lastName,
                  username,
                  password,
                  group,
                  phone,
                  parentPhone,
                  status,
                }
              : s,
          ),
        );
      } else {
        // Yangi o‘quvchi yaratish
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("login", username)
          .maybeSingle();

        if (existingUser) {
          setError("Bu username (login) allaqachon mavjud!");
          setIsSaving(false);
          return;
        }

        const { data: inserted, error: insertError } = await supabase
          .from("users")
          .insert({
            login: username,
            password,
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            role: "student",
            status: dbStatus,
            groups_count: 0,
            students_count: 0,
          })
          .select()
          .maybeSingle();

        if (insertError) {
          console.warn("Supabase insert error:", insertError);
        }

        const newId = inserted?.id || `local_${Date.now()}`;

        localStorage.setItem(
          `homework_student_meta_${newId}`,
          JSON.stringify({ phone, parentPhone, group }),
        );
        localStorage.setItem(
          `homework_student_meta_${username}`,
          JSON.stringify({ phone, parentPhone, group }),
        );

        const newStudentObj: Student = {
          id: newId,
          firstName,
          lastName,
          username,
          password,
          group,
          phone,
          parentPhone,
          status,
        };

        setStudents((previous) => [newStudentObj, ...previous]);
      }

      closeModal();
    } catch (saveErr) {
      console.error("Saqlash xatosi:", saveErr);
      setError("Ma’lumotlarni saqlashda xatolik yuz berdi!");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteStudent = async (id: string | number) => {
    const confirmed = window.confirm(
      "Ushbu o‘quvchini nofaol qilish yoki o‘chirishni tasdiqlaysizmi?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await supabase
        .from("users")
        .update({ status: "Nofaol" })
        .eq("id", id);
    } catch (err) {
      console.warn("Status update error:", err);
    }

    setStudents((previous) =>
      previous.filter((student) => student.id !== id),
    );
  };

  const toggleStatus = async (student: Student) => {
    const newStatus: StudentStatus =
      student.status === "active" ? "blocked" : "active";
    const dbStatus = newStatus === "active" ? "Faol" : "Nofaol";

    try {
      await supabase
        .from("users")
        .update({ status: dbStatus })
        .eq("id", student.id);
    } catch (err) {
      console.warn("Status toggle error:", err);
    }

    setStudents((previous) =>
      previous.map((s) =>
        s.id === student.id
          ? {
              ...s,
              status: newStatus,
            }
          : s,
      ),
    );
  };

  return (
    <section className="students-page">
      <div className="students-header">
        <div>
          <h1 className="students-title">O‘quvchilar</h1>
          <p className="students-description">
            O‘quvchilarni yarating, tahrirlang va Supabase bazasi bilan boshqaring.
          </p>
        </div>

        <button
          className="students-primary-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          O‘quvchi qo‘shish
        </button>
      </div>

      <div className="students-toolbar">
        <div className="students-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="O‘quvchi qidirish..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <span className="students-count">
          Jami: {filteredStudents.length} ta
        </span>
      </div>

      {isLoading ? (
        <div className="students-empty">
          <p>O‘quvchilar yuklanmoqda...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="students-empty">
          <UserRound size={42} />
          <h3>O‘quvchilar topilmadi</h3>
          <p>
            Qidiruv so‘zini o‘zgartiring yoki yangi o‘quvchi qo‘shing.
          </p>
        </div>
      ) : (
        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>O‘quvchi</th>
                <th>Telefon</th>
                <th>Guruh</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-name">
                      <div className="student-avatar">
                        {student.firstName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {student.firstName} {student.lastName}
                        </strong>

                        <span>@{student.username}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="student-contact">
                      <span>
                        <Phone size={14} />
                        {student.phone || "Kiritilmagan"}
                      </span>

                      {student.parentPhone && (
                        <small>Ota-onasi: {student.parentPhone}</small>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className="student-badge">{student.group}</span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className={`student-status ${student.status}`}
                      onClick={() => void toggleStatus(student)}
                      title="Holatni o‘zgartirish"
                    >
                      {student.status === "active" ? "Faol" : "Bloklangan"}
                    </button>
                  </td>

                  <td>
                    <div className="student-actions">
                      <button
                        type="button"
                        className="student-action-button"
                        onClick={() => openEditModal(student)}
                        title="Tahrirlash"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        type="button"
                        className="student-action-button delete"
                        onClick={() => void deleteStudent(student.id)}
                        title="O‘chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div
          className="students-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="students-modal">
            <div className="students-modal-header">
              <h2>
                {editingStudent ? "O‘quvchini tahrirlash" : "Yangi o‘quvchi"}
              </h2>

              <button
                type="button"
                className="students-close-button"
                onClick={closeModal}
              >
                <X size={18} />
              </button>
            </div>

            <form className="students-form" onSubmit={handleSubmit}>
              <div className="students-form-grid">
                <label>
                  Ism *
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(event) =>
                      handleChange("firstName", event.target.value)
                    }
                    placeholder="Ism"
                    required
                  />
                </label>

                <label>
                  Familiya *
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(event) =>
                      handleChange("lastName", event.target.value)
                    }
                    placeholder="Familiya"
                    required
                  />
                </label>

                <label>
                  Username (Login) *
                  <input
                    type="text"
                    value={form.username}
                    onChange={(event) =>
                      handleChange("username", event.target.value)
                    }
                    placeholder="Login (masalan: azizbek01)"
                    disabled={editingStudent !== null}
                    required
                  />
                </label>

                <label>
                  Parol *
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      handleChange("password", event.target.value)
                    }
                    placeholder="Parol (kamida 5 belgi)"
                    required
                  />
                </label>

                <label>
                  Guruh *
                  <select
                    value={form.group}
                    onChange={(event) =>
                      handleChange("group", event.target.value)
                    }
                    required
                  >
                    <option value="">Guruhni tanlang</option>
                    {groupOptions.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Holat
                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleChange(
                        "status",
                        event.target.value as StudentStatus,
                      )
                    }
                  >
                    <option value="active">Faol</option>
                    <option value="blocked">Bloklangan</option>
                  </select>
                </label>

                <label>
                  Telefon raqami
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(event) =>
                      handleChange("phone", event.target.value)
                    }
                    placeholder="+998 90 123 45 67"
                  />
                </label>

                <label>
                  Ota-onasi telefoni
                  <input
                    type="text"
                    value={form.parentPhone}
                    onChange={(event) =>
                      handleChange("parentPhone", event.target.value)
                    }
                    placeholder="+998 91 111 22 33"
                  />
                </label>
              </div>

              {error && <p className="students-error">{error}</p>}

              <div className="students-modal-actions">
                <button
                  type="button"
                  className="students-secondary-button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  className="students-primary-button"
                  disabled={isSaving}
                >
                  {isSaving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Students;