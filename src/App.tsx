
import { useState, type FormEvent, type ReactNode } from "react";
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
import StudentDashboard from "./pages/student/StudentDashboard";
import SupabaseConnectionTest from "./components/SupabaseConnectionTest";
import { supabase } from "./lib/supabaseClient";

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
  switch (role) {
    case "admin":
      return "/admin/dashboard";

    case "teacher":
      return "/teacher/dashboard";

    case "student":
      return "/student/dashboard";

    default:
      return "/login";
  }
}

function UnifiedLogin() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedLogin = login.trim().toLowerCase();

    if (!normalizedLogin || !password) {
      setError("Login va parolni kiriting!");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Supabase maʼlumotlar bazasidan tekshirish
      const { data: dbUser, error: dbError } = await supabase
        .from("users")
        .select("id, login, password, role, status, full_name, first_name, last_name")
        .eq("login", normalizedLogin)
        .maybeSingle();

      if (!dbError && dbUser) {
        if (dbUser.password && dbUser.password !== password) {
          setError("Login yoki parol noto‘g‘ri!");
          setIsLoading(false);
          return;
        }

        if (dbUser.status === "Nofaol") {
          setError("Hisobingiz nofaol qilingan. Administratorga murojaat qiling!");
          setIsLoading(false);
          return;
        }

        const role = dbUser.role as UserRole;
        const displayName =
          dbUser.full_name ||
          `${dbUser.first_name || ""} ${dbUser.last_name || ""}`.trim() ||
          dbUser.login;

        sessionStorage.setItem("homework_authenticated", "true");
        sessionStorage.setItem("homework_user_role", role);
        sessionStorage.setItem("homework_user_login", dbUser.login);
        sessionStorage.setItem("homework_user_name", displayName);
        sessionStorage.setItem("homework_user_id", dbUser.id);
        sessionStorage.setItem(`${role}_authenticated`, "true");

        setError("");
        navigate(getDashboardPath(role), { replace: true });
        return;
      }

      // 2. Agar bazada topilmasa yoki tarmoqda uzilish bo‘lsa, zaxira foydalanuvchilar
      const matchedUser = users.find(
        (user) =>
          user.login === normalizedLogin &&
          user.password === password,
      );

      if (matchedUser) {
        sessionStorage.setItem("homework_authenticated", "true");
        sessionStorage.setItem("homework_user_role", matchedUser.role);
        sessionStorage.setItem("homework_user_login", matchedUser.login);
        sessionStorage.setItem("homework_user_name", matchedUser.login);
        sessionStorage.setItem(`${matchedUser.role}_authenticated`, "true");

        setError("");
        navigate(getDashboardPath(matchedUser.role), { replace: true });
        return;
      }

      setError("Login yoki parol noto‘g‘ri!");
    } catch (loginErr) {
      console.error("Login xatosi:", loginErr);
      setError("Tizimga kirishda kutilmagan xatolik yuz berdi!");
    } finally {
      setIsLoading(false);
    }
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
                onChange={(event) => {
                  setLogin(event.target.value);
                  setError("");
                }}
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
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
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
            disabled={isLoading}
          >
            <LogIn size={18} />
            {isLoading ? "Tekshirilmoqda..." : "Kirish"}
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
  children: ReactNode;
}) {
  const isAuthenticated =
    sessionStorage.getItem("homework_authenticated") ===
    "true";

  const currentRole =
    sessionStorage.getItem("homework_user_role");

  const hasRoleAccess =
    currentRole === role &&
    sessionStorage.getItem(`${role}_authenticated`) ===
      "true";

  if (!isAuthenticated || !hasRoleAccess) {
    return <Navigate to="/login" replace />;
  }

  return children;
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
          path="/supabase-test"
          element={<SupabaseConnectionTest />}
        />

        <Route
          path="/admin"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
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
          element={
            <Navigate
              to="/teacher/dashboard"
              replace
            />
          }
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
            <Navigate
              to="/student/dashboard"
              replace
            />
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