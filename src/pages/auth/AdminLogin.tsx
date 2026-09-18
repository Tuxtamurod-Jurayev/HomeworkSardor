
import { useState, type FormEvent } from "react";
import { LockKeyhole, LogIn, UserRound } from "lucide-react";
import "./adminLogin.css";

type AdminLoginProps = {
  onLogin: () => void;
};

function AdminLogin({ onLogin }: AdminLoginProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (login === "admin" && password === "12345") {
      sessionStorage.setItem("admin_authenticated", "true");
      setError("");
      onLogin();
      return;
    }

    setError("Login yoki parol noto‘g‘ri!");
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">H</div>

        <div className="admin-login-header">
          <h1>Admin panel</h1>
          <p>Homework boshqaruv tizimiga kirish</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label htmlFor="admin-login">Login</label>

            <div className="admin-login-input-wrapper">
              <UserRound size={18} />

              <input
                id="admin-login"
                type="text"
                placeholder="Admin login"
                value={login}
                onChange={(event) => setLogin(event.target.value)}
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
                placeholder="Admin paroli"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
      </div>
    </main>
  );
}

export default AdminLogin;