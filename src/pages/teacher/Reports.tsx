
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronDown,
  Clock,
  Download,
  TrendingUp,
  Users,
} from "lucide-react";
import "./reports.css";

interface GroupReport {
  id: number;
  name: string;
  students: number;
  completed: number;
  average: number;
}

interface AssignmentReport {
  id: number;
  title: string;
  group: string;
  completed: number;
  total: number;
  average: number;
}

const groupReports: GroupReport[] = [
  {
    id: 1,
    name: "Elementary A1",
    students: 18,
    completed: 15,
    average: 84,
  },
  {
    id: 2,
    name: "Pre-Intermediate A2",
    students: 22,
    completed: 18,
    average: 78,
  },
  {
    id: 3,
    name: "Intermediate B1",
    students: 16,
    completed: 13,
    average: 91,
  },
  {
    id: 4,
    name: "Upper-Intermediate B2",
    students: 20,
    completed: 16,
    average: 87,
  },
];

const assignmentReports: AssignmentReport[] = [
  {
    id: 1,
    title: "Unit 1 Vocabulary",
    group: "Elementary A1",
    completed: 15,
    total: 18,
    average: 84,
  },
  {
    id: 2,
    title: "Grammar Test",
    group: "Pre-Intermediate A2",
    completed: 18,
    total: 22,
    average: 78,
  },
  {
    id: 3,
    title: "Reading Practice",
    group: "Intermediate B1",
    completed: 13,
    total: 16,
    average: 91,
  },
  {
    id: 4,
    title: "Speaking Task",
    group: "Upper-Intermediate B2",
    completed: 16,
    total: 20,
    average: 87,
  },
];

const periods = [
  { value: "all", label: "Barcha vaqt" },
  { value: "week", label: "Oxirgi 7 kun" },
  { value: "month", label: "Oxirgi 30 kun" },
  { value: "year", label: "Bu yil" },
];

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");

  const totalStudents = groupReports.reduce(
    (sum, group) => sum + group.students,
    0
  );

  const totalCompleted = groupReports.reduce(
    (sum, group) => sum + group.completed,
    0
  );

  const totalAssignments = assignmentReports.length;

  const averageResult = Math.round(
    groupReports.reduce(
      (sum, group) => sum + group.average,
      0
    ) / groupReports.length
  );

  const filteredGroups =
    selectedGroup === "all"
      ? groupReports
      : groupReports.filter(
          (group) => group.name === selectedGroup
        );

  const filteredAssignments =
    selectedGroup === "all"
      ? assignmentReports
      : assignmentReports.filter(
          (assignment) => assignment.group === selectedGroup
        );

  const completionPercentage = Math.round(
    (totalCompleted / totalStudents) * 100
  );

  const exportReport = () => {
    const reportText = [
      "HOMEWORK — HISOBOT",
      `Davr: ${
        periods.find((period) => period.value === selectedPeriod)
          ?.label
      }`,
      `O‘quvchilar: ${totalStudents}`,
      `Guruhlar: ${groupReports.length}`,
      `Topshiriqlar: ${totalAssignments}`,
      `O‘rtacha natija: ${averageResult}%`,
      "",
      "GURUHLAR:",
      ...filteredGroups.map(
        (group) =>
          `${group.name}: ${group.average}% — ${group.completed}/${group.students}`
      ),
    ].join("\n");

    const blob = new Blob([reportText], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "homework-hisobot.txt";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <span className="reports-label">
            O‘qituvchi paneli
          </span>

          <h1>Hisobotlar</h1>

          <p>
            Guruhlar va o‘quvchilar natijalarini kuzating
          </p>
        </div>

        <button
          className="reports-export-btn"
          onClick={exportReport}
        >
          <Download size={18} />
          Hisobotni yuklash
        </button>
      </div>

      <div className="reports-filters">
        <div className="reports-filter">
          <label htmlFor="report-period">Davr</label>

          <div className="reports-select-wrapper">
            <select
              id="report-period"
              value={selectedPeriod}
              onChange={(event) =>
                setSelectedPeriod(event.target.value)
              }
            >
              {periods.map((period) => (
                <option
                  key={period.value}
                  value={period.value}
                >
                  {period.label}
                </option>
              ))}
            </select>

            <ChevronDown size={16} />
          </div>
        </div>

        <div className="reports-filter">
          <label htmlFor="report-group">Guruh</label>

          <div className="reports-select-wrapper">
            <select
              id="report-group"
              value={selectedGroup}
              onChange={(event) =>
                setSelectedGroup(event.target.value)
              }
            >
              <option value="all">Barcha guruhlar</option>

              {groupReports.map((group) => (
                <option key={group.id} value={group.name}>
                  {group.name}
                </option>
              ))}
            </select>

            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <div className="reports-stat-grid">
        <div className="report-stat-card">
          <div className="report-stat-icon purple">
            <Users size={22} />
          </div>

          <div>
            <span>O‘quvchilar</span>
            <strong>{totalStudents}</strong>
            <small>Jami o‘quvchilar</small>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon blue">
            <BookOpen size={22} />
          </div>

          <div>
            <span>Guruhlar</span>
            <strong>{groupReports.length}</strong>
            <small>Faol guruhlar</small>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon green">
            <CheckCircle size={22} />
          </div>

          <div>
            <span>Topshiriqlar</span>
            <strong>{totalAssignments}</strong>
            <small>Yaratilgan topshiriqlar</small>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon orange">
            <TrendingUp size={22} />
          </div>

          <div>
            <span>O‘rtacha natija</span>
            <strong>{averageResult}%</strong>
            <small>Guruhlar bo‘yicha</small>
          </div>
        </div>
      </div>

      <div className="reports-main-grid">
        <section className="reports-card">
          <div className="reports-card-header">
            <div>
              <h2>Guruhlar natijalari</h2>
              <p>Har bir guruhning umumiy ko‘rsatkichi</p>
            </div>

            <BarChart3 size={21} />
          </div>

          <div className="group-reports-list">
            {filteredGroups.map((group) => {
              const percentage = Math.round(
                (group.completed / group.students) * 100
              );

              return (
                <div className="group-report-item" key={group.id}>
                  <div className="group-report-top">
                    <div>
                      <h3>{group.name}</h3>
                      <p>{group.students} ta o‘quvchi</p>
                    </div>

                    <strong>{group.average}%</strong>
                  </div>

                  <div className="report-progress">
                    <div
                      className="report-progress-value"
                      style={{ width: `${group.average}%` }}
                    />
                  </div>

                  <div className="group-report-bottom">
                    <span>
                      {group.completed}/{group.students} topshiriq
                    </span>

                    <span>{percentage}% bajarilgan</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="reports-card">
          <div className="reports-card-header">
            <div>
              <h2>Umumiy faollik</h2>
              <p>Topshiriqlar bajarilishi</p>
            </div>

            <Clock size={21} />
          </div>

          <div className="activity-circle">
            <div className="activity-circle-inner">
              <strong>{completionPercentage}%</strong>
              <span>Bajarilgan</span>
            </div>
          </div>

          <div className="activity-details">
            <div>
              <span className="activity-dot completed" />
              <p>Bajarilgan topshiriqlar</p>
              <strong>{totalCompleted}</strong>
            </div>

            <div>
              <span className="activity-dot remaining" />
              <p>Kutilayotgan topshiriqlar</p>
              <strong>{totalStudents - totalCompleted}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="reports-card assignments-report-card">
        <div className="reports-card-header">
          <div>
            <h2>Topshiriqlar hisoboti</h2>
            <p>Topshiriqlar bo‘yicha o‘rtacha natijalar</p>
          </div>

          <BookOpen size={21} />
        </div>

        <div className="assignments-report-table-wrapper">
          <table className="assignments-report-table">
            <thead>
              <tr>
                <th>Topshiriq nomi</th>
                <th>Guruh</th>
                <th>Bajarilgan</th>
                <th>O‘rtacha natija</th>
                <th>Holat</th>
              </tr>
            </thead>

            <tbody>
              {filteredAssignments.map((assignment) => {
                const percentage = Math.round(
                  (assignment.completed / assignment.total) * 100
                );

                return (
                  <tr key={assignment.id}>
                    <td>
                      <strong>{assignment.title}</strong>
                    </td>

                    <td>{assignment.group}</td>

                    <td>
                      {assignment.completed}/{assignment.total}
                    </td>

                    <td>
                      <span className="assignment-average">
                        {assignment.average}%
                      </span>
                    </td>

                    <td>
                      <span
                        className={`assignment-status ${
                          percentage >= 80
                            ? "status-success"
                            : "status-warning"
                        }`}
                      >
                        {percentage >= 80
                          ? "Yaxshi"
                          : "Jarayonda"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}