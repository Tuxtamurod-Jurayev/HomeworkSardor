
import { useState, type FormEvent } from "react";
import {
  Edit,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import "./groups.css";

type GroupLevel =
  | "Beginner"
  | "Elementary"
  | "Pre-Intermediate"
  | "Intermediate"
  | "Upper-Intermediate"
  | "Advanced";

type Group = {
  id: number;
  name: string;
  level: GroupLevel;
  schedule: string;
  students: number;
  createdAt: string;
};

type GroupForm = {
  name: string;
  level: GroupLevel;
  schedule: string;
};

const initialGroups: Group[] = [
  {
    id: 1,
    name: "IELTS Beginner",
    level: "Beginner",
    schedule: "Dushanba / Chorshanba / Juma",
    students: 12,
    createdAt: "18.09.2026",
  },
  {
    id: 2,
    name: "English A2",
    level: "Elementary",
    schedule: "Seshanba / Payshanba / Shanba",
    students: 18,
    createdAt: "18.09.2026",
  },
];

const emptyForm: GroupForm = {
  name: "",
  level: "Beginner",
  schedule: "",
};

const levelOptions: GroupLevel[] = [
  "Beginner",
  "Elementary",
  "Pre-Intermediate",
  "Intermediate",
  "Upper-Intermediate",
  "Advanced",
];

function Groups() {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [form, setForm] = useState<GroupForm>(emptyForm);
  const [error, setError] = useState("");

  const filteredGroups = groups.filter((group) => {
    const searchValue = search.toLowerCase().trim();

    return (
      group.name.toLowerCase().includes(searchValue) ||
      group.level.toLowerCase().includes(searchValue) ||
      group.schedule.toLowerCase().includes(searchValue)
    );
  });

  const openCreateModal = () => {
    setEditingGroup(null);
    setForm(emptyForm);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (group: Group) => {
    setEditingGroup(group);

    setForm({
      name: group.name,
      level: group.level,
      schedule: group.schedule,
    });

    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const groupName = form.name.trim();
    const schedule = form.schedule.trim();

    if (!groupName || !schedule) {
      setError("Barcha maydonlarni to‘ldiring!");
      return;
    }

    const duplicateGroup = groups.some(
      (group) =>
        group.name.toLowerCase() === groupName.toLowerCase() &&
        group.id !== editingGroup?.id
    );

    if (duplicateGroup) {
      setError("Bu nomdagi guruh allaqachon mavjud!");
      return;
    }

    if (editingGroup) {
      setGroups((currentGroups) =>
        currentGroups.map((group) =>
          group.id === editingGroup.id
            ? {
                ...group,
                name: groupName,
                level: form.level,
                schedule,
              }
            : group
        )
      );
    } else {
      const newGroup: Group = {
        id: Date.now(),
        name: groupName,
        level: form.level,
        schedule,
        students: 0,
        createdAt: new Date().toLocaleDateString("uz-UZ"),
      };

      setGroups((currentGroups) => [
        ...currentGroups,
        newGroup,
      ]);
    }

    closeModal();
  };

  const handleDelete = (group: Group) => {
    const confirmed = window.confirm(
      `"${group.name}" guruhini o‘chirmoqchimisiz?`
    );

    if (!confirmed) {
      return;
    }

    setGroups((currentGroups) =>
      currentGroups.filter((item) => item.id !== group.id)
    );
  };

  return (
    <section className="groups-page">
      <div className="groups-header">
        <div>
          <h1 className="groups-title">Guruhlar</h1>

          <p className="groups-description">
            O‘zingizga tegishli guruhlarni boshqaring
          </p>
        </div>

        <button
          type="button"
          className="groups-primary-button"
          onClick={openCreateModal}
        >
          <Plus size={18} />
          Yangi guruh
        </button>
      </div>

      <div className="groups-toolbar">
        <div className="groups-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Guruh qidirish..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="groups-count">
          Jami: <strong>{filteredGroups.length}</strong> ta guruh
        </div>
      </div>

      {filteredGroups.length > 0 ? (
        <div className="groups-grid">
          {filteredGroups.map((group) => (
            <article className="group-card" key={group.id}>
              <div className="group-card-top">
                <div className="group-card-icon">
                  <Users size={23} />
                </div>

                <div className="group-card-actions">
                  <button
                    type="button"
                    className="group-icon-button"
                    aria-label="Guruhni tahrirlash"
                    onClick={() => openEditModal(group)}
                  >
                    <Edit size={17} />
                  </button>

                  <button
                    type="button"
                    className="group-icon-button danger"
                    aria-label="Guruhni o‘chirish"
                    onClick={() => handleDelete(group)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <div className="group-card-content">
                <h2>{group.name}</h2>

                <span className="group-level">
                  {group.level}
                </span>

                <div className="group-card-details">
                  <div className="group-detail-row">
                    <span>Dars jadvali</span>
                    <strong>{group.schedule}</strong>
                  </div>

                  <div className="group-detail-row">
                    <span>O‘quvchilar</span>
                    <strong>{group.students} ta</strong>
                  </div>

                  <div className="group-detail-row">
                    <span>Yaratilgan sana</span>
                    <strong>{group.createdAt}</strong>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="groups-empty">
          <Users size={42} />

          <h2>Guruhlar topilmadi</h2>

          <p>
            Yangi guruh qo‘shing yoki qidiruvni o‘zgartiring.
          </p>
        </div>
      )}

      {isModalOpen && (
        <div
          className="groups-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="groups-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="groups-modal-title"
          >
            <div className="groups-modal-header">
              <div>
                <h2 id="groups-modal-title">
                  {editingGroup
                    ? "Guruhni tahrirlash"
                    : "Yangi guruh qo‘shish"}
                </h2>

                <p>
                  Guruh ma’lumotlarini kiriting
                </p>
              </div>

              <button
                type="button"
                className="groups-close-button"
                aria-label="Oynani yopish"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="groups-form"
              onSubmit={handleSubmit}
            >
              <div className="groups-form-group">
                <label htmlFor="group-name">
                  Guruh nomi
                </label>

                <input
                  id="group-name"
                  type="text"
                  placeholder="Masalan: English A1"
                  value={form.name}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="groups-form-group">
                <label htmlFor="group-level">
                  Daraja
                </label>

                <select
                  id="group-level"
                  value={form.level}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      level: event.target.value as GroupLevel,
                    }))
                  }
                >
                  {levelOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="groups-form-group">
                <label htmlFor="group-schedule">
                  Dars jadvali
                </label>

                <input
                  id="group-schedule"
                  type="text"
                  placeholder="Masalan: Dushanba / Chorshanba"
                  value={form.schedule}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      schedule: event.target.value,
                    }))
                  }
                  required
                />
              </div>

              {error && (
                <p className="groups-form-error">
                  {error}
                </p>
              )}

              <div className="groups-modal-actions">
                <button
                  type="button"
                  className="groups-cancel-button"
                  onClick={closeModal}
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  className="groups-submit-button"
                >
                  {editingGroup ? "Saqlash" : "Qo‘shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Groups;