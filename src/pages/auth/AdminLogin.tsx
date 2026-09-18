
import { useState, type FormEvent } from "react";
import {
  LockKeyhole,
  LogIn,
  UserRound,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import "./adminLogin.css";

type AdminLoginProps = {
  onLogin: () => void;
};

type UserRole = "admin" | "teacher" | "student";

function AdminLogin({ onLogin }: AdminLoginProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roleName, setRoleName] = useState("Foydalanuvchi");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const normalizedLogin = login.trim().toLowerCase();

    if (!normalizedLogin || !password) {
      setError("Login va parolni kiriting!");
      return;
    }

    setIsLoading(true);

    try {
      const authEmail = `${normalizedLogin}@homework.uz`;

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });

      if (authError || !authData.user) {
        setError("Login yoki parol noto‘g‘ri!");
        return;
      }

      const { data: account, error: accountError } = await supabase
        .from("users")
        .select("id, login, role, status, auth_user_id")
        .eq("login", normalizedLogin)
        .maybeSingle();

      if (accountError || !account) {
        await supabase.auth.signOut();
        setError("Foydalanuvchi tizimda topilmadi!");
        return;
      }

      if (account.auth_user_id !== authData.user.id) {
        await supabase.auth.signOut();
        setError("Account tizim bilan bog‘lanmagan!");
        return;
      }

      if (account.status === "Nofaol") {
        await supabase.auth.signOut();
        setError("Sizning hisobingiz nofaol!");
        return;
      }

      const role = account.role as UserRole;

      sessionStorage.setItem("homework_authenticated", "true");
      sessionStorage.setItem("homework_user_role", role);
      sessionStorage.setItem("homework_user_login", account.login);

      sessionStorage.removeItem("admin_authenticated");
      sessionStorage.removeItem("teacher_authenticated");
      sessionStorage.removeItem("student_authenticated");

      if (role === "admin") {
        sessionStorage.setItem("admin_authenticated", "true");
      }

      if (role === "teacher") {
        sessionStorage.setItem("teacher_authenticated", "true");
      }

      if (role === "student") {
        sessionStorage.setItem("student_authenticated", "true");
      }

      setError("");
      onLogin();
    } catch (loginError) {
      console.error("Login xatosi:", loginError);
      setError("Tizimga kirishda kutilmagan xatolik yuz berdi!");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = () => {
    if (roleName === "Admin") {
      return <ShieldCheck size={18} />;
    }

    if (roleName === "O‘qituvchi") {
      return <GraduationCap size={18} />;
    }

    return <UserRound size={18} />;
  };

  const handleLoginChange = (value: string) => {
    const normalizedValue = value.trim().toLowerCase();

    setLogin(value);
    setError("");

    if (normalizedValue === "admin") {
      setRoleName("Admin");
    } else {
      setRoleName("Foydalanuvchi");
    }
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
          {getRoleIcon()}
          <span>{roleName}</span>
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
                onChange={(event) =>
                  handleLoginChange(event.target.value)
                }
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

          <button
            type="submit"
            className="admin-login-button"
            disabled={isLoading}
          >
            <LogIn size={18} />
            {isLoading ? "Tekshirilmoqda..." : "Kirish"}
          </button>
        </form>

        <div className="admin-login-hint">
          <p>Admin login:</p>
          <span>admin / 123456</span>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;