import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Edit,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import "./Teachers.css";

type TeacherStatus = "Faol" | "Nofaol";

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  login: string;
  groups: number;
  students: number;
  status: TeacherStatus;
};

type TeacherForm = {
  firstName: string;
  lastName: string;
  login: string;
  password: string;
};

type SupabaseTeacher = {
  id: string;
  login: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  status: TeacherStatus | null;
  groups_count: number | null;
  students_count: number | null;
};

const emptyForm: TeacherForm = {
  firstName: "",
  lastName: "",
  login: "",
  password: "",
};

function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(
    null,
  );

  const [form, setForm] = useState<TeacherForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const filteredTeachers = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return teachers;
    }

    return teachers.filter((teacher) =>
      `${teacher.firstName} ${teacher.lastName} ${teacher.login}`
        .toLowerCase()
        .includes(searchValue),
    );
  }, [teachers, search]);

  const loadTeachers = async () => {
    setIsLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("users")
      .select(
        "id, login, first_name, last_name, full_name, status, groups_count, students_count",
      )
      .eq("role", "teacher")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("O‘qituvchilarni yuklash xatosi:", fetchError);
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    const formattedTeachers: Teacher[] = (
      (data ?? []) as SupabaseTeacher[]
    ).map((teacher) => ({
      id: teacher.id,
      firstName:
        teacher.first_name ??
        teacher.full_name?.split(" ")[0] ??
        "",
      lastName:
        teacher.last_name ??
        teacher.full_name?.split(" ").slice(1).join(" ") ??
        "",
      login: teacher.login,
      groups: teacher.groups_count ?? 0,
      students: teacher.students_count ?? 0,
      status: teacher.status ?? "Faol",
    }));

    setTeachers(formattedTeachers);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadTeachers();
  }, []);

  const openCreateModal = () => {
    setEditingTeacherId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacherId(teacher.id);

    setForm({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      login: teacher.login,
      password: "",
    });

    setError("");
    setSuccess("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingTeacherId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowPassword(false);
  };

  const handleInputChange = (
    field: keyof TeacherForm,
    value: string,
  ) => {
    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));

    setError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const login = form.login.trim().toLowerCase();
    const password = form.password.trim();

    if (!firstName || !lastName || !login) {
      setError("Ism, familiya va loginni to‘ldiring.");
      return;
    }

    if (editingTeacherId === null && !password) {
      setError("O‘qituvchi parolini kiriting.");
      return;
    }

    if (editingTeacherId === null && password.length < 5) {
      setError("Parol kamida 5 ta belgidan iborat bo‘lishi kerak.");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    const { data: existingTeacher, error: duplicateError } =
      await supabase
        .from("users")
        .select("id")
        .eq("login", login)
        .maybeSingle();

    if (duplicateError) {
      console.error("Login tekshirish xatosi:", duplicateError);
      setError(duplicateError.message);
      setIsSaving(false);
      return;
    }

    if (
      existingTeacher &&
      existingTeacher.id !== editingTeacherId
    ) {
      setError("Bu login allaqachon mavjud.");
      setIsSaving(false);
      return;
    }

    const fullName = `${firstName} ${lastName}`;

    // YANGI O‘QITUVCHI
    if (editingTeacherId === null) {
      const { error: insertError } = await supabase
        .from("users")
        .insert({
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          login,
          password,
          role: "teacher",
          status: "Faol",
          groups_count: 0,
          students_count: 0,
        });

      if (insertError) {
        console.error(
          "O‘qituvchini yaratish xatosi:",
          insertError,
        );

        setError(insertError.message);
        setIsSaving(false);
        return;
      }

      setSuccess("Yangi o‘qituvchi yaratildi.");
    } else {
      // TAHRIRLASH
      const updateData: {
        first_name: string;
        last_name: string;
        full_name: string;
        password?: string;
      } = {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
      };

      if (password) {
        if (password.length < 5) {
          setError(
            "Parol kamida 5 ta belgidan iborat bo‘lishi kerak.",
          );
          setIsSaving(false);
          return;
        }

        updateData.password = password;
      }

      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", editingTeacherId)
        .eq("role", "teacher");

      if (updateError) {
        console.error(
          "O‘qituvchini yangilash xatosi:",
          updateError,
        );

        setError(updateError.message);
        setIsSaving(false);
        return;
      }

      setSuccess("O‘qituvchi ma’lumotlari yangilandi.");
    }

    await loadTeachers();

    setIsSaving(false);
    setIsModalOpen(false);
    setEditingTeacherId(null);
    setForm(emptyForm);
    setShowPassword(false);
  };

  const handleDelete = async (teacher: Teacher) => {
    const confirmed = window.confirm(
      `${teacher.firstName} ${teacher.lastName} o‘qituvchisini nofaol qilishni xohlaysizmi?`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("users")
      .update({
        status: "Nofaol",
      })
      .eq("id", teacher.id)
      .eq("role", "teacher");

    if (updateError) {
      console.error(
        "O‘qituvchini nofaol qilish xatosi:",
        updateError,
      );

      setError(updateError.message);
      return;
    }

    await loadTeachers();

    setSuccess(
      `${teacher.firstName} ${teacher.lastName} o‘qituvchisi nofaol qilindi.`,
    );
  };

  const toggleStatus = async (teacher: Teacher) => {
    const newStatus: TeacherStatus =
      teacher.status === "Faol" ? "Nofaol" : "Faol";

    const { error: updateError } = await supabase
      .from("users")
      .update({
        status: newStatus,
      })
      .eq("id", teacher.id)
      .eq("role", "teacher");

    if (updateError) {
      console.error(
        "Holatni o‘zgartirish xatosi:",
        updateError,
      );

      setError(updateError.message);
      return;
    }

    setTeachers((previousTeachers) =>
      previousTeachers.map((item) =>
        item.id === teacher.id
          ? {
              ...item,
              status: newStatus,
            }
          : item,
      ),
    );

    setSuccess(
      `${teacher.firstName} ${teacher.lastName} holati "${newStatus}" qilindi.`,
    );
  };

  return (
    <section className="teachers-page">
      <div className="teachers-header">
        <div>
          <h2 className="teachers-title">O‘qituvchilar</h2>

          <p className="teachers-description">
            O‘qituvchilarni yaratish va boshqarish
          </p>
        </div>

        <button
          type="button"
          className="teachers-primary-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          O‘qituvchi qo‘shish
        </button>
      </div>

      {error && !isModalOpen && (
        <p className="teachers-form-error">{error}</p>
      )}

      {success && !isModalOpen && (
        <p className="teachers-success-message">{success}</p>
      )}

      <div className="teachers-toolbar">
        <div className="teachers-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="O‘qituvchi qidirish..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="teachers-count">
          Jami: <strong>{filteredTeachers.length}</strong>
        </div>
      </div>

      <div className="teachers-table-card">
        {isLoading ? (
          <div className="teachers-empty">
            <p>O‘qituvchilar yuklanmoqda...</p>
          </div>
        ) : filteredTeachers.length > 0 ? (
          <div className="teachers-table-wrapper">
            <table className="teachers-table">
              <thead>
                <tr>
                  <th>O‘qituvchi</th>
                  <th>Login</th>
                  <th>Guruhlar</th>
                  <th>O‘quvchilar</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>

              <tbody>
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      <div className="teacher-user">
                        <div className="teacher-avatar">
                          <UserRound size={19} />
                        </div>

                        <div className="teacher-user-details">
                          <strong>
                            {teacher.firstName}{" "}
                            {teacher.lastName}
                          </strong>

                          <span>English Teacher</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="teacher-login">
                        {teacher.login}
                      </span>
                    </td>

                    <td>{teacher.groups}</td>

                    <td>{teacher.students}</td>

                    <td>
                      <button
                        type="button"
                        className={`teacher-status ${
                          teacher.status === "Faol"
                            ? "active"
                            : "inactive"
                        }`}
                        onClick={() =>
                          void toggleStatus(teacher)
                        }
                        title="Holatni o‘zgartirish"
                      >
                        {teacher.status}
                      </button>
                    </td>

                    <td>
                      <div className="teacher-actions">
                        <button
                          type="button"
                          className="teacher-icon-button"
                          onClick={() =>
                            openEditModal(teacher)
                          }
                          title="Tahrirlash"
                          aria-label="Tahrirlash"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          type="button"
                          className="teacher-icon-button danger"
                          onClick={() =>
                            void handleDelete(teacher)
                          }
                          title="Nofaol qilish"
                          aria-label="Nofaol qilish"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="teachers-empty">
            <UserRound size={36} />

            <h3>O‘qituvchi topilmadi</h3>

            <p>
              Hozircha bazada o‘qituvchilar mavjud emas.
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="teachers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="teachers-modal">
            <div className="teachers-modal-header">
              <div>
                <h3>
                  {editingTeacherId !== null
                    ? "O‘qituvchini tahrirlash"
                    : "Yangi o‘qituvchi"}
                </h3>

                <p>
                  O‘qituvchi ma’lumotlarini to‘ldiring
                </p>
              </div>

              <button
                type="button"
                className="teachers-close-button"
                onClick={closeModal}
                aria-label="Modalni yopish"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="teachers-form"
              onSubmit={handleSubmit}
            >
              <div className="teachers-form-row">
                <div className="teachers-form-group">
                  <label htmlFor="teacher-first-name">
                    Ism
                  </label>

                  <input
                    id="teacher-first-name"
                    type="text"
                    placeholder="Ism"
                    value={form.firstName}
                    onChange={(event) =>
                      handleInputChange(
                        "firstName",
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div className="teachers-form-group">
                  <label htmlFor="teacher-last-name">
                    Familiya
                  </label>

                  <input
                    id="teacher-last-name"
                    type="text"
                    placeholder="Familiya"
                    value={form.lastName}
                    onChange={(event) =>
                      handleInputChange(
                        "lastName",
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="teachers-form-group">
                <label htmlFor="teacher-login">
                  Login
                </label>

                <input
                  id="teacher-login"
                  type="text"
                  placeholder="O‘qituvchi logini"
                  value={form.login}
                  onChange={(event) =>
                    handleInputChange(
                      "login",
                      event.target.value,
                    )
                  }
                  readOnly={editingTeacherId !== null}
                  required
                />
              </div>

              <div className="teachers-form-group">
                <label htmlFor="teacher-password">
                  {editingTeacherId !== null
                    ? "Yangi parol"
                    : "Parol"}
                </label>

                <div className="teachers-password-wrapper">
                  <input
                    id="teacher-password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    placeholder="Parolni kiriting"
                    value={form.password}
                    onChange={(event) =>
                      handleInputChange(
                        "password",
                        event.target.value,
                      )
                    }
                    minLength={5}
                    required={editingTeacherId === null}
                  />

                  <button
                    type="button"
                    className="teachers-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous,
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Parolni yashirish"
                        : "Parolni ko‘rsatish"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="teachers-form-error">
                  {error}
                </p>
              )}

              {success && (
                <p className="teachers-success-message">
                  {success}
                </p>
              )}

              <div className="teachers-modal-actions">
                <button
                  type="button"
                  className="teachers-secondary-button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  className="teachers-primary-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saqlanmoqda..."
                    : editingTeacherId !== null
                      ? "Saqlash"
                      : "Yaratish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Teachers;