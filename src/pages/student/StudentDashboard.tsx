import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  LogOut,
  Play,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import "./student.css";

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

type Assignment = {
  id: number | string;
  title: string;
  description: string;
  subject: string;
  group: string;
  questions: Question[];
};

type Submission = {
  id: number;
  assignmentId: number | string;
  assignmentTitle: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  attemptNumber: number;
};

function Student() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const studentLogin =
    sessionStorage.getItem("homework_user_login") || "";
  const studentName =
    sessionStorage.getItem("homework_user_name") ||
    studentLogin ||
    "O‘quvchi";

  const [studentGroup, setStudentGroup] = useState<string>(
    sessionStorage.getItem("homework_user_group") || "",
  );

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  useEffect(() => {
    async function loadAssignmentsData() {
      setIsLoading(true);
      let currentGroup = studentGroup;

      // 1. Agar guruh hali saqlanmagan bo'lsa, bazadan o'qiymiz
      if (!currentGroup && studentLogin) {
        try {
          const { data: userRow } = await supabase
            .from("users")
            .select("group_name")
            .eq("login", studentLogin)
            .maybeSingle();

          if (userRow?.group_name) {
            currentGroup = userRow.group_name;
            setStudentGroup(currentGroup);
            sessionStorage.setItem("homework_user_group", currentGroup);
          }
        } catch (uErr) {
          console.warn("Guruhni aniqlash xatosi:", uErr);
        }
      }

      // 2. Supabase assignments jadvalidan FAQAT ushbu guruhga tegishli topshiriqlarni yuklash
      let dbAssignments: Assignment[] = [];
      try {
        let query = supabase.from("assignments").select("*");
        if (currentGroup) {
          query = query.eq("group_name", currentGroup);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (!error && data && data.length > 0) {
          dbAssignments = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description || "Topshiriqni diqqat bilan bajaring",
            subject: item.subject || "Ingliz tili",
            group: item.group_name || "",
            questions: Array.isArray(item.questions) ? item.questions : [],
          }));
        }
      } catch (dbErr) {
        console.warn("Supabase topshiriqlarni yuklash xatosi:", dbErr);
      }

      // 3. Lokal keshdan ham FAQAT ushbu guruhga tegishli topshiriqlarni filtrlash
      let localAssignments: Assignment[] = [];
      const savedAssignments = localStorage.getItem("homework_assignments");
      if (savedAssignments) {
        try {
          const parsed = JSON.parse(savedAssignments);
          if (Array.isArray(parsed)) {
            localAssignments = parsed
              .filter((item: any) => !currentGroup || item.group === currentGroup)
              .map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description || "Topshiriqni bajaring",
                subject: item.subject || "Ingliz tili",
                group: item.group || "",
                questions: Array.isArray(item.questions) ? item.questions : [],
              }));
          }
        } catch {
          localAssignments = [];
        }
      }

      // Birlashtirish: FAQAT va FAQAT o'sha guruhga belgilangan topshiriqlar
      const allMap = new Map<string | number, Assignment>();
      [...dbAssignments, ...localAssignments].forEach((a) => {
        if (!allMap.has(a.id)) {
          if (!currentGroup || a.group === currentGroup) {
            allMap.set(a.id, a);
          }
        }
      });

      setAssignments(Array.from(allMap.values()));

      // 4. Submissions yuklash
      const savedSubmissions = localStorage.getItem(
        "homework_submissions",
      );
      if (savedSubmissions) {
        try {
          setSubmissions(JSON.parse(savedSubmissions));
        } catch {
          setSubmissions([]);
        }
      }

      setIsLoading(false);
    }

    void loadAssignmentsData();
  }, [studentGroup, studentLogin]);

  const startAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setAnswers({});
    setCurrentQuestion(0);
    setShowResult(false);
    setLastScore(0);
  };

  const closeAssignment = () => {
    setSelectedAssignment(null);
    setAnswers({});
    setCurrentQuestion(0);
    setShowResult(false);
  };

  const selectAnswer = (answer: string) => {
    const question = selectedAssignment?.questions[currentQuestion];
    if (!question) return;

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: answer,
    }));
  };

  const nextQuestion = () => {
    if (!selectedAssignment) return;
    if (currentQuestion < selectedAssignment.questions.length - 1) {
      setCurrentQuestion((previousQuestion) => previousQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previousQuestion) => previousQuestion - 1);
    }
  };

  const finishAssignment = async () => {
    if (!selectedAssignment) return;

    let correctAnswers = 0;

    selectedAssignment.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers += 1;
      }
    });

    const totalQuestions = selectedAssignment.questions.length;
    const score = totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 100;

    const previousAttempts = submissions.filter(
      (submission) =>
        submission.assignmentId === selectedAssignment.id,
    ).length;

    const newSubmission: Submission = {
      id: Date.now(),
      assignmentId: selectedAssignment.id,
      assignmentTitle: selectedAssignment.title,
      score,
      totalQuestions,
      completedAt: new Date().toLocaleString("uz-UZ"),
      attemptNumber: previousAttempts + 1,
    };

    const updatedSubmissions = [
      ...submissions,
      newSubmission,
    ];

    setSubmissions(updatedSubmissions);
    localStorage.setItem(
      "homework_submissions",
      JSON.stringify(updatedSubmissions),
    );

    // Supabase-ga saqlash
    try {
      await supabase.from("submissions").insert({
        assignment_id: typeof selectedAssignment.id === "number" ? selectedAssignment.id : null,
        assignment_title: selectedAssignment.title,
        student_login: studentLogin,
        student_name: studentName,
        score,
        total_questions: totalQuestions,
      });
    } catch (subErr) {
      console.warn("Supabase-ga topshiriq natijasini yozish xatosi:", subErr);
    }

    setLastScore(score);
    setShowResult(true);
  };

  const currentQuestionData =
    selectedAssignment?.questions[currentQuestion];

  if (selectedAssignment && showResult) {
    return (
      <div className="student-page">
        <div className="student-result-card">
          <div className="student-result-icon">
            <Trophy size={42} />
          </div>

          <h1>Topshiriq yakunlandi!</h1>
          <p>{selectedAssignment.title}</p>

          <strong className="student-result-score">
            {lastScore}%
          </strong>

          <p className="student-result-description">
            Natijangiz saqlandi. Siz ushbu topshiriqni istalgan vaqtda yana qayta bajarishingiz mumkin.
          </p>

          <div className="student-result-actions">
            <button
              type="button"
              className="student-primary-button"
              onClick={() => startAssignment(selectedAssignment)}
            >
              <RotateCcw size={18} />
              Qayta ishlash
            </button>

            <button
              type="button"
              className="student-secondary-button"
              onClick={closeAssignment}
            >
              Topshiriqlarga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedAssignment && currentQuestionData) {
    const totalQuestions = selectedAssignment.questions.length;
    const isLastQuestion = currentQuestion === totalQuestions - 1;

    return (
      <div className="student-page">
        <div className="student-test-header">
          <div>
            <span>Topshiriq bajarilmoqda • {selectedAssignment.group}</span>
            <h1>{selectedAssignment.title}</h1>
          </div>

          <button
            type="button"
            className="student-exit-button"
            onClick={closeAssignment}
          >
            Chiqish
          </button>
        </div>

        <div className="student-progress-wrapper">
          <div className="student-progress-info">
            <span>
              Savol {currentQuestion + 1} / {totalQuestions}
            </span>

            <span>
              {totalQuestions > 0
                ? Math.round(((currentQuestion + 1) / totalQuestions) * 100)
                : 0}
              %
            </span>
          </div>

          <div className="student-progress-bar">
            <div
              style={{
                width: `${
                  totalQuestions > 0
                    ? ((currentQuestion + 1) / totalQuestions) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="student-question-card">
          <span className="student-question-number">
            Savol {currentQuestion + 1}
          </span>

          <h2 className="student-question-title">
            {currentQuestionData.question}
          </h2>

          <div className="student-options-grid">
            {currentQuestionData.options.map((option, index) => {
              const isSelected =
                answers[currentQuestionData.id] === option;

              return (
                <button
                  type="button"
                  key={index}
                  className={`student-option-button ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => selectAnswer(option)}
                >
                  <span className="student-option-index">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          <div className="student-question-actions">
            <button
              type="button"
              className="student-nav-button"
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
            >
              Oldingisi
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                className="student-finish-button"
                onClick={finishAssignment}
                disabled={!answers[currentQuestionData.id]}
              >
                Yakunlash
              </button>
            ) : (
              <button
                type="button"
                className="student-next-button"
                onClick={nextQuestion}
                disabled={!answers[currentQuestionData.id]}
              >
                Keyingisi
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="student-page-header">
        <div>
          <span className="student-page-label">
            O‘quvchi paneli {studentGroup ? `• ${studentGroup}` : ""}
          </span>

          <h1>Salom, {studentName}!</h1>

          <p>
            {studentGroup
              ? `"${studentGroup}" guruhingiz uchun o‘qituvchi belgilagan topshiriqlarni bajaring.`
              : "Guruhingizga berilgan topshiriqlarni bajaring."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="student-header-icon">
            <BookOpen size={25} />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "14px",
              color: "#dc2626",
            }}
          >
            <LogOut size={16} />
            Chiqish
          </button>
        </div>
      </div>

      <div className="student-stats-grid">
        <div className="student-stat-card">
          <FileText size={22} />
          <div>
            <span>Topshiriqlar</span>
            <strong>{assignments.length}</strong>
          </div>
        </div>

        <div className="student-stat-card">
          <CheckCircle size={22} />
          <div>
            <span>Bajarilganlar</span>
            <strong>{submissions.length}</strong>
          </div>
        </div>

        <div className="student-stat-card">
          <Clock size={22} />
          <div>
            <span>Urinishlar</span>
            <strong>{submissions.length}</strong>
          </div>
        </div>
      </div>

      <div className="student-section-header">
        <div>
          <h2>Guruhingiz topshiriqlari</h2>
          <p>
            {studentGroup
              ? `Faqat "${studentGroup}" guruhi uchun berilgan vazifalar:`
              : "Topshiriqni tanlab, bajarishni boshlang:"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="student-empty-state">
          <BookOpen size={40} />
          <h2>Topshiriqlar yuklanmoqda...</h2>
        </div>
      ) : assignments.length === 0 ? (
        <div className="student-empty-state">
          <BookOpen size={40} />
          <h2>Hozircha guruhingiz uchun topshiriqlar mavjud emas</h2>
          <p>
            {studentGroup
              ? `O‘qituvchi "${studentGroup}" guruhi uchun yangi topshiriq tayinlaganda bu yerda paydo bo‘ladi.`
              : "Sizga hali guruh biriktirilmagan yoki o‘qituvchi yangi topshiriq bermagan."}
          </p>
        </div>
      ) : (
        <div className="student-assignments-grid">
          {assignments.map((assignment) => {
            const attemptCount = submissions.filter(
              (submission) =>
                submission.assignmentId === assignment.id,
            ).length;

            return (
              <div
                className="student-assignment-card"
                key={assignment.id}
              >
                <div className="student-assignment-icon">
                  <FileText size={22} />
                </div>

                <div className="student-assignment-content">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3>{assignment.title}</h3>
                    <span className="student-badge">
                      {assignment.group}
                    </span>
                  </div>

                  <p>{assignment.description}</p>

                  <div className="student-assignment-meta">
                    <span>
                      {assignment.questions.length} ta savol
                    </span>
                    <span>•</span>
                    <span>{attemptCount} ta urinish</span>
                  </div>

                  <button
                    type="button"
                    className="student-start-button"
                    onClick={() => startAssignment(assignment)}
                  >
                    <Play size={16} />
                    {attemptCount > 0 ? "Qayta ishlash" : "Boshlash"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {submissions.length > 0 && (
        <section className="student-history-section">
          <h2>Oxirgi natijalar</h2>

          <div className="student-history-list">
            {submissions
              .slice(-5)
              .reverse()
              .map((submission) => (
                <div
                  className="student-history-item"
                  key={submission.id}
                >
                  <div>
                    <h3>{submission.assignmentTitle}</h3>

                    <span>
                      Urinish {submission.attemptNumber} •{" "}
                      {submission.completedAt}
                    </span>
                  </div>

                  <strong>{submission.score}%</strong>
                </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Student;