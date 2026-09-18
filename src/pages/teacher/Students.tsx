
import { FormEvent, useMemo, useState } from "react";
import {
  Edit,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import "./students.css";

type StudentStatus = "active" | "blocked";

type Student = {
  id: number;
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

const groupOptions = [
  "IELTS Beginner",
  "English A2",
  "English B1",
  "IELTS Intermediate",
];

const initialStudents: Student[] = [
  {
    id: 1,
    firstName: "Ali",
    lastName: "Karimov",
    phone: "+998 90 123 45 67",
    username: "ali_karimov",
    password: "12345",
    group: "IELTS Beginner",
    parentPhone: "+998 91 111 22 33",
    status: "active",
  },
  {
    id: 2,
    firstName: "Madina",
    lastName: "Rahimova",
    phone: "+998 93 222 33 44",
    username: "madina_rahimova",
    password: "12345",
    group: "English A2",
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
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [error, setError] = useState("");

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
    setForm(emptyForm);
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
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.username.trim() ||
      !form.password.trim() ||
      !form.group
    ) {
      setError("Majburiy maydonlarni to‘ldiring.");
      return;
    }

    const usernameExists = students.some(
      (student) =>
        student.username.toLowerCase() === form.username.toLowerCase() &&
        student.id !== editingStudent?.id,
    );

    if (usernameExists) {
      setError("Bu username allaqachon mavjud.");
      return;
    }

    if (editingStudent) {
      setStudents((previous) =>
        previous.map((student) =>
          student.id === editingStudent.id
            ? {
                ...student,
                ...form,
              }
            : student,
        ),
      );
    } else {
      const newStudent: Student = {
        id: Date.now(),
        ...form,
      };

      setStudents((previous) => [...previous, newStudent]);
    }

    closeModal();
  };

  const deleteStudent = (id: number) => {
    const confirmed = window.confirm(
      "Ushbu o‘quvchini o‘chirishni tasdiqlaysizmi?",
    );

    if (!confirmed) {
      return;
    }

    setStudents((previous) =>
      previous.filter((student) => student.id !== id),
    );
  };

  const toggleStatus = (id: number) => {
    setStudents((previous) =>
      previous.map((student) =>
        student.id === id
          ? {
              ...student,
              status:
                student.status === "active" ? "blocked" : "active",
            }
          : student,
      ),
    );
  };

  return (
    <section className="students-page">
      <div className="students-header">
        <div>
          <h1 className="students-title">O‘quvchilar</h1>
          <p className="students-description">
            O‘quvchilarni boshqaring va ularning ma’lumotlarini tahrirlang.
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

      {filteredStudents.length === 0 ? (
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
                    </div>
                  </td>

                  <td>{student.group}</td>

                  <td>
                    <button
                      className={`student-status ${
                        student.status === "active"
                          ? "status-active"
                          : "status-blocked"
                      }`}
                      onClick={() => toggleStatus(student.id)}
                    >
                      {student.status === "active"
                        ? "Faol"
                        : "Bloklangan"}
                    </button>
                  </td>

                  <td>
                    <div className="student-actions">
                      <button
                        className="student-icon-button edit"
                        title="Tahrirlash"
                        onClick={() => openEditModal(student)}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        className="student-icon-button delete"
                        title="O‘chirish"
                        onClick={() => deleteStudent(student.id)}
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
          onClick={closeModal}
        >
          <div
            className="students-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="students-modal-header">
              <div>
                <h2>
                  {editingStudent
                    ? "O‘quvchini tahrirlash"
                    : "Yangi o‘quvchi"}
                </h2>

                <p>O‘quvchi ma’lumotlarini kiriting.</p>
              </div>

              <button
                className="students-close-button"
                onClick={closeModal}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form className="students-form" onSubmit={handleSubmit}>
              <div className="students-form-grid">
                <label>
                  Ism *
                  <input
                    value={form.firstName}
                    onChange={(event) =>
                      handleChange("firstName", event.target.value)
                    }
                    placeholder="Ism"
                  />
                </label>

                <label>
                  Familiya *
                  <input
                    value={form.lastName}
                    onChange={(event) =>
                      handleChange("lastName", event.target.value)
                    }
                    placeholder="Familiya"
                  />
                </label>

                <label>
                  Telefon
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      handleChange("phone", event.target.value)
                    }
                    placeholder="+998 90 123 45 67"
                  />
                </label>

                <label>
                  Ota-ona telefoni
                  <input
                    value={form.parentPhone}
                    onChange={(event) =>
                      handleChange("parentPhone", event.target.value)
                    }
                    placeholder="+998 90 000 00 00"
                  />
                </label>

                <label>
                  Username *
                  <input
                    value={form.username}
                    onChange={(event) =>
                      handleChange("username", event.target.value)
                    }
                    placeholder="student_username"
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
                    placeholder="Parol"
                  />
                </label>

                <label>
                  Guruh *
                  <select
                    value={form.group}
                    onChange={(event) =>
                      handleChange("group", event.target.value)
                    }
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
              </div>

              {error && (
                <p className="students-form-error">{error}</p>
              )}

              <div className="students-modal-actions">
                <button
                  className="students-cancel-button"
                  type="button"
                  onClick={closeModal}
                >
                  Bekor qilish
                </button>

                <button
                  className="students-submit-button"
                  type="submit"
                >
                  {editingStudent ? "Saqlash" : "Qo‘shish"}
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