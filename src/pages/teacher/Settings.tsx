
import { useState } from "react";
import {
  Check,
  KeyRound,
  Lock,
  Phone,
  Save,
  Settings as SettingsIcon,
  User,
} from "lucide-react";

import "./settings.css";

export default function Settings() {
  const [fullName, setFullName] = useState("O‘qituvchi");
  const [phone, setPhone] = useState("+998 90 123 45 67");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [activeSection, setActiveSection] = useState<
    "profile" | "security"
  >("profile");

  const [message, setMessage] = useState("");

  const saveProfile = () => {
    if (!fullName.trim()) {
      setMessage("Ism maydonini to‘ldiring.");
      return;
    }

    setMessage("Profil ma’lumotlari saqlandi.");
  };

  const updatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Barcha parol maydonlarini to‘ldiring.");
      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        "Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Yangi parollar bir-biriga mos kelmaydi.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setMessage("Parol muvaffaqiyatli yangilandi.");
  };

  const renderContent = () => {
    if (activeSection === "profile") {
      return (
        <section className="settings-content-card">
          <div className="settings-content-header">
            <div>
              <h2>Profil ma’lumotlari</h2>

              <p>
                Shaxsiy ma’lumotlaringizni ko‘rish va o‘zgartirish.
              </p>
            </div>

            <User size={22} />
          </div>

          <div className="settings-profile-preview">
            <div className="settings-avatar">
              {fullName.charAt(0).toUpperCase() || "O"}
            </div>

            <div>
              <h3>{fullName || "O‘qituvchi"}</h3>
              <span>Teacher</span>
            </div>
          </div>

          <div className="settings-form-grid">
            <div className="settings-form-group">
              <label htmlFor="full-name">To‘liq ism</label>

              <div className="settings-input-wrapper">
                <User size={17} />

                <input
                  id="full-name"
                  value={fullName}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    setMessage("");
                  }}
                  placeholder="Ismingizni kiriting"
                />
              </div>
            </div>

            <div className="settings-form-group">
              <label htmlFor="teacher-phone">
                Telefon raqami
              </label>

              <div className="settings-input-wrapper">
                <Phone size={17} />

                <input
                  id="teacher-phone"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setMessage("");
                  }}
                  placeholder="+998 90 000 00 00"
                />
              </div>
            </div>
          </div>

          <div className="settings-action-row">
            <button
              className="settings-save-btn"
              onClick={saveProfile}
            >
              <Save size={17} />
              O‘zgarishlarni saqlash
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="settings-content-card">
        <div className="settings-content-header">
          <div>
            <h2>Parol va xavfsizlik</h2>

            <p>
              Hisobingiz xavfsizligi uchun parolni yangilang.
            </p>
          </div>

          <Lock size={22} />
        </div>

        <div className="settings-security-notice">
          <KeyRound size={18} />

          <p>
            Xavfsiz parol kamida 6 ta belgidan iborat bo‘lishi
            tavsiya etiladi.
          </p>
        </div>

        <div className="settings-security-form">
          <div className="settings-form-group">
            <label htmlFor="current-password">
              Joriy parol
            </label>

            <div className="settings-input-wrapper">
              <Lock size={17} />

              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => {
                  setCurrentPassword(event.target.value);
                  setMessage("");
                }}
                placeholder="Joriy parolni kiriting"
              />
            </div>
          </div>

          <div className="settings-form-group">
            <label htmlFor="new-password">
              Yangi parol
            </label>

            <div className="settings-input-wrapper">
              <KeyRound size={17} />

              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setMessage("");
                }}
                placeholder="Yangi parolni kiriting"
              />
            </div>
          </div>

          <div className="settings-form-group">
            <label htmlFor="confirm-password">
              Yangi parolni tasdiqlang
            </label>

            <div className="settings-input-wrapper">
              <Check size={17} />

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setMessage("");
                }}
                placeholder="Yangi parolni qayta kiriting"
              />
            </div>
          </div>
        </div>

        <div className="settings-action-row">
          <button
            className="settings-save-btn"
            onClick={updatePassword}
          >
            <Save size={17} />
            Parolni yangilash
          </button>
        </div>
      </section>
    );
  };

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <div>
          <span className="settings-page-label">
            O‘qituvchi paneli
          </span>

          <h1>Sozlamalar</h1>

          <p>
            Profil va hisob sozlamalarini boshqaring.
          </p>
        </div>

        <div className="settings-header-icon">
          <SettingsIcon size={23} />
        </div>
      </div>

      {message && (
        <div className="settings-message">
          <Check size={17} />
          {message}
        </div>
      )}

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <button
            className={`settings-menu-item ${
              activeSection === "profile" ? "active" : ""
            }`}
            onClick={() => {
              setActiveSection("profile");
              setMessage("");
            }}
          >
            <User size={18} />
            Profil
          </button>

          <button
            className={`settings-menu-item ${
              activeSection === "security" ? "active" : ""
            }`}
            onClick={() => {
              setActiveSection("security");
              setMessage("");
            }}
          >
            <Lock size={18} />
            Xavfsizlik
          </button>
        </aside>

        <main className="settings-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}