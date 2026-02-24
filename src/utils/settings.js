import {
  getCurrentUser,
  getRegisteredUsers,
  setCurrentUser,
  setRegisteredUsers,
} from "./auth";
import { getPlatformSettings, updatePlatformSettings } from "./admin";
import { getTheme, setTheme } from "./theme";

const STORAGE_KEYS = {
  USER_SETTINGS: "lms_user_settings",
};

const getAllUserSettings = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_SETTINGS) || "{}");
  } catch {
    return {};
  }
};

const saveAllUserSettings = (settingsByUserId) => {
  localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settingsByUserId));
};

const buildDefaultSettings = (user) => ({
  profile: {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    timezone: "UTC",
    language: "English",
  },
  preferences: {
    inAppNotifications: true,
    emailNotifications: true,
    assignmentReminders: true,
    darkMode: getTheme() === "dark",
  },
});

export const getUserSettings = (userId) => {
  const currentUser = getCurrentUser();
  const effectiveUserId = userId || currentUser?.id;

  if (!effectiveUserId) {
    return buildDefaultSettings(currentUser);
  }

  const all = getAllUserSettings();
  const existing = all[effectiveUserId];
  const defaults = buildDefaultSettings(currentUser);

  if (!existing) {
    return defaults;
  }

  return {
    profile: {
      ...defaults.profile,
      ...(existing.profile || {}),
    },
    preferences: {
      ...defaults.preferences,
      ...(existing.preferences || {}),
    },
  };
};

export const updateUserSettings = (userId, updates) => {
  if (!userId) {
    return null;
  }

  const all = getAllUserSettings();
  const current = getUserSettings(userId);
  const merged = {
    profile: {
      ...current.profile,
      ...(updates?.profile || {}),
    },
    preferences: {
      ...current.preferences,
      ...(updates?.preferences || {}),
    },
  };

  all[userId] = merged;
  saveAllUserSettings(all);

  return merged;
};

export const updateUserProfile = (userId, profileUpdates) => {
  if (!userId || !profileUpdates) {
    return null;
  }

  const users = getRegisteredUsers();
  const index = users.findIndex((user) => user.id === userId);

  if (index >= 0) {
    users[index] = {
      ...users[index],
      ...profileUpdates,
    };
    setRegisteredUsers(users);
  }

  const currentUser = getCurrentUser();
  if (currentUser?.id === userId) {
    setCurrentUser({
      ...currentUser,
      ...profileUpdates,
    });
  }

  return profileUpdates;
};

export const getPlatformSettingsData = () => getPlatformSettings();

export const updatePlatformSettingsData = (updates) => updatePlatformSettings(updates);

export const applyThemePreference = (isDarkMode) => {
  setTheme(isDarkMode ? "dark" : "light");
};
