/**
 * User and admin management utilities
 */

import { getRegisteredUsers, setRegisteredUsers } from "./auth";

const STORAGE_KEYS = {
  USERS: "lms_users",
  USER_STATS: "lms_user_stats",
  PLATFORM_SETTINGS: "lms_platform_settings",
};

export const createUser = ({
  id = String(Date.now()),
  email = "",
  name = "",
  role = "student",
  status = "active",
  joinDate = new Date().toISOString(),
  department = "",
  phone = "",
  metadata = {},
}) => ({
  id,
  email,
  name,
  role,
  status,
  joinDate,
  department,
  phone,
  metadata,
});

export const getAllUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
  } catch {
    return [];
  }
};

export const getUsersByRole = (role) => {
  try {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
    return users.filter((u) => u.role === role);
  } catch {
    return [];
  }
};

export const saveUser = (userData) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
    const exists = all.findIndex((u) => u.id === userData.id);
    
    if (exists >= 0) {
      all[exists] = userData;
    } else {
      all.push(userData);
    }
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(all));
    return userData;
  } catch {
    return null;
  }
};

export const deleteUser = (userId) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
    const filtered = all.filter((u) => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
};

export const getUserStats = () => {
  try {
    const stats = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_STATS) || "{}");
    if (Object.keys(stats).length === 0) {
      return {
        totalUsers: 0,
        activeStudents: 0,
        activeInstructors: 0,
        activeAdmins: 0,
        totalEnrollments: 0,
        courseCompletion: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
    return stats;
  } catch {
    return {};
  }
};

export const updateUserStats = (updates) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_STATS) || "{}");
    const updated = { ...all, ...updates, lastUpdated: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
};

export const generatePlatformReport = () => {
  try {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
    const courses = JSON.parse(localStorage.getItem("lms_courses") || "[]");
    const enrollments = JSON.parse(localStorage.getItem("lms_enrollments") || "[]");
    const submissions = JSON.parse(localStorage.getItem("lms_submissions") || "[]");
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalUsers: users.length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        totalSubmissions: submissions.length,
      },
      userBreakdown: {
        students: users.filter((u) => u.role === "student").length,
        instructors: users.filter((u) => u.role === "teacher").length,
        admins: users.filter((u) => u.role === "admin").length,
        contentCreators: users.filter((u) => u.role === "content").length,
      },
      courseStats: {
        activeCoursesCount: courses.filter((c) => c.status === "Active").length,
        averageStudentsPerCourse:
          courses.length > 0
            ? Math.round(enrollments.length / courses.length)
            : 0,
        topCoursesByEnrollment: courses
          .map((c) => ({
            title: c.title,
            enrolled: c.studentsEnrolled || 0,
          }))
          .sort((a, b) => b.enrolled - a.enrolled)
          .slice(0, 5),
      },
      engagementMetrics: {
        submissionRate:
          enrollments.length > 0
            ? Math.round((submissions.length / enrollments.length) * 100)
            : 0,
      },
    };
    
    return report;
  } catch {
    return null;
  }
};

export const getPlatformSettings = () => {
  try {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS) || "{}");
    if (Object.keys(settings).length === 0) {
      return {
        platformName: "EduLMS",
        platformUrl: "https://edulms.local",
        supportEmail: "support@edulms.local",
        timezone: "UTC",
        maintenanceMode: false,
        allowPublicSignup: true,
        emailNotifications: true,
      };
    }
    return settings;
  } catch {
    return {};
  }
};

export const updatePlatformSettings = (settings) => {
  try {
    const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS) || "{}");
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(updated));
    return updated;
  } catch {
    return null;
  }
};

export const getActivityLog = (filters = {}) => {
  try {
    const log = JSON.parse(localStorage.getItem("lms_activity_log") || "[]");
    
    let filtered = log;
    if (filters.userId) {
      filtered = filtered.filter((l) => l.userId === filters.userId);
    }
    if (filters.action) {
      filtered = filtered.filter((l) => l.action === filters.action);
    }
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((l) => {
        const logDate = new Date(l.timestamp);
        return logDate >= new Date(filters.startDate) && logDate <= new Date(filters.endDate);
      });
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch {
    return [];
  }
};

export const logActivity = ({ userId, action, resourceType, resourceId, details }) => {
  try {
    const log = JSON.parse(localStorage.getItem("lms_activity_log") || "[]");
    
    log.push({
      id: String(Date.now()),
      userId,
      action,
      resourceType,
      resourceId,
      details,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 1000 entries
    if (log.length > 1000) {
      log.shift();
    }
    
    localStorage.setItem("lms_activity_log", JSON.stringify(log));
  } catch {
    // Silent fail
  }
};
