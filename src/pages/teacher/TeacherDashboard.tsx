
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Groups from "./Groups";
import Students from "./Students";
import Assignments from "./Assignments";
import Reports from "./Reports";
import SettingsPage from "./Settings";

import "./teacherMain.css";

type MenuId =
  | "dashboard"
  | "groups"
  | "students"
  | "assignments"
  | "reports"
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
    icon: <LayoutDashboard size={19} />,
  },
  {
    id: "groups",
    label: "Guruhlar",
    icon: <Users size={19} />,
  },
  {
    id: "students",
    label: "O‘quvchilar",
    icon: <GraduationCap size={19} />,
  },
  {
    id: "assignments",
    label: "Topshiriqlar",
    icon: <ClipboardList size={19} />,
  },
  {
    id: "reports",
    label: "Hisobotlar",
    icon: <BarChart3 size={19} />,
  },
  {
    id: "settings",
    label: "Sozlamalar",
    icon: <Settings size={19} />,
  },
];

function TeacherDashboard() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] =
    useState<MenuId>("dashboard");

  const activeMenuItem = menuItems.find(
    (item) => item.id === activeMenu,
  );

  const handleLogout = () => {
    sessionStorage.removeItem("teacher_authenticated");
    sessionStorage.removeItem("homework_user_role");

    navigate("/login");
  };

  const renderDashboard = () => {
    return (
      <div className="teacher-dashboard-content">
        <div className="teacher-page-heading">
          <div>
            <h1>Assalomu alaykum, O‘qituvchi!</h1>

            <p>
              Bugungi ishlaringizni boshqarish uchun
              dashboarddan foydalaning.
            </p>
          </div>
        </div>

        <div className="teacher-stats-grid">
          <div className="teacher-stat-card">
            <div className="teacher-stat-icon purple">
              <Users size={23} />
            </div>

            <div>
              <span>Guruhlar</span>
              <strong>4</strong>
              <small>Faol guruhlar</small>
            </div>
          </div>

          <div className="teacher-stat-card">
            <div className="teacher-stat-icon blue">
              <GraduationCap size={23} />
            </div>

            <div>
              <span>O‘quvchilar</span>
              <strong>48</strong>
              <small>Jami o‘quvchilar</small>
            </div>
          </div>

          <div className="teacher-stat-card">
            <div className="teacher-stat-icon orange">
              <FileText size={23} />
            </div>

            <div>
              <span>Topshiriqlar</span>
              <strong>12</strong>
              <small>Berilgan topshiriqlar</small>
            </div>
          </div>

          <div className="teacher-stat-card">
            <div className="teacher-stat-icon green">
              <BookOpen size={23} />
            </div>

            <div>
              <span>Bajarilganlar</span>
              <strong>86%</strong>
              <small>Umumiy natija</small>
            </div>
          </div>
        </div>

        <div className="teacher-welcome-card">
          <div className="teacher-welcome-icon">
            <BookOpen size={28} />
          </div>

          <div>
            <h2>Homework platformasiga xush kelibsiz!</h2>

            <p>
              Guruhlaringizni, o‘quvchilaringizni va uyga
              vazifalarni bir joydan boshqaring.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyContent = () => {
    return (
      <div className="teacher-empty-state">
        <div className="teacher-empty-icon">
          {activeMenuItem?.icon}
        </div>

        <h2>{activeMenuItem?.label}</h2>

        <p>
          Ushbu bo‘lim tez orada ishga tushiriladi.
        </p>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return renderDashboard();

      case "groups":
        return <Groups />;

      case "students":
        return <Students />;

      case "assignments":
        return <Assignments />;

      case "reports":
        return <Reports />;

      case "settings":
        return <SettingsPage />;

      default:
        return renderEmptyContent();
    }
  };

  return (
    <div className="teacher-layout">
      <aside className="teacher-sidebar">
        <div className="teacher-brand">
          <div className="teacher-brand-icon">
            <BookOpen size={22} />
          </div>

          <div>
            <h2>Homework</h2>
            <span>Teacher Panel</span>
          </div>
        </div>

        <nav className="teacher-navigation">
          <p className="teacher-navigation-title">
            ASOSIY MENYU
          </p>

          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`teacher-menu-item ${
                activeMenu === item.id ? "active" : ""
              }`}
              onClick={() => setActiveMenu(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="teacher-sidebar-bottom">
          <button
            type="button"
            className="teacher-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      <main className="teacher-main">
        <header className="teacher-topbar">
          <div>
            <span className="teacher-topbar-label">
              O‘qituvchi paneli
            </span>

            <h3>{activeMenuItem?.label}</h3>
          </div>

          <div className="teacher-profile">
            <div className="teacher-profile-avatar">
              O‘
            </div>

            <div className="teacher-profile-info">
              <strong>O‘qituvchi</strong>
              <span>Teacher</span>
            </div>
          </div>
        </header>

        <div className="teacher-content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default TeacherDashboard;