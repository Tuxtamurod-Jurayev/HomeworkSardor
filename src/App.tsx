
import { useState, type FormEvent } from "react";
import {
  LockKeyhole,
  LogIn,
  UserRound,
} from "lucide-react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import "./pages/auth/adminLogin.css";

type UserRole = "admin" | "teacher" | "student";

type LoginUser = {
  login: string;
  password: string;
  role: UserRole;
};

const users: LoginUser[] = [
  {
    login: "admin",
    password: "12345",
    role: "admin",
  },
  {
    login: "teacher1",
    password: "00000",
    role: "teacher",
  },
  {
    login: "student1",
    password: "00000",
    role: "student",
  },
];

function getDashboardPath(role: UserRole) {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "teacher") {
    return "/teacher/dashboard";
  }

  return "/student/dashboard";
}

function UnifiedLogin() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const normalizedLogin = login.trim().toLowerCase();

    const matchedUser = users.find(
      (user) =>
        user.login === normalizedLogin &&
        user.password === password
    );

    if (!matchedUser) {
      setError("Login yoki parol noto‘g‘ri!");
      return;
    }

    sessionStorage.setItem(
      `${matchedUser.role}_authenticated`,
      "true"
    );

    sessionStorage.setItem(
      "homework_user_role",
      matchedUser.role
    );

    navigate(getDashboardPath(matchedUser.role), {
      replace: true,
    });
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">H</div>

        <div className="admin-login-header">
          <h1>Homework</h1>

          <p>
            Tizimga kirish uchun login va parolingizni kiriting
          </p>
        </div>

        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >
          <div className="admin-login-field">
            <label htmlFor="login">Login</label>

            <div className="admin-login-input-wrapper">
              <UserRound size={18} />

              <input
                id="login"
                type="text"
                placeholder="Loginni kiriting"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label htmlFor="password">Parol</label>

            <div className="admin-login-input-wrapper">
              <LockKeyhole size={18} />

              <input
                id="password"
                type="password"
                placeholder="Parolni kiriting"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {error && (
            <p className="admin-login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-button"
          >
            <LogIn size={18} />
            Kirish
          </button>
        </form>
      </div>
    </main>
  );
}

function ProtectedRoute({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const isAuthenticated =
    sessionStorage.getItem(`${role}_authenticated`) ===
    "true";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function StudentDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("student_authenticated");
    sessionStorage.removeItem("homework_user_role");

    navigate("/login", { replace: true });
  };

  return (
    <main className="main-content">
      <h1 className="page-title">
        Student Dashboard
      </h1>

      <button type="button" onClick={handleLogout}>
        Chiqish
      </button>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<UnifiedLogin />}
        />

        <Route
          path="/admin"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={<Navigate to="/teacher/dashboard" replace />}
        />

        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <Navigate to="/student/dashboard" replace />
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;