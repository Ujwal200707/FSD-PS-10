/**
 * Theme management for dark/light mode
 */

const THEME_KEY = "lms_theme";

export const getTheme = () => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  } catch {
    return "light";
  }
};

export const setTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
    document.body.style.backgroundColor = theme === "dark" ? "#1f2937" : "#ffffff";
    document.body.style.color = theme === "dark" ? "#f3f4f6" : "#1f2937";
  } catch {
    // Silently fail if localStorage unavailable
  }
};

export const toggleTheme = () => {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
};
