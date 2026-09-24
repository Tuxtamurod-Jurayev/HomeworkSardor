
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  FileText,
  Headphones,
  Languages,
  Mic,
  PenLine,
  Plus,
  Save,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import "./assignments.css";

interface AssignmentType {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  translation: string;
  options: string[];
  pairs: { left: string; right: string }[];
  text: string;
  audioUrl: string;
}

const assignmentTypes: AssignmentType[] = [
  {
    id: "vocabulary",
    title: "Vocabulary",
    description: "Inglizcha so‘z va uning tarjimasini yaratish.",
    icon: <BookOpen />,
  },
  {
    id: "multiple-choice",
    title: "Multiple Choice",
    description: "1 ta to‘g‘ri va 3 ta xato javob kiritish.",
    icon: <CheckCircle />,
  },
  {
    id: "fill-blanks",
    title: "Fill in the Blanks",
    description: "Gapdagi bo‘sh joyni to‘ldirish.",
    icon: <FileText />,
  },
  {
    id: "matching",
    title: "Matching",
    description: "So‘zlar va tarjimalarni moslashtirish.",
    icon: <Languages />,
  },
  {
    id: "sentence-ordering",
    title: "Sentence Ordering",
    description: "Aralashtirilgan so‘zlardan gap tuzish.",
    icon: <FileText />,
  },
  {
    id: "translation",
    title: "Translation",
    description: "So‘z yoki gapni tarjima qilish.",
    icon: <Languages />,
  },
  {
    id: "reading",
    title: "Reading",
    description: "Matn va unga oid savollar yaratish.",
    icon: <BookOpen />,
  },
  {
    id: "listening",
    title: "Listening",
    description: "Audio asosida savollar yaratish.",
    icon: <Headphones />,
  },
  {
    id: "dictation",
    title: "Dictation",
    description: "Eshitilgan so‘z yoki gapni yozish.",
    icon: <Volume2 />,
  },
  {
    id: "writing",
    title: "Writing",
    description: "Ingliz tilida matn yozish topshirig‘i.",
    icon: <PenLine />,
  },
  {
    id: "essay",
    title: "Essay",
    description: "Insho mavzusi va talablarini yaratish.",
    icon: <FileText />,
  },
  {
    id: "speaking",
    title: "Speaking",
    description: "Ovozli javob berish uchun savol yaratish.",
    icon: <Mic />,
  },
  {
    id: "pronunciation",
    title: "Pronunciation",
    description: "So‘z talaffuzini mashq qilish.",
    icon: <Volume2 />,
  },
];

const defaultGroups = [
  "Elementary A1",
  "Pre-Intermediate A2",
  "Intermediate B1",
  "Upper-Intermediate B2",
];

const createEmptyQuestion = (id = 1): Question => ({
  id,
  question: "",
  answer: "",
  translation: "",
  options: ["", "", "", ""],
  pairs: [{ left: "", right: "" }],
  text: "",
  audioUrl: "",
});

export default function Assignments() {
  const [page, setPage] = useState<"types" | "creator">("types");

  const [selectedType, setSelectedType] =
    useState<AssignmentType | null>(null);

  const [groups, setGroups] = useState<string[]>(defaultGroups);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    async function loadGroupsFromDb() {
      try {
        const { data, error } = await supabase
          .from("groups")
          .select("name")
          .order("name", { ascending: true });

        if (!error && data && data.length > 0) {
          const groupNames = Array.from(
            new Set(data.map((g) => g.name).filter(Boolean)),
          );
          if (groupNames.length > 0) {
            setGroups(groupNames);
          }
        }
      } catch (err) {
        console.warn("Guruhlar yuklanmadi:", err);
      }
    }
    void loadGroupsFromDb();
  }, []);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] =
    useState<Question>(createEmptyQuestion());

  const [errorMessage, setErrorMessage] = useState("");

  const selectType = (type: AssignmentType) => {
    setSelectedType(type);
    setAssignmentTitle("");
    setSelectedGroup("");
    setQuestions([]);
    setCurrentQuestion(createEmptyQuestion());
    setErrorMessage("");
    setPage("creator");
  };

  const goBackToTypes = () => {
    setPage("types");
    setSelectedType(null);
    setQuestions([]);
    setErrorMessage("");
  };

  const updateQuestion = (
    field: keyof Question,
    value: string
  ) => {
    setCurrentQuestion((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrorMessage("");
  };

  const updateOption = (index: number, value: string) => {
    setCurrentQuestion((previous) => ({
      ...previous,
      options: previous.options.map((option, optionIndex) =>
        optionIndex === index ? value : option
      ),
    }));

    setErrorMessage("");
  };

  const updatePair = (
    index: number,
    field: "left" | "right",
    value: string
  ) => {
    setCurrentQuestion((previous) => ({
      ...previous,
      pairs: previous.pairs.map((pair, pairIndex) =>
        pairIndex === index
          ? { ...pair, [field]: value }
          : pair
      ),
    }));
  };

  const addPair = () => {
    setCurrentQuestion((previous) => ({
      ...previous,
      pairs: [...previous.pairs, { left: "", right: "" }],
    }));
  };

  const removePair = (index: number) => {
    setCurrentQuestion((previous) => ({
      ...previous,
      pairs: previous.pairs.filter(
        (_, pairIndex) => pairIndex !== index
      ),
    }));
  };

  const validateQuestion = () => {
    if (!selectedType) return false;

    if (selectedType.id === "vocabulary") {
      if (
        !currentQuestion.answer.trim() ||
        !currentQuestion.translation.trim()
      ) {
        setErrorMessage(
          "Inglizcha so‘z va uning tarjimasini kiriting."
        );
        return false;
      }

      return true;
    }

    if (selectedType.id === "matching") {
      const isInvalid = currentQuestion.pairs.some(
        (pair) => !pair.left.trim() || !pair.right.trim()
      );

      if (isInvalid) {
        setErrorMessage(
          "Barcha so‘z va tarjima juftliklarini to‘ldiring."
        );
        return false;
      }

      return true;
    }

    if (!currentQuestion.question.trim()) {
      setErrorMessage("Savol yoki topshiriqni kiriting.");
      return false;
    }

    if (selectedType.id === "multiple-choice") {
      if (currentQuestion.options.some((option) => !option.trim())) {
        setErrorMessage("4 ta javob variantini to‘liq kiriting.");
        return false;
      }

      if (!currentQuestion.answer.trim()) {
        setErrorMessage("To‘g‘ri javobni kiriting.");
        return false;
      }

      if (
        !currentQuestion.options.includes(currentQuestion.answer)
      ) {
        setErrorMessage(
          "To‘g‘ri javob variantlardan biriga mos bo‘lishi kerak."
        );
        return false;
      }

      return true;
    }

    if (!currentQuestion.answer.trim()) {
      setErrorMessage("To‘g‘ri javob yoki talabni kiriting.");
      return false;
    }

    return true;
  };

  const addQuestion = () => {
    if (!validateQuestion()) return;

    setQuestions((previous) => [
      ...previous,
      {
        ...currentQuestion,
        id: previous.length + 1,
      },
    ]);

    setCurrentQuestion(
      createEmptyQuestion(questions.length + 2)
    );

    setErrorMessage("");
  };

  const deleteQuestion = (id: number) => {
    setQuestions((previous) =>
      previous.filter((question) => question.id !== id)
    );
  };

  const saveAssignment = async () => {
    if (!assignmentTitle.trim()) {
      setErrorMessage("Topshiriq nomini kiriting.");
      return;
    }

    if (!selectedGroup) {
      setErrorMessage("Guruhni tanlang.");
      return;
    }

    if (questions.length === 0) {
      setErrorMessage("Kamida bitta savol qo‘shing.");
      return;
    }

    const teacherLogin =
      sessionStorage.getItem("homework_user_login") || "O‘qituvchi";
    const teacherName =
      sessionStorage.getItem("homework_user_name") || teacherLogin;

    const formattedQuestions = questions.map((q) => {
      const hasOptions = q.options && q.options.some((opt) => opt.trim());
      const generatedOptions = hasOptions
        ? q.options
        : [q.answer, "Variant B", "Variant C", "Variant D"].filter(Boolean);

      let qText = q.question.trim();
      if (!qText) {
        if (q.pairs.length > 0 && q.pairs[0].left) {
          qText = "So‘zlarni tarjimasi bilan moslashtiring";
        } else if (q.translation) {
          qText = `"${q.translation}" so‘zining to‘g‘ri inglizcha tarjimasini toping:`;
        } else {
          qText = "Topshiriq savoli";
        }
      }

      return {
        id: q.id,
        question: qText,
        options: generatedOptions,
        correctAnswer: q.answer || (q.pairs.length > 0 ? q.pairs[0].right : ""),
        translation: q.translation,
        pairs: q.pairs,
        text: q.text,
        audioUrl: q.audioUrl,
      };
    });

    const newAssignment = {
      id: Date.now(),
      title: assignmentTitle.trim(),
      description:
        selectedType?.description || "Topshiriqni diqqat bilan bajaring.",
      subject: "Ingliz tili",
      group: selectedGroup,
      type: selectedType?.id,
      assignedDate: new Date().toLocaleDateString("uz-UZ"),
      teacher: teacherName,
      questions: formattedQuestions,
      status: "Faol",
    };

    // 1. Supabase-ga saqlash (agar assignments jadvali mavjud bo'lsa)
    try {
      await supabase.from("assignments").insert({
        title: newAssignment.title,
        description: newAssignment.description,
        group_name: newAssignment.group,
        teacher_name: newAssignment.teacher,
        type: newAssignment.type,
        questions: newAssignment.questions,
        status: "Faol",
      });
    } catch (dbErr) {
      console.warn("Supabase assignments jadvaliga yozish xatosi:", dbErr);
    }

    // 2. localStorage-ga saqlash (o‘quvchi darhol ko‘rishi uchun)
    try {
      const saved = localStorage.getItem("homework_assignments");
      const existingList = saved ? JSON.parse(saved) : [];
      localStorage.setItem(
        "homework_assignments",
        JSON.stringify([newAssignment, ...existingList]),
      );
    } catch (localErr) {
      console.error("Lokal saqlash xatosi:", localErr);
    }

    alert("Topshiriq muvaffaqiyatli saqlandi va o‘quvchilarga yuborildi!");

    setPage("types");
    setSelectedType(null);
    setQuestions([]);
    setAssignmentTitle("");
    setSelectedGroup("");
    setCurrentQuestion(createEmptyQuestion());
  };

  const renderQuestionForm = () => {
    if (!selectedType) return null;

    switch (selectedType.id) {
      case "vocabulary":
        return (
          <>
            <label>Inglizcha so‘z</label>
            <input
              placeholder="apple"
              value={currentQuestion.answer}
              onChange={(event) =>
                updateQuestion("answer", event.target.value)
              }
            />

            <label>Tarjimasi</label>
            <input
              placeholder="olma"
              value={currentQuestion.translation}
              onChange={(event) =>
                updateQuestion(
                  "translation",
                  event.target.value
                )
              }
            />

            <label>Qo‘shimcha izoh</label>
            <input
              placeholder="So‘zning ma’nosini toping"
              value={currentQuestion.question}
              onChange={(event) =>
                updateQuestion("question", event.target.value)
              }
            />
          </>
        );

      case "multiple-choice":
        return (
          <>
            <label>Savol</label>
            <textarea
              placeholder="What is the opposite of hot?"
              value={currentQuestion.question}
              onChange={(event) =>
                updateQuestion("question", event.target.value)
              }
            />

            <label>Javob variantlari</label>

            {currentQuestion.options.map((option, index) => (
              <div className="answer-option" key={index}>
                <span>{index + 1}</span>

                <input
                  placeholder={
                    index === 0
                      ? "Masalan: cold"
                      : "Xato javob"
                  }
                  value={option}
                  onChange={(event) =>
                    updateOption(index, event.target.value)
                  }
                />
              </div>
            ))}

            <label>To‘g‘ri javob</label>
            <input
              placeholder="Variantlardan birini kiriting"
              value={currentQuestion.answer}
              onChange={(event) =>
                updateQuestion("answer", event.target.value)
              }
            />
          </>
        );

      case "fill-blanks":
        return (
          <>
            <label>Gap</label>
            <textarea
              placeholder="I ___ a student."
              value={currentQuestion.question}
              onChange={(event) =>
                updateQuestion("question", event.target.value)
              }
            />

            <label>To‘g‘ri javob</label>
            <input
              placeholder="am"
              value={currentQuestion.answer}
              onChange={(event) =>
                updateQuestion("answer", event.target.value)
              }
            />
          </>
        );

      case "matching":
        return (
          <>
            <label>So‘z va tarjima juftliklari</label>

            {currentQuestion.pairs.map((pair, index) => (
              <div className="matching-row" key={index}>
                <input
                  placeholder="Apple"
                  value={pair.left}
                  onChange={(event) =>
                    updatePair(index, "left", event.target.value)
                  }
                />

                <input
                  placeholder="Olma"
                  value={pair.right}
                  onChange={(event) =>
                    updatePair(index, "right", event.target.value)
                  }
                />

                {currentQuestion.pairs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePair(index)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="assignment-outline-btn"
              onClick={addPair}
            >
              <Plus size={16} />
              Juftlik qo‘shish
            </button>
          </>
        );

      case "sentence-ordering":
        return (
          <>
            <label>Aralashtirilgan so‘zlar</label>
            <input
              placeholder="student / I / am / a"
              value={currentQuestion.question}
              onChange={(event) =>
                updateQuestion("question", event.target.value)
              }
            />

            <label>To‘g‘ri gap</label>
            <input
              placeholder="I am a student."
              value={currentQuestion.answer}
              onChange={(event) =>
                updateQuestion("answer", event.target.value)
              }
            />
          </>
        );

      case "translation":
        return (
          <>
            <label>Tarjima qilinadigan gap</label>
            <textarea
              placeholder="Men maktabga boraman."
              value={currentQuestion.question}
              onChange={(event) =>
                updateQuestion("question", event.target.value)
              }
            />

            <label>To‘g‘ri tarjima</label>
            <input
              placeholder="I go to school."
              value={currentQuestion.answer}
              onChange={(event) =>
                updateQuestion("answer", event.target.value)
              }
            />
          </>
        );

      case "reading":
        return (
          <>
            <label>O‘qish matni</label>
            <textarea
              placeholder="Reading matnini kiriting..."
              value={currentQuestion.text}
              onChange={(event) =>
                updateQuestion("text", event.target.value)
              }
            />

            <label>Savol</label>
            <textarea
              placeholder="What is the text about?"
              value={currentQuestion.question}
              onChange={(event) =>
                updateQuestion("question", event.target.value)
              }
            />

            <label>To‘g‘ri javob</label>
            <input
              placeholder="Javob"
              value={currentQuestion.answer}
              onChange={(event) =>
                updateQuestion("answer", event.target.value)
              }
            />
          </>
        );

      case "listening":
        return (
          <>
            <label>Audio manzili</label>
            <input
              placeholder="Audio URL"
              value={currentQuestion.audioUrl}
              onChange={(event) =>
                updateQuestion("audioUrl", event.target.value)
              }
            />

            <label>Savol</label>
            <textarea
              placeholder="What did you hear?"
              value={currentQuestion.question}
              onChange={(event) =>
                updateQuestion("question", event.target.value)
              }
            />

            <label>To‘g‘ri javob</label>
            <input
              placeholder="Javob"
              value={currentQuestion.answer}
              onChange={(event) =>
                updateQuestion("answer", event.target.value)
              }
            />
          </>
        );

      case "dictation":
        return (
          <>
            <label>Audio yoki aytiladigan gap</label>
            <textarea
              placeholder="Dictation matni..."
              value={currentQuestion.text}
              onChange={(event) =>
                updateQuestion("text", event.target.value)
              }
            />

            <label>O‘quvchi yozishi kerak bo‘lgan javob</label>
            <input
              placeholder="Correct sentence"
              value={currentQuestion.answer}
              onChange={(event) =>
                updateQuestion("answer", event.target.value)
              }
            />

            <label>Topshiriq</label>
            <input
              placeholder="Eshitgan gapingizni yozing"
              value={currentQuestion.question}
              onChange={(event) =>
                updateQuestion("question", event.target.value)
              }
            />
          </>
        );

      case "writing":
      case "essay":
        return (
          <>
            <label>Mavzu</label>
            <textarea
              placeholder="Write about your family..."
              value={currentQuestion.question}
              onChange={(event) =>
                updateQuestion("question", event.target.value)
              }
            />

            <label>Topshiriq talablari</label>
            <textarea
              placeholder="Kamida 100 ta so‘z yozing..."
              value={currentQuestion.answer}
              onChange={(event) =>
                updateQuestion("answer", event.target.value)
              }
            />
          </>
        );

      case "speaking":
        return (
          <>
            <label>Ovozli savol</label>
            <textarea
              placeholder="Tell me about yourself."
              value={currentQuestion.question}
              onChange={(event) =>
                updateQuestion("question", event.target.value)
              }
            />

            <label>Javob berish talabi</label>
            <textarea
              placeholder="Kamida 1 daqiqa gapiring."
              value={currentQuestion.answer}
              onChange={(event) =>
                updateQuestion("answer", event.target.value)
              }
            />
          </>
        );

      case "pronunciation":
        return (
          <>
            <label>Talaffuz qilinadigan so‘z</label>
            <input
              placeholder="comfortable"
              value={currentQuestion.question}
              onChange={(event) =>
                updateQuestion("question", event.target.value)
              }
            />

            <label>To‘g‘ri talaffuz yoki IPA</label>
            <input
              placeholder="/ˈkʌmftəbəl/"
              value={currentQuestion.answer}
              onChange={(event) =>
                updateQuestion("answer", event.target.value)
              }
            />
          </>
        );

      default:
        return null;
    }
  };

  if (page === "types") {
    return (
      <div className="assignments-page">
        <div className="assignments-header">
          <div>
            <span className="page-label">O‘qituvchi paneli</span>
            <h1>Topshiriq yaratish</h1>
            <p>Yangi topshiriq turini tanlang</p>
          </div>
        </div>

        <div className="assignment-types-grid">
          {assignmentTypes.map((type) => (
            <button
              className="assignment-type-card"
              key={type.id}
              onClick={() => selectType(type)}
            >
              <div className="assignment-type-icon">
                {type.icon}
              </div>

              <div className="assignment-type-content">
                <h3>{type.title}</h3>
                <p>{type.description}</p>
              </div>

              <span className="type-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="assignments-page">
      <div className="assignments-header">
        <div>
          <button
            className="assignment-back-btn"
            onClick={goBackToTypes}
          >
            <ArrowLeft size={18} />
            Turlar ro‘yxatiga qaytish
          </button>

          <h1>{selectedType?.title}</h1>
          <p>{selectedType?.description}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="assignment-error">
          {errorMessage}
        </div>
      )}

      <div className="assignment-creator-layout">
        <section className="assignment-form-card">
          <div className="card-heading">
            <h2>Topshiriq ma’lumotlari</h2>
            <span>1</span>
          </div>

          <label>Topshiriq nomi</label>
          <input
            placeholder="Masalan: Unit 1 Vocabulary"
            value={assignmentTitle}
            onChange={(event) =>
              setAssignmentTitle(event.target.value)
            }
          />

          <label>Guruh</label>
          <select
            value={selectedGroup}
            onChange={(event) =>
              setSelectedGroup(event.target.value)
            }
          >
            <option value="">Guruhni tanlang</option>

            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          <div className="question-form-divider" />

          <div className="card-heading">
            <h2>Yangi savol qo‘shish</h2>
            <span>2</span>
          </div>

          {renderQuestionForm()}

          <button
            className="assignment-primary-btn"
            onClick={addQuestion}
          >
            <Plus size={18} />
            Savol qo‘shish
          </button>
        </section>

        <section className="assignment-questions-card">
          <div className="questions-card-header">
            <div>
              <h2>Qo‘shilgan savollar</h2>
              <p>Yaratilgan savollar ro‘yxati</p>
            </div>

            <span className="question-count">
              {questions.length} ta
            </span>
          </div>

          {questions.length === 0 ? (
            <div className="questions-empty">
              <FileText size={42} />
              <h3>Hali savollar yo‘q</h3>
              <p>
                Chap tomondagi forma orqali birinchi savolni
                qo‘shing.
              </p>
            </div>
          ) : (
            <div className="questions-list">
              {questions.map((question, index) => (
                <div
                  className="question-preview-card"
                  key={question.id}
                >
                  <div className="question-preview-top">
                    <strong>Savol {index + 1}</strong>

                    <button
                      className="delete-question-btn"
                      onClick={() =>
                        deleteQuestion(question.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {selectedType?.id === "vocabulary" ? (
                    <>
                      <p>
                        <strong>So‘z:</strong>{" "}
                        {question.answer}
                      </p>
                      <p>
                        <strong>Tarjima:</strong>{" "}
                        {question.translation}
                      </p>
                    </>
                  ) : selectedType?.id === "matching" ? (
                    question.pairs.map((pair, pairIndex) => (
                      <p key={pairIndex}>
                        {pair.left} — {pair.right}
                      </p>
                    ))
                  ) : (
                    <>
                      {question.text && (
                        <p>{question.text}</p>
                      )}

                      <p>
                        <strong>Savol:</strong>{" "}
                        {question.question}
                      </p>

                      <p>
                        <strong>Javob:</strong>{" "}
                        {question.answer}
                      </p>

                      {selectedType?.id === "multiple-choice" && (
                        <div className="preview-options">
                          {question.options.map(
                            (option, optionIndex) => (
                              <span key={optionIndex}>
                                {optionIndex + 1}. {option}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            className="assignment-primary-btn save-assignment-btn"
            onClick={saveAssignment}
          >
            <Save size={18} />
            Topshiriqni saqlash
          </button>
        </section>
      </div>
    </div>
  );
}