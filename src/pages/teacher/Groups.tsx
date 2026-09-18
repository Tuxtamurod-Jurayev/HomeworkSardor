
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Edit,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";
import "./groups.css";

type GroupLevel =
  | "Beginner"
  | "Elementary"
  | "Pre-Intermediate"
  | "Intermediate"
  | "Upper-Intermediate"
  | "Advanced";

type Group = {
  id: string;
  name: string;
  level: GroupLevel;
  schedule: string;
  students: number;
  createdAt: string;
  teacherId: string;
};

type GroupForm = {
  name: string;
  level: GroupLevel;
  schedule: string;
};

type SupabaseGroup = {
  id: string;
  name: string;
  level: GroupLevel | null;
  schedule: string | null;
  teacher_id: string;
  created_at: string;
};

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
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [form, setForm] = useState<GroupForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return groups;
    }

    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(searchValue) ||
        group.level.toLowerCase().includes(searchValue) ||
        group.schedule.toLowerCase().includes(searchValue)
    );
  }, [groups, search]);

  const getTeacherId = async () => {
    const teacherLogin =
      sessionStorage.getItem("homework_user_login") ??
      sessionStorage.getItem("teacher_login");

    if (!teacherLogin) {
      setError("O‘qituvchi login ma’lumoti topilmadi.");
      return null;
    }

    const { data, error: teacherError } = await supabase
      .from("users")
      .select("id")
      .eq("login", teacherLogin)
      .eq("role", "teacher")
      .maybeSingle();

    if (teacherError) {
      console.error("O‘qituvchini topish xatosi:", teacherError);
      setError(teacherError.message);
      return null;
    }

    if (!data) {
      setError("O‘qituvchi bazadan topilmadi.");
      return null;
    }

    setTeacherId(data.id);
    return data.id;
  };

  const loadGroups = async (currentTeacherId?: string) => {
    setIsLoading(true);
    setError("");

    const activeTeacherId =
      currentTeacherId ?? teacherId ?? (await getTeacherId());

    if (!activeTeacherId) {
      setIsLoading(false);
      return;
    }

    const { data, error: groupsError } = await supabase
      .from("groups")
      .select("id, name, level, schedule, teacher_id, created_at")
      .eq("teacher_id", activeTeacherId)
      .order("created_at", { ascending: false });

    if (groupsError) {
      console.error("Guruhlarni yuklash xatosi:", groupsError);
      setError(groupsError.message);
      setIsLoading(false);
      return;
    }

    const formattedGroups: Group[] = (
      (data ?? []) as SupabaseGroup[]
    ).map((group) => ({
      id: group.id,
      name: group.name,
      level: group.level ?? "Beginner",
      schedule: group.schedule ?? "",
      students: 0,
      createdAt: new Date(group.created_at).toLocaleDateString(
        "uz-UZ"
      ),
      teacherId: group.teacher_id,
    }));

    setGroups(formattedGroups);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadGroups();
  }, []);

  const openCreateModal = () => {
    setEditingGroup(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
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
    setSuccess("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingGroup(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const groupName = form.name.trim();
    const schedule = form.schedule.trim();

    if (!groupName || !schedule) {
      setError("Barcha maydonlarni to‘ldiring!");
      return;
    }

    const activeTeacherId =
      teacherId ?? (await getTeacherId());

    if (!activeTeacherId) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    const duplicateGroup = groups.some(
      (group) =>
        group.name.toLowerCase() === groupName.toLowerCase() &&
        group.id !== editingGroup?.id
    );

    if (duplicateGroup) {
      setError("Bu nomdagi guruh allaqachon mavjud!");
      setIsSaving(false);
      return;
    }

    if (editingGroup) {
      const { error: updateError } = await supabase
        .from("groups")
        .update({
          name: groupName,
          level: form.level,
          schedule,
        })
        .eq("id", editingGroup.id)
        .eq("teacher_id", activeTeacherId);

      if (updateError) {
        console.error("Guruhni yangilash xatosi:", updateError);
        setError(updateError.message);
        setIsSaving(false);
        return;
      }

      setSuccess("Guruh muvaffaqiyatli yangilandi.");
    } else {
      const { error: insertError } = await supabase
        .from("groups")
        .insert({
          name: groupName,
          level: form.level,
          schedule,
          teacher_id: activeTeacherId,
          status: "Faol",
        });

      if (insertError) {
        console.error("Guruh yaratish xatosi:", insertError);
        setError(insertError.message);
        setIsSaving(false);
        return;
      }

      setSuccess("Yangi guruh muvaffaqiyatli yaratildi.");
    }

    await loadGroups(activeTeacherId);

    setIsSaving(false);
    closeModal();
  };

  const handleDelete = async (group: Group) => {
    const confirmed = window.confirm(
      `"${group.name}" guruhini o‘chirmoqchimisiz?`
    );

    if (!confirmed) {
      return;
    }

    const activeTeacherId =
      teacherId ?? (await getTeacherId());

    if (!activeTeacherId) {
      return;
    }

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("groups")
      .delete()
      .eq("id", group.id)
      .eq("teacher_id", activeTeacherId);

    if (deleteError) {
      console.error("Guruhni o‘chirish xatosi:", deleteError);
      setError(deleteError.message);
      return;
    }

    setGroups((currentGroups) =>
      currentGroups.filter((item) => item.id !== group.id)
    );

    setSuccess("Guruh muvaffaqiyatli o‘chirildi.");
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

      {error && !isModalOpen && (
        <p className="groups-form-error">{error}</p>
      )}

      {success && !isModalOpen && (
        <p className="groups-success-message">{success}</p>
      )}

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

      {isLoading ? (
        <div className="groups-empty">
          <p>Guruhlar yuklanmoqda...</p>
        </div>
      ) : filteredGroups.length > 0 ? (
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
                    onClick={() => void handleDelete(group)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <div className="group-card-content">
                <h2>{group.name}</h2>

                <span className="group-level">{group.level}</span>

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

                <p>Guruh ma’lumotlarini kiriting</p>
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
                <label htmlFor="group-name">Guruh nomi</label>

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
                <label htmlFor="group-level">Daraja</label>

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
                <p className="groups-form-error">{error}</p>
              )}

              <div className="groups-modal-actions">
                <button
                  type="button"
                  className="groups-cancel-button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  className="groups-submit-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saqlanmoqda..."
                    : editingGroup
                      ? "Saqlash"
                      : "Qo‘shish"}
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