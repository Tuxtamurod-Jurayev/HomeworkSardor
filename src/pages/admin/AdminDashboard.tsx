
import { useState, type ReactNode } from "react";
import {
  BookOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings as SettingsIcon,
  Users,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Homeworks from "./Homeworks";
import Students from "./Students";
import Teachers from "./Teachers";
import Settings from "./Settings";

import "./adminMain.css";

type MenuId =
  | "dashboard"
  | "teachers"
  | "students"
  | "homeworks"
  | "settings";

type MenuItem = {
  id: MenuId;
  label: string;
  icon: ReactNode;
};

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: "teachers",
    label: "O‘qituvchilar",
    icon: <GraduationCap size={20} />,
  },
  {
    id: "students",
    label: "O‘quvchilar",
    icon: <Users size={20} />,
  },
  {
    id: "homeworks",
    label: "Uy vazifalari",
    icon: <FileText size={20} />,
  },
  {
    id: "settings",
    label: "Sozlamalar",
    icon: <SettingsIcon size={20} />,
  },
];

function AdminDashboard() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] =
    useState<MenuId>("dashboard");

  const activeMenuItem = menuItems.find(
    (item) => item.id === activeMenu
  );

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    navigate("/admin", { replace: true });
  };

  const renderDashboard = () => {
    return (
      <>
        <div className="admin-page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>

            <p className="page-description">
              Homework boshqaruv tizimiga xush kelibsiz
            </p>
          </div>
        </div>

        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="admin-stat-icon purple">
              <GraduationCap size={22} />
            </div>

            <div className="admin-stat-content">
              <span>O‘qituvchilar</span>
              <strong>12</strong>
              <small>Faol o‘qituvchilar</small>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon blue">
              <Users size={22} />
            </div>

            <div className="admin-stat-content">
              <span>O‘quvchilar</span>
              <strong>248</strong>
              <small>Tizimdagi o‘quvchilar</small>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon green">
              <BookOpen size={22} />
            </div>

            <div className="admin-stat-content">
              <span>Topshiriqlar</span>
              <strong>86</strong>
              <small>Umumiy topshiriqlar</small>
            </div>
          </div>

          
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2 className="admin-section-title">
                Tizim haqida
              </h2>

              <p className="admin-section-description">
                Asosiy boshqaruv bo‘limlari
              </p>
            </div>
          </div>

          <div className="admin-overview-grid">
            <button
              type="button"
              className="admin-overview-card"
              onClick={() => setActiveMenu("teachers")}
            >
              <GraduationCap size={24} />

              <span>O‘qituvchilarni boshqarish</span>

              <small>
                O‘qituvchilarni ko‘rish va tahrirlash
              </small>
            </button>

            <button
              type="button"
              className="admin-overview-card"
              onClick={() => setActiveMenu("students")}
            >
              <UserRound size={24} />

              <span>O‘quvchilarni boshqarish</span>

              <small>
                O‘quvchilar va ularning natijalari
              </small>
            </button>

            <button
              type="button"
              className="admin-overview-card"
              onClick={() => setActiveMenu("homeworks")}
            >
              <FileText size={24} />

              <span>Uy vazifalarini ko‘rish</span>

              <small>
                Barcha berilgan topshiriqlar jadvali
              </small>
            </button>
          </div>
        </section>
      </>
    );
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return renderDashboard();

      case "teachers":
        return <Teachers />;

      case "students":
        return <Students />;

      case "homeworks":
        return <Homeworks />;

      case "settings":
        return <Settings />;

      default:
        return renderDashboard();
    }
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-brand-icon">H</div>

          <div className="admin-brand-content">
            <strong>Homework</strong>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-navigation">
          <span className="admin-navigation-label">
            ASOSIY MENYU
          </span>

          <div className="admin-menu-list">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-menu-item ${
                  activeMenu === item.id ? "active" : ""
                }`}
                onClick={() => setActiveMenu(item.id)}
              >
                {item.icon}

                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="admin-sidebar-bottom">
          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-mobile-brand">
            <div className="admin-brand-icon">H</div>
            <strong>Homework</strong>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-profile">
              <div className="admin-profile-avatar">
                <UserRound size={18} />
              </div>

              <div className="admin-profile-info">
                <strong>Administrator</strong>
                <span>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;