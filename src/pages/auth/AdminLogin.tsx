
import { useState, type FormEvent } from "react";
import {
  LockKeyhole,
  LogIn,
  UserRound,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
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

  const normalizedLogin = login.trim().toLowerCase();

  const getRoleName = () => {
    if (normalizedLogin === "admin") return "Admin";
    if (normalizedLogin.length > 0) return "Foydalanuvchi";

    return "Foydalanuvchi";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!normalizedLogin || !password) {
      setError("Login va parolni kiriting!");
      return;
    }

    setIsLoading(true);

    try {
      // Admin uchun vaqtinchalik mavjud kirish
      if (normalizedLogin === "admin" && password === "12345") {
        sessionStorage.setItem("homework_authenticated", "true");
        sessionStorage.setItem("homework_user_role", "admin");
        sessionStorage.setItem("homework_user_login", "admin");
        sessionStorage.setItem("admin_authenticated", "true");

        onLogin();
        return;
      }

      /*
       * Teacher va student Supabase Auth orqali kiradi.
       *
       * Auth email formati:
       * login@homework.local
       */
      const authEmail = `${normalizedLogin}@homework.local`;

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });

      if (authError || !authData.user) {
        setError(
          "Login yoki parol noto‘g‘ri. Auth foydalanuvchisi yaratilganini tekshiring.",
        );
        return;
      }

      const { data: userAccount, error: userError } = await supabase
        .from("users")
        .select("id, login, role, status, auth_user_id")
        .eq("login", normalizedLogin)
        .maybeSingle();

      if (userError || !userAccount) {
        await supabase.auth.signOut();
        setError("Foydalanuvchi tizimda topilmadi!");
        return;
      }

      if (userAccount.auth_user_id !== authData.user.id) {
        await supabase.auth.signOut();
        setError(
          "Bu login Supabase Auth foydalanuvchisi bilan bog‘lanmagan!",
        );
        return;
      }

      if (userAccount.status === "Nofaol") {
        await supabase.auth.signOut();
        setError("Sizning hisobingiz vaqtincha nofaol!");
        return;
      }

      const role = userAccount.role as UserRole;

      sessionStorage.setItem("homework_authenticated", "true");
      sessionStorage.setItem("homework_user_role", role);
      sessionStorage.setItem("homework_user_login", userAccount.login);

      if (role === "teacher") {
        sessionStorage.setItem("teacher_authenticated", "true");
      }

      if (role === "student") {
        sessionStorage.setItem("student_authenticated", "true");
      }

      onLogin();
    } catch (submitError) {
      console.error("Login xatosi:", submitError);
      setError("Tizimga kirishda xatolik yuz berdi!");
    } finally {
      setIsLoading(false);
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
          {getRoleName() === "Admin" && <ShieldCheck size={18} />}
          {getRoleName() === "O'qituvchi" && (
            <GraduationCap size={18} />
          )}
          {getRoleName() !== "Admin" &&
            getRoleName() !== "O'qituvchi" && <UserRound size={18} />}

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
          <p>Admin test hisobi:</p>
          <span>admin / 12345</span>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;