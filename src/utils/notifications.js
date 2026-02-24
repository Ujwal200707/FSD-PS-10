/**
 * Notification and messaging utilities for LMS
 */

const STORAGE_KEYS = {
  NOTIFICATIONS: "lms_notifications",
  MESSAGES: "lms_messages",
  ANNOUNCEMENTS: "lms_announcements",
};

export const notificationTypes = {
  ASSIGNMENT_DUE: "assignment_due",
  GRADE_POSTED: "grade_posted",
  ANNOUNCEMENT: "announcement",
  ENROLLMENT: "enrollment",
  SUBMISSION_RECEIVED: "submission_received",
  COURSE_UPDATE: "course_update",
  MESSAGE: "message",
};

export const createNotification = ({
  id = String(Date.now()),
  type = notificationTypes.ANNOUNCEMENT,
  title = "",
  message = "",
  read = false,
  timestamp = new Date().toISOString(),
  actionUrl = null,
  relatedTo = null,
  sender = "System",
}) => ({
  id,
  type,
  title,
  message,
  read,
  timestamp,
  actionUrl,
  relatedTo,
  sender,
});

export const getNotifications = (userId) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]");
    return all.filter((n) => n.userId === userId || n.userId === "all");
  } catch {
    return [];
  }
};

export const addNotification = (userId, notificationData) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]");
    const newNotif = { ...notificationData, userId, id: notificationData.id || String(Date.now()) };
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([newNotif, ...all]));
    return newNotif;
  } catch {
    return null;
  }
};

export const markNotificationAsRead = (notificationId) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || "[]");
    const updated = all.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  } catch {
    // Silent fail
  }
};

export const getUnreadCount = (userId) => {
  return getNotifications(userId).filter((n) => !n.read).length;
};

export const createMessage = ({
  id = String(Date.now()),
  from = "",
  to = "",
  subject = "",
  body = "",
  timestamp = new Date().toISOString(),
  read = false,
}) => ({
  id,
  from,
  to,
  subject,
  body,
  timestamp,
  read,
});

export const getMessages = (userId) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || "[]");
    return all.filter((m) => m.to === userId || m.from === userId);
  } catch {
    return [];
  }
};

export const sendMessage = (messageData) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || "[]");
    const newMsg = { ...messageData, id: messageData.id || String(Date.now()) };
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([newMsg, ...all]));
    return newMsg;
  } catch {
    return null;
  }
};

export const createAnnouncement = ({
  id = String(Date.now()),
  courseId = null,
  title = "",
  content = "",
  author = "",
  timestamp = new Date().toISOString(),
  priority = "normal",
}) => ({
  id,
  courseId,
  title,
  content,
  author,
  timestamp,
  priority,
});

export const getAnnouncements = (courseId = null) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || "[]");
    if (courseId) {
      return all.filter((a) => a.courseId === courseId || a.courseId === null);
    }
    return all;
  } catch {
    return [];
  }
};

export const createAnnouncements = (announcementData) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || "[]");
    const newAnnounce = { ...announcementData, id: announcementData.id || String(Date.now()) };
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify([newAnnounce, ...all]));
    return newAnnounce;
  } catch {
    return null;
  }
};
