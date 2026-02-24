import { ROLE_HOME, ROLES } from "../constants/roles";

const STORAGE_KEYS = {
  CURRENT_USER: "currentUser",
  REGISTERED_USERS: "registeredUsers",
  ENROLLED_COURSES: "enrolledCourses",
  PASSWORD_RESET: "passwordReset",
};

export const normalizeRole = (role) => String(role || "").toLowerCase();

export const getRoleHome = (role) => ROLE_HOME[normalizeRole(role)] || "/";

export const readStorageJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const writeStorageJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getCurrentUser = () => readStorageJson(STORAGE_KEYS.CURRENT_USER, null);

export const setCurrentUser = (user) => writeStorageJson(STORAGE_KEYS.CURRENT_USER, user);

export const clearCurrentUser = () => localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);

export const getRegisteredUsers = () => readStorageJson(STORAGE_KEYS.REGISTERED_USERS, []);

export const setRegisteredUsers = (users) => writeStorageJson(STORAGE_KEYS.REGISTERED_USERS, users);

export const getEnrolledCourses = () => readStorageJson(STORAGE_KEYS.ENROLLED_COURSES, []);

export const setEnrolledCourses = (courses) => writeStorageJson(STORAGE_KEYS.ENROLLED_COURSES, courses);

export const getPasswordResetData = () => readStorageJson(STORAGE_KEYS.PASSWORD_RESET, null);

export const setPasswordResetData = (data) => writeStorageJson(STORAGE_KEYS.PASSWORD_RESET, data);

export const clearPasswordResetData = () => localStorage.removeItem(STORAGE_KEYS.PASSWORD_RESET);

export const canAccessRole = (userRole, allowedRoles = []) => {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return true;
  }
  const normalizedUserRole = normalizeRole(userRole);
  return allowedRoles.includes(normalizedUserRole);
};

export const isPrivilegedRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === ROLES.ADMIN || normalized === ROLES.TEACHER || normalized === ROLES.CONTENT;
};
