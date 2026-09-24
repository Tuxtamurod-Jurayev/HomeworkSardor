
import { useMemo, useState, type FormEvent } from "react";
import {
  Edit,
  Eye,
  EyeOff,
  Search,
  UserRound,
  X,
} from "lucide-react";
import "./Students.css";

type StudentStatus = "Faol" | "Nofaol";

type Student = {
  id: number;
  firstName: string;
  lastName: string;
  login: string;
  password: string;
  groupName: string;
  lastLogin: string;
  totalPoints: number;
  completedTasks: number;
  totalTasks: number;
  status: StudentStatus;
};

type StudentForm = {
  firstName: string;
  lastName: string;
  password: string;
};

const initialStudents: Student[] = [
  {
    id: 1,
    firstName: "Muhammad",
    lastName: "Aliyev",
    login: "muhammad01",
    password: "12345",
    groupName: "Elementary A1",
    lastLogin: "Bugun, 09:30",
    totalPoints: 85,
    completedTasks: 12,
    totalTasks: 15,
    status: "Faol",
  },
  {
    id: 2,
    firstName: "Madina",
    lastName: "Karimova",
    login: "madina02",
    password: "12345",
    groupName: "Elementary A1",
    lastLogin: "Kecha, 18:45",
    totalPoints: 92,
    completedTasks: 14,
    totalTasks: 15,
    status: "Faol",
  },
  {
    id: 3,
    firstName: "Aziz",
    lastName: "Toshpulatov",
    login: "aziz03",
    password: "12345",
    groupName: "Pre-Intermediate B1",
    lastLogin: "15.09.2026, 16:20",
    totalPoints: 68,
    completedTasks: 9,
    totalTasks: 15,
    status: "Faol",
  },
  {
    id: 4,
    firstName: "Sevinch",
    lastName: "Abdullayeva",
    login: "sevinch04",
    password: "12345",
    groupName: "Intermediate B1",
    lastLogin: "Hech qachon",
    totalPoints: 0,
    completedTasks: 0,
    totalTasks: 15,
    status: "Nofaol",
  },
];

const emptyForm: StudentForm = {
  firstName: "",
  lastName: "",
  password: "",
};

function Students() {
  const [students, setStudents] = useState<Student[]>(
    initialStudents
  );

  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<
    number | null
  >(null);

  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const groups = useMemo(() => {
    return Array.from(
      new Set(students.map((student) => student.groupName))
    );
  }, [students]);

  const filteredStudents = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return students.filter((student) => {
      const matchesSearch =
        !searchValue ||
        `${student.firstName} ${student.lastName} ${student.login}`
          .toLowerCase()
          .includes(searchValue);

      const matchesGroup =
        selectedGroup === "all" ||
        student.groupName === selectedGroup;

      return matchesSearch && matchesGroup;
    });
  }, [students, search, selectedGroup]);

  const openEditModal = (student: Student) => {
    setEditingStudentId(student.id);

    setForm({
      firstName: student.firstName,
      lastName: student.lastName,
      password: student.password,
    });

    setError("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudentId(null);
    setForm(emptyForm);
    setError("");
    setShowPassword(false);
  };

  const handleInputChange = (
    field: keyof StudentForm,
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

    if (editingStudentId === null) {
      return;
    }

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const password = form.password.trim();

    if (!firstName || !lastName || !password) {
      setError("Ism, familiya va parolni to‘ldiring.");
      return;
    }

    if (password.length < 5) {
      setError("Parol kamida 5 ta belgidan iborat bo‘lishi kerak.");
      return;
    }

    setStudents((previousStudents) =>
      previousStudents.map((student) =>
        student.id === editingStudentId
          ? {
              ...student,
              firstName,
              lastName,
              password,
            }
          : student
      )
    );

    closeModal();
  };

  const toggleStatus = (studentId: number) => {
    setStudents((previousStudents) =>
      previousStudents.map((student) =>
        student.id === studentId
          ? {
              ...student,
              status:
                student.status === "Faol" ? "Nofaol" : "Faol",
            }
          : student
      )
    );
  };

  return (
    <section className="students-page">
      <div className="students-header">
        <div>
          <h2 className="students-title">O‘quvchilar</h2>

          <p className="students-description">
            Tizimga qo‘shilgan o‘quvchilarni kuzatish va boshqarish
          </p>
        </div>
      </div>

      <div className="students-toolbar">
        <div className="students-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="O‘quvchi qidirish..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="students-group-filter"
          value={selectedGroup}
          onChange={(event) => setSelectedGroup(event.target.value)}
        >
          <option value="all">Barcha guruhlar</option>

          {groups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>

        <div className="students-count">
          Jami: <strong>{filteredStudents.length}</strong>
        </div>
      </div>

      <div className="students-table-card">
        {filteredStudents.length > 0 ? (
          <div className="students-table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>O‘quvchi</th>
                  <th>Guruh</th>
                  <th>Oxirgi kirish</th>
                  <th>Topshiriqlar</th>
                  <th>Ball</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-user">
                        <div className="student-avatar">
                          <UserRound size={18} />
                        </div>

                        <div className="student-user-details">
                          <strong>
                            {student.firstName} {student.lastName}
                          </strong>

                          <span>{student.login}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="student-group-name">
                        {student.groupName}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          student.lastLogin === "Hech qachon"
                            ? "student-never-login"
                            : "student-last-login"
                        }
                      >
                        {student.lastLogin}
                      </span>
                    </td>

                    <td>
                      <div className="student-tasks">
                        <strong>{student.completedTasks}</strong>
                        <span>/{student.totalTasks}</span>
                      </div>
                    </td>

                    <td>
                      <span className="student-points">
                        {student.totalPoints}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`student-status ${
                          student.status === "Faol"
                            ? "active"
                            : "inactive"
                        }`}
                        onClick={() => toggleStatus(student.id)}
                        title="Holatni o‘zgartirish"
                      >
                        {student.status}
                      </button>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="student-edit-button"
                        onClick={() => openEditModal(student)}
                        title="Ism, familiya va parolni tahrirlash"
                        aria-label="O‘quvchini tahrirlash"
                      >
                        <Edit size={16} />
                        Tahrirlash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="students-empty">
            <UserRound size={36} />

            <h3>O‘quvchi topilmadi</h3>

            <p>
              Qidiruv yoki guruh filtri bo‘yicha natija mavjud emas.
            </p>
          </div>
        )}
      </div>

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
              <div>
                <h3>O‘quvchini tahrirlash</h3>

                <p>
                  Faqat ism, familiya va parolni o‘zgartirish mumkin
                </p>
              </div>

              <button
                type="button"
                className="students-close-button"
                onClick={closeModal}
                aria-label="Modalni yopish"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="students-form"
              onSubmit={handleSubmit}
            >
              <div className="students-form-group">
                <label htmlFor="student-first-name">Ism</label>

                <input
                  id="student-first-name"
                  type="text"
                  placeholder="O‘quvchi ismi"
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

              <div className="students-form-group">
                <label htmlFor="student-last-name">
                  Familiya
                </label>

                <input
                  id="student-last-name"
                  type="text"
                  placeholder="O‘quvchi familiyasi"
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

              <div className="students-form-group">
                <label htmlFor="student-password">Yangi parol</label>

                <div className="students-password-wrapper">
                  <input
                    id="student-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="O‘quvchi paroli"
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
                    className="students-password-toggle"
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
                <p className="students-form-error">{error}</p>
              )}

              <div className="students-modal-actions">
                <button
                  type="button"
                  className="students-secondary-button"
                  onClick={closeModal}
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  className="students-primary-button"
                >
                  Saqlash
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