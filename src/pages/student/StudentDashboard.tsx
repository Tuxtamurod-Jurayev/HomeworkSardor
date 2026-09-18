
import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  Play,
  RotateCcw,
  Trophy,
} from "lucide-react";

import "./student.css";

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
};

type Assignment = {
  id: number;
  title: string;
  description: string;
  subject: string;
  questions: Question[];
};

type Submission = {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  attemptNumber: number;
};

const defaultAssignments: Assignment[] = [
  {
    id: 1,
    title: "English Grammar",
    description: "Present Simple mavzusini tekshirish.",
    subject: "Ingliz tili",
    questions: [
      {
        id: 1,
        question: "She ___ to school every day.",
        options: ["go", "goes", "going", "gone"],
        correctAnswer: "goes",
      },
      {
        id: 2,
        question: "They ___ students.",
        options: ["is", "am", "are", "be"],
        correctAnswer: "are",
      },
    ],
  },
  {
    id: 2,
    title: "Vocabulary Test",
    description: "Ingliz tili so‘z boyligi bo‘yicha test.",
    subject: "Ingliz tili",
    questions: [
      {
        id: 1,
        question: "What is the meaning of 'Book'?",
        options: ["Kitob", "Qalam", "Stol", "Maktab"],
        correctAnswer: "Kitob",
      },
    ],
  },
];

function Student() {
  const [assignments, setAssignments] =
    useState<Assignment[]>(defaultAssignments);

  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const [answers, setAnswers] = useState<Record<number, string>>(
    {},
  );

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [showResult, setShowResult] = useState(false);

  const [lastScore, setLastScore] = useState(0);

  useEffect(() => {
    const savedAssignments = localStorage.getItem(
      "homework_assignments",
    );

    const savedSubmissions = localStorage.getItem(
      "homework_submissions",
    );

    if (savedAssignments) {
      try {
        setAssignments(JSON.parse(savedAssignments));
      } catch {
        setAssignments(defaultAssignments);
      }
    }

    if (savedSubmissions) {
      try {
        setSubmissions(JSON.parse(savedSubmissions));
      } catch {
        setSubmissions([]);
      }
    }
  }, []);

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

    if (
      currentQuestion <
      selectedAssignment.questions.length - 1
    ) {
      setCurrentQuestion((previousQuestion) => previousQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previousQuestion) => previousQuestion - 1);
    }
  };

  const finishAssignment = () => {
    if (!selectedAssignment) return;

    let correctAnswers = 0;

    selectedAssignment.questions.forEach((question) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers += 1;
      }
    });

    const totalQuestions = selectedAssignment.questions.length;

    const score = Math.round(
      (correctAnswers / totalQuestions) * 100,
    );

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
            Natijangiz saqlandi. Siz ushbu topshiriqni yana
            istalgan vaqtda qayta bajarishingiz mumkin.
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
            <span>Topshiriq bajarilmoqda</span>
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
              {Math.round(
                ((currentQuestion + 1) / totalQuestions) * 100,
              )}
              %
            </span>
          </div>

          <div className="student-progress-bar">
            <div
              style={{
                width: `${
                  ((currentQuestion + 1) / totalQuestions) * 100
                }%`,
              }}
            />
          </div>
        </div>

        <div className="student-question-card">
          <span className="student-question-number">
            Savol {currentQuestion + 1}
          </span>

          <h2>{currentQuestionData.question}</h2>

          <div className="student-options">
            {currentQuestionData.options.map((option) => (
              <button
                key={option}
                type="button"
                className={`student-option ${
                  answers[currentQuestionData.id] === option
                    ? "selected"
                    : ""
                }`}
                onClick={() => selectAnswer(option)}
              >
                <span>{option}</span>

                {answers[currentQuestionData.id] === option && (
                  <CheckCircle size={19} />
                )}
              </button>
            ))}
          </div>

          <div className="student-question-actions">
            <button
              type="button"
              className="student-secondary-button"
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
            >
              Oldingi
            </button>

            {isLastQuestion ? (
              <button
                type="button"
                className="student-primary-button"
                onClick={finishAssignment}
              >
                <CheckCircle size={18} />
                Yakunlash
              </button>
            ) : (
              <button
                type="button"
                className="student-primary-button"
                onClick={nextQuestion}
              >
                Keyingi
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
            O‘quvchi paneli
          </span>

          <h1>Salom, O‘quvchi!</h1>

          <p>
            O‘qituvchingiz tomonidan berilgan topshiriqlarni
            bajaring.
          </p>
        </div>

        <div className="student-header-icon">
          <BookOpen size={25} />
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
          <h2>Mavjud topshiriqlar</h2>
          <p>Topshiriqni tanlab, bajarishni boshlang.</p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="student-empty-state">
          <BookOpen size={40} />
          <h2>Hozircha topshiriqlar mavjud emas</h2>
          <p>O‘qituvchi yangi topshiriq yaratishini kuting.</p>
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
                  <BookOpen size={24} />
                </div>

                <span className="student-assignment-subject">
                  {assignment.subject}
                </span>

                <h3>{assignment.title}</h3>

                <p>{assignment.description}</p>

                <div className="student-assignment-meta">
                  <span>
                    <FileText size={15} />
                    {assignment.questions.length} ta savol
                  </span>

                  <span>
                    <RotateCcw size={15} />
                    {attemptCount} ta urinish
                  </span>
                </div>

                <button
                  type="button"
                  className="student-primary-button student-start-button"
                  onClick={() => startAssignment(assignment)}
                >
                  <Play size={17} />
                  Bajarishni boshlash
                </button>
              </div>
            );
          })}
        </div>
      )}

      {submissions.length > 0 && (
        <section className="student-history-section">
          <div className="student-section-header">
            <div>
              <h2>Mening natijalarim</h2>
              <p>Bajarilgan topshiriqlar tarixi.</p>
            </div>
          </div>

          <div className="student-history-list">
            {submissions
              .slice()
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