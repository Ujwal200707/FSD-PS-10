import React, { useMemo, useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import NotificationBell from "../NotificationBell";
import "./Layout.css";
import { ROLES } from "../../constants/roles";
import { clearCurrentUser, getCurrentUser, normalizeRole } from "../../utils/auth";
import { getTheme, toggleTheme } from "../../utils/theme";

const menuByRole = {
  [ROLES.ADMIN]: [
    { label: "Dashboard", to: "/admin" },
    { label: "Secure Exams", to: "/admin/secure-exams" },
    { label: "Assignments", to: "/assignments" },
    { label: "Courses", to: "/courses" },
    { label: "Students", to: "/students" },
    { label: "Submissions", to: "/assignments" },
    { label: "Settings", to: "/settings" },
  ],
  [ROLES.TEACHER]: [
    { label: "Dashboard", to: "/instructor" },
    { label: "Secure Exams", to: "/instructor/secure-exams" },
    { label: "Assignments", to: "/assignments" },
    { label: "Courses", to: "/courses" },
    { label: "Submissions", to: "/assignments" },
    { label: "Settings", to: "/settings" },
  ],
  [ROLES.STUDENT]: [
    { label: "Dashboard", to: "/student" },
    { label: "Assignments", to: "/assignments" },
    { label: "Courses", to: "/courses" },
    { label: "Exam Reminders", to: "/exam-reminders" },
    { label: "Settings", to: "/settings" },
  ],
  [ROLES.CONTENT]: [
    { label: "Dashboard", to: "/content-creator" },
    { label: "Content", to: "/manage" },
    { label: "Courses", to: "/courses" },
    { label: "Settings", to: "/settings" },
  ],
};

const Layout = ({ children, pageTitle }) => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(getTheme() === "dark");

  const currentUser = useMemo(() => getCurrentUser(), []);

  const role = normalizeRole(currentUser?.role) || ROLES.STUDENT;
  const email = currentUser?.email || "user@edulms.com";
  const menu = menuByRole[role] || menuByRole[ROLES.STUDENT];

  useEffect(() => {
    const theme = getTheme() === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    setIsDarkMode(theme === "dark");
  }, []);

  const handleThemeToggle = () => {
    toggleTheme();
    const newTheme = getTheme() === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    setIsDarkMode(newTheme === "dark");
  };

  const handleLogout = () => {
    clearCurrentUser();
    navigate("/", { replace: true });
  };

  return (
    <div className="layout">
      <aside className="layout-sidebar">
        <h2 className="layout-brand">EDULMS</h2>
        <p className="layout-user">{role.toUpperCase()} • {email}</p>

        <nav className="layout-nav">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `layout-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="layout-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="layout-main">
        <header className="layout-header">
          <div className="layout-header-left">
            <h1>{pageTitle || "Dashboard"}</h1>
          </div>
          <div className="layout-header-right">
            <button className="layout-theme-toggle" onClick={handleThemeToggle} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>
            <NotificationBell />
            <button className="layout-header-logout" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>
        {children || <Outlet />}
      </main>
    </div>
  );
};

export default Layout;