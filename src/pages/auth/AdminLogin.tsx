
import { useState, type FormEvent } from "react";
import {
  LockKeyhole,
  LogIn,
  UserRound,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import "./adminLogin.css";

type AdminLoginProps = {
  onLogin: () => void;
};

type UserRole = "admin" | "teacher" | "student";

type UserAccount = {
  login: string;
  password: string;
  role: UserRole;
};

const USERS: UserAccount[] = [
  {
    login: "admin",
    password: "12345",
    role: "admin",
  },
  {
    login: "teacher1",
    password: "12345",
    role: "teacher",
  },
  {
    login: "student1",
    password: "00000",
    role: "student",
  },
];

function AdminLogin({ onLogin }: AdminLoginProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedLogin = login.trim().toLowerCase();

    const user = USERS.find(
      (account) =>
        account.login === normalizedLogin &&
        account.password === password,
    );

    if (!user) {
      setError("Login yoki parol noto‘g‘ri!");
      return;
    }

    sessionStorage.setItem("homework_authenticated", "true");
    sessionStorage.setItem("homework_user_role", user.role);
    sessionStorage.setItem("homework_user_login", user.login);

    if (user.role === "admin") {
      sessionStorage.setItem("admin_authenticated", "true");
    }

    if (user.role === "teacher") {
      sessionStorage.setItem("teacher_authenticated", "true");
    }

    if (user.role === "student") {
      sessionStorage.setItem("student_authenticated", "true");
    }

    setError("");
    onLogin();
  };

  const getRoleName = () => {
    const normalizedLogin = login.trim().toLowerCase();

    const user = USERS.find(
      (account) => account.login === normalizedLogin,
    );

    if (user?.role === "admin") return "Admin";
    if (user?.role === "teacher") return "O‘qituvchi";
    if (user?.role === "student") return "O‘quvchi";

    return "Foydalanuvchi";
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">H</div>

        <div className="admin-login-header">
          <h1>Homework tizimi</h1>
          <p>Admin, o‘qituvchi va o‘quvchi uchun kirish</p>
        </div>

        <div className="admin-login-role-info">
          {getRoleName() === "Admin" && <ShieldCheck size={18} />}
          {getRoleName() === "O‘qituvchi" && (
            <GraduationCap size={18} />
          )}
          {getRoleName() === "O‘quvchi" && <UserRound size={18} />}

          <span>{getRoleName()}</span>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label htmlFor="admin-login">Login</label>

            <div className="admin-login-input-wrapper">
              <UserRound size={18} />

              <input
                id="admin-login"
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
            <label htmlFor="admin-password">Parol</label>

            <div className="admin-login-input-wrapper">
              <LockKeyhole size={18} />

              <input
                id="admin-password"
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

          {error && <p className="admin-login-error">{error}</p>}

          <button type="submit" className="admin-login-button">
            <LogIn size={18} />
            Kirish
          </button>
        </form>

        <div className="admin-login-hint">
          <p>Test uchun:</p>
          <span>student1 / 00000</span>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;