
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Camera,
  Check,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  Save,
  UserRound,
  X,
} from "lucide-react";
import "./settings.css";

type AdminProfile = {
  login: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
};

const defaultProfile: AdminProfile = {
  login: "admin",
  password: "12345",
  firstName: "Administrator",
  lastName: "",
  avatar: "",
};

const PROFILE_STORAGE_KEY = "homework_admin_profile";

function Settings() {
  const [profile, setProfile] = useState<AdminProfile>(defaultProfile);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);

        setProfile({
          ...defaultProfile,
          ...parsedProfile,
        });
      } catch {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    }
  }, []);

  const handleChange = (
    field: keyof AdminProfile,
    value: string
  ) => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      [field]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleAvatarChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Faqat rasm faylini yuklang.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Rasm hajmi 2 MB dan oshmasligi kerak.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageUrl = reader.result;

      if (typeof imageUrl === "string") {
        setProfile((previousProfile) => ({
          ...previousProfile,
          avatar: imageUrl,
        }));

        setSuccessMessage("");
        setErrorMessage("");
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setProfile((previousProfile) => ({
      ...previousProfile,
      avatar: "",
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setSuccessMessage("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const trimmedLogin = profile.login.trim();
    const trimmedFirstName = profile.firstName.trim();
    const trimmedLastName = profile.lastName.trim();

    if (!trimmedLogin) {
      setErrorMessage("Loginni kiriting.");
      return;
    }

    if (!profile.password.trim()) {
      setErrorMessage("Parolni kiriting.");
      return;
    }

    if (profile.password.length < 5) {
      setErrorMessage(
        "Parol kamida 5 ta belgidan iborat bo‘lishi kerak."
      );
      return;
    }

    if (!trimmedFirstName) {
      setErrorMessage("Ismni kiriting.");
      return;
    }

    const updatedProfile: AdminProfile = {
      ...profile,
      login: trimmedLogin,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
    };

    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(updatedProfile)
    );

    setProfile(updatedProfile);
    setSuccessMessage("Profil ma’lumotlari muvaffaqiyatli saqlandi.");
  };

  const fullName =
    `${profile.firstName} ${profile.lastName}`.trim();

  return (
    <section className="settings-page">
      <div className="settings-header">
        <div>
          <h2 className="settings-title">Sozlamalar</h2>

          <p className="settings-description">
            Asosiy administrator profilini boshqarish
          </p>
        </div>
      </div>

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <UserRound size={20} />
            </div>

            <div>
              <h3>Profil ma’lumotlari</h3>
              <p>Administratorning shaxsiy ma’lumotlari</p>
            </div>
          </div>

          <div className="settings-profile-preview">
            <div className="settings-avatar-wrapper">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Administrator avatari"
                  className="settings-avatar-image"
                />
              ) : (
                <div className="settings-avatar-placeholder">
                  <UserRound size={38} />
                </div>
              )}

              <button
                type="button"
                className="settings-avatar-camera"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Avatarni o‘zgartirish"
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="settings-profile-info">
              <strong>{fullName || "Administrator"}</strong>

              <span>
                {profile.login || "admin"}
              </span>

              <div className="settings-avatar-actions">
                <button
                  type="button"
                  className="settings-upload-button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus size={15} />
                  Rasm yuklash
                </button>

                {profile.avatar && (
                  <button
                    type="button"
                    className="settings-remove-avatar"
                    onClick={handleRemoveAvatar}
                  >
                    <X size={15} />
                    O‘chirish
                  </button>
                )}
              </div>

              <small>PNG, JPG yoki WEBP. Maksimal 2 MB.</small>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="settings-hidden-file"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="settings-fields-grid">
            <div className="settings-field">
              <label htmlFor="admin-first-name">Ism</label>

              <div className="settings-input-wrapper">
                <UserRound size={17} />

                <input
                  id="admin-first-name"
                  type="text"
                  placeholder="Ismingiz"
                  value={profile.firstName}
                  onChange={(event) =>
                    handleChange("firstName", event.target.value)
                  }
                  autoComplete="given-name"
                  required
                />
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="admin-last-name">Familiya</label>

              <div className="settings-input-wrapper">
                <UserRound size={17} />

                <input
                  id="admin-last-name"
                  type="text"
                  placeholder="Familiyangiz"
                  value={profile.lastName}
                  onChange={(event) =>
                    handleChange("lastName", event.target.value)
                  }
                  autoComplete="family-name"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon">
              <LockKeyhole size={20} />
            </div>

            <div>
              <h3>Kirish ma’lumotlari</h3>
              <p>Admin tizimiga kirish uchun login va parol</p>
            </div>
          </div>

          <div className="settings-fields-grid">
            <div className="settings-field">
              <label htmlFor="admin-login">Login</label>

              <div className="settings-input-wrapper">
                <UserRound size={17} />

                <input
                  id="admin-login"
                  type="text"
                  placeholder="Admin login"
                  value={profile.login}
                  onChange={(event) =>
                    handleChange("login", event.target.value)
                  }
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="admin-password">Parol</label>

              <div className="settings-input-wrapper">
                <LockKeyhole size={17} />

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Admin paroli"
                  value={profile.password}
                  onChange={(event) =>
                    handleChange("password", event.target.value)
                  }
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="settings-password-toggle"
                  onClick={() =>
                    setShowPassword((previousValue) => !previousValue)
                  }
                  aria-label={
                    showPassword
                      ? "Parolni yashirish"
                      : "Parolni ko‘rsatish"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="settings-message error">
            <X size={17} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="settings-message success">
            <Check size={17} />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="settings-form-actions">
          <button type="submit" className="settings-save-button">
            <Save size={18} />
            Saqlash
          </button>
        </div>
      </form>
    </section>
  );
}

export default Settings;