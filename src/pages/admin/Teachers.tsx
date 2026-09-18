
import { useMemo, useState, type FormEvent } from "react";
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
import "./teachers.css";

type TeacherStatus = "Faol" | "Nofaol";

type Teacher = {
  id: number;
  firstName: string;
  lastName: string;
  login: string;
  password: string;
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

const initialTeachers: Teacher[] = [
  {
    id: 1,
    firstName: "Javohir",
    lastName: "Isakov",
    login: "javohir",
    password: "12345",
    groups: 3,
    students: 42,
    status: "Faol",
  },
];

const emptyForm: TeacherForm = {
  firstName: "",
  lastName: "",
  login: "",
  password: "",
};

function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(
    null
  );
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const filteredTeachers = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return teachers;
    }

    return teachers.filter((teacher) =>
      `${teacher.firstName} ${teacher.lastName} ${teacher.login}`
        .toLowerCase()
        .includes(searchValue)
    );
  }, [teachers, search]);

  const openCreateModal = () => {
    setEditingTeacherId(null);
    setForm(emptyForm);
    setError("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacherId(teacher.id);

    setForm({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      login: teacher.login,
      password: teacher.password,
    });

    setError("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacherId(null);
    setForm(emptyForm);
    setError("");
    setShowPassword(false);
  };

  const handleInputChange = (
    field: keyof TeacherForm,
    value: string
  ) => {
    setForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));

    setError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const login = form.login.trim().toLowerCase();
    const password = form.password.trim();

    if (!firstName || !lastName || !login || !password) {
      setError("Barcha maydonlarni to‘ldiring.");
      return;
    }

    if (password.length < 5) {
      setError("Parol kamida 5 ta belgidan iborat bo‘lishi kerak.");
      return;
    }

    const duplicateLogin = teachers.some(
      (teacher) =>
        teacher.login.toLowerCase() === login &&
        teacher.id !== editingTeacherId
    );

    if (duplicateLogin) {
      setError("Bu login allaqachon mavjud.");
      return;
    }

    if (editingTeacherId !== null) {
      setTeachers((previousTeachers) =>
        previousTeachers.map((teacher) =>
          teacher.id === editingTeacherId
            ? {
                ...teacher,
                firstName,
                lastName,
                login,
                password,
              }
            : teacher
        )
      );
    } else {
      const newTeacher: Teacher = {
        id: Date.now(),
        firstName,
        lastName,
        login,
        password,
        groups: 0,
        students: 0,
        status: "Faol",
      };

      setTeachers((previousTeachers) => [
        ...previousTeachers,
        newTeacher,
      ]);
    }

    closeModal();
  };

  const handleDelete = (teacher: Teacher) => {
    const confirmed = window.confirm(
      `${teacher.firstName} ${teacher.lastName} o‘qituvchisini o‘chirmoqchimisiz?`
    );

    if (!confirmed) {
      return;
    }

    setTeachers((previousTeachers) =>
      previousTeachers.filter((item) => item.id !== teacher.id)
    );
  };

  const toggleStatus = (teacherId: number) => {
    setTeachers((previousTeachers) =>
      previousTeachers.map((teacher) =>
        teacher.id === teacherId
          ? {
              ...teacher,
              status: teacher.status === "Faol" ? "Nofaol" : "Faol",
            }
          : teacher
      )
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
        {filteredTeachers.length > 0 ? (
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
                            {teacher.firstName} {teacher.lastName}
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
                        onClick={() => toggleStatus(teacher.id)}
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
                          onClick={() => openEditModal(teacher)}
                          title="Tahrirlash"
                          aria-label="Tahrirlash"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          type="button"
                          className="teacher-icon-button danger"
                          onClick={() => handleDelete(teacher)}
                          title="O‘chirish"
                          aria-label="O‘chirish"
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
            <p>Qidiruv so‘rovingiz bo‘yicha natija mavjud emas.</p>
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

            <form className="teachers-form" onSubmit={handleSubmit}>
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
                        event.target.value
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
                        event.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>

              <div className="teachers-form-group">
                <label htmlFor="teacher-login">Login</label>

                <input
                  id="teacher-login"
                  type="text"
                  placeholder="O‘qituvchi logini"
                  value={form.login}
                  onChange={(event) =>
                    handleInputChange("login", event.target.value)
                  }
                  required
                />
              </div>

              <div className="teachers-form-group">
                <label htmlFor="teacher-password">Parol</label>

                <div className="teachers-password-wrapper">
                  <input
                    id="teacher-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="O‘qituvchi paroli"
                    value={form.password}
                    onChange={(event) =>
                      handleInputChange(
                        "password",
                        event.target.value
                      )
                    }
                    minLength={5}
                    required
                  />

                  <button
                    type="button"
                    className="teachers-password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
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
                <p className="teachers-form-error">{error}</p>
              )}

              <div className="teachers-modal-actions">
                <button
                  type="button"
                  className="teachers-secondary-button"
                  onClick={closeModal}
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  className="teachers-primary-button"
                >
                  {editingTeacherId !== null
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