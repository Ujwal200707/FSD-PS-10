/**
 * Theme management for dark/light mode
 */

const THEME_KEY = "lms_theme";

// Force the application to always use the light theme.
export const getTheme = () => {
  return "light";
};

export const setTheme = (/* theme */) => {
  try {
    // Persist light theme to localStorage for compatibility with existing code
    localStorage.setItem(THEME_KEY, "light");
    document.documentElement.setAttribute("data-theme", "light");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#1f2937";
  } catch {
    // Silently fail if localStorage unavailable
  }
};

// No-op toggle to keep UI hooks functional while ensuring light theme
export const toggleTheme = () => {
  setTheme();
  return "light";
};
