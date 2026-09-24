
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Search,
  Users,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import "./homeworks.css";

type HomeworkStatus = "Faol" | "Yakunlangan" | "Qoralama";

type Homework = {
  id: number;
  title: string;
  teacher: string;
  group: string;
  assignedDate: string;
  status: HomeworkStatus;
  totalStudents: number;
  participatedStudents: number;
};

const initialHomeworks: Homework[] = [
  {
    id: 1,
    title: "Present Simple Practice",
    teacher: "Javohir Isakov",
    group: "Elementary A1",
    assignedDate: "18.09.2026",
    status: "Faol",
    totalStudents: 18,
    participatedStudents: 15,
  },
  {
    id: 2,
    title: "Vocabulary Test — Unit 3",
    teacher: "Javohir Isakov",
    group: "Pre-Intermediate B1",
    assignedDate: "17.09.2026",
    status: "Faol",
    totalStudents: 22,
    participatedStudents: 19,
  },
  {
    id: 3,
    title: "Past Simple Exercises",
    teacher: "Madina Karimova",
    group: "Intermediate B1",
    assignedDate: "15.09.2026",
    status: "Yakunlangan",
    totalStudents: 20,
    participatedStudents: 20,
  },
  {
    id: 4,
    title: "Reading Comprehension",
    teacher: "Aziz Toshpulatov",
    group: "Elementary A2",
    assignedDate: "14.09.2026",
    status: "Yakunlangan",
    totalStudents: 16,
    participatedStudents: 12,
  },
  {
    id: 5,
    title: "English Grammar Revision",
    teacher: "Madina Karimova",
    group: "Intermediate B1",
    assignedDate: "12.09.2026",
    status: "Qoralama",
    totalStudents: 20,
    participatedStudents: 0,
  },
];

function Homeworks() {
  const [homeworks, setHomeworks] = useState<Homework[]>(initialHomeworks);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    async function loadAllHomeworks() {
      let extraHomeworks: Homework[] = [];
      const saved = localStorage.getItem("homework_assignments");
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            extraHomeworks = list.map((item: any, idx: number) => ({
              id: typeof item.id === "number" ? item.id : 100 + idx,
              title: item.title,
              teacher: item.teacher || "O‘qituvchi",
              group: item.group || "Guruh",
              assignedDate: item.assignedDate || "Yaqinda",
              status: item.status || "Faol",
              totalStudents: 15,
              participatedStudents: 0,
            }));
          }
        } catch {
          // ignore
        }
      }

      try {
        const { data, error } = await supabase.from("assignments").select("*");
        if (!error && data && data.length > 0) {
          const dbList: Homework[] = data.map((item: any, idx: number) => ({
            id: typeof item.id === "number" ? item.id : 200 + idx,
            title: item.title,
            teacher: item.teacher_name || "O‘qituvchi",
            group: item.group_name || "Guruh",
            assignedDate: new Date(item.created_at || Date.now()).toLocaleDateString("uz-UZ"),
            status: item.status || "Faol",
            totalStudents: 15,
            participatedStudents: 0,
          }));
          extraHomeworks = [...dbList, ...extraHomeworks];
        }
      } catch {
        // ignore
      }

      if (extraHomeworks.length > 0) {
        const combined = [...extraHomeworks, ...initialHomeworks];
        const unique = Array.from(
          new Map(combined.map((h) => [h.title + h.group, h])).values(),
        );
        setHomeworks(unique);
      }
    }

    void loadAllHomeworks();
  }, []);

  const filteredHomeworks = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return homeworks.filter((homework) => {
      const matchesSearch =
        !searchValue ||
        `${homework.title} ${homework.teacher} ${homework.group}`
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        selectedStatus === "all" ||
        homework.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [homeworks, search, selectedStatus]);

  const getStatusClass = (status: HomeworkStatus) => {
    if (status === "Faol") {
      return "homework-status active";
    }

    if (status === "Yakunlangan") {
      return "homework-status completed";
    }

    return "homework-status draft";
  };

  return (
    <section className="homeworks-page">
      <div className="homeworks-header">
        <div>
          <h2 className="homeworks-title">Uyga vazifalar</h2>

          <p className="homeworks-description">
            Tizimda berilgan barcha topshiriqlarni boshqarish va
            kuzatish
          </p>
        </div>
      </div>

      <div className="homeworks-summary">
        <div className="homework-summary-card">
          <div className="homework-summary-icon purple">
            <ClipboardList size={20} />
          </div>

          <div>
            <span>Jami topshiriqlar</span>
            <strong>{homeworks.length}</strong>
          </div>
        </div>

        <div className="homework-summary-card">
          <div className="homework-summary-icon green">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Faol topshiriqlar</span>
            <strong>
              {homeworks.filter(
                (homework) => homework.status === "Faol"
              ).length}
            </strong>
          </div>
        </div>

        <div className="homework-summary-card">
          <div className="homework-summary-icon blue">
            <Users size={20} />
          </div>

          <div>
            <span>Jami ishtirokchilar</span>
            <strong>
              {homeworks.reduce(
                (total, homework) =>
                  total + homework.participatedStudents,
                0
              )}
            </strong>
          </div>
        </div>
      </div>

      <div className="homeworks-toolbar">
        <div className="homeworks-search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Topshiriq, o‘qituvchi yoki guruh..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="homeworks-status-filter"
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
        >
          <option value="all">Barcha holatlar</option>
          <option value="Faol">Faol</option>
          <option value="Yakunlangan">Yakunlangan</option>
          <option value="Qoralama">Qoralama</option>
        </select>

        <div className="homeworks-count">
          Jami: <strong>{filteredHomeworks.length}</strong>
        </div>
      </div>

      <div className="homeworks-table-card">
        {filteredHomeworks.length > 0 ? (
          <div className="homeworks-table-wrapper">
            <table className="homeworks-table">
              <thead>
                <tr>
                  <th>Topshiriq nomi</th>
                  <th>O‘qituvchi</th>
                  <th>Guruh</th>
                  <th>Berilgan sana</th>
                  <th>Holati</th>
                  <th>Talabalar</th>
                  <th>Ishtirok etgan</th>
                </tr>
              </thead>

              <tbody>
                {filteredHomeworks.map((homework) => (
                  <tr key={homework.id}>
                    <td>
                      <div className="homework-title-cell">
                        <div className="homework-icon">
                          <BookOpen size={18} />
                        </div>

                        <div className="homework-name-details">
                          <strong>{homework.title}</strong>
                          <span>ID: #{homework.id}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="homework-teacher">
                        {homework.teacher}
                      </span>
                    </td>

                    <td>
                      <span className="homework-group">
                        {homework.group}
                      </span>
                    </td>

                    <td>
                      <div className="homework-date">
                        <CalendarDays size={15} />
                        {homework.assignedDate}
                      </div>
                    </td>

                    <td>
                      <span
                        className={getStatusClass(homework.status)}
                      >
                        {homework.status}
                      </span>
                    </td>

                    <td>
                      <span className="homework-student-count">
                        {homework.totalStudents}
                      </span>
                    </td>

                    <td>
                      <div className="homework-participation">
                        <strong>
                          {homework.participatedStudents}
                        </strong>

                        <span>
                          / {homework.totalStudents}
                        </span>
                      </div>

                      <div className="homework-progress">
                        <span
                          style={{
                            width: `${
                              homework.totalStudents > 0
                                ? Math.min(
                                    100,
                                    (homework.participatedStudents /
                                      homework.totalStudents) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="homeworks-empty">
            <BookOpen size={38} />

            <h3>Topshiriq topilmadi</h3>

            <p>
              Qidiruv yoki tanlangan holat bo‘yicha natija mavjud
              emas.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Homeworks;