/**
 * Course progress tracking
 */

const PROGRESS_KEY = "lms_progress";
const MILESTONES_KEY = "lms_milestones";

export const createProgressRecord = ({
  id = String(Date.now()),
  studentId = "",
  courseId = "",
  completedLessons = 0,
  totalLessons = 1,
  completedAssignments = 0,
  totalAssignments = 1,
  grade = 0,
  lastAccessed = new Date().toISOString(),
}) => ({
  id,
  studentId,
  courseId,
  completedLessons,
  totalLessons,
  completedAssignments,
  totalAssignments,
  grade,
  lastAccessed,
});

export const updateProgress = (progressData) => {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
    const idx = all.findIndex((p) => p.studentId === progressData.studentId && p.courseId === progressData.courseId);
    if (idx > -1) {
      all[idx] = { ...all[idx], ...progressData, lastAccessed: new Date().toISOString() };
    } else {
      all.push(progressData);
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
    return progressData;
  } catch {
    return null;
  }
};

export const getProgress = (studentId, courseId) => {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
    return all.find((p) => p.studentId === studentId && p.courseId === courseId) || null;
  } catch {
    return null;
  }
};

export const getStudentProgress = (studentId) => {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
    return all.filter((p) => p.studentId === studentId);
  } catch {
    return [];
  }
};

export const getCourseProgress = (courseId) => {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]");
    return all.filter((p) => p.courseId === courseId);
  } catch {
    return [];
  }
};

export const calculateProgressPercentage = (progress) => {
  const lessons = (progress.completedLessons / (progress.totalLessons || 1)) * 100;
  const assignments = (progress.completedAssignments / (progress.totalAssignments || 1)) * 100;
  return Math.round((lessons + assignments) / 2);
};

export const createMilestone = ({
  id = String(Date.now()),
  studentId = "",
  courseId = "",
  type = "lesson",
  title = "",
  completedAt = new Date().toISOString(),
}) => ({
  id,
  studentId,
  courseId,
  type,
  title,
  completedAt,
});

export const recordMilestone = (milestoneData) => {
  try {
    const all = JSON.parse(localStorage.getItem(MILESTONES_KEY) || "[]");
    const exists = all.find((m) => m.studentId === milestoneData.studentId && m.courseId === milestoneData.courseId && m.type === milestoneData.type && m.title === milestoneData.title);
    if (!exists) {
      all.push(milestoneData);
      localStorage.setItem(MILESTONES_KEY, JSON.stringify(all));
    }
    return milestoneData;
  } catch {
    return null;
  }
};

export const getMilestones = (studentId, courseId) => {
  try {
    const all = JSON.parse(localStorage.getItem(MILESTONES_KEY) || "[]");
    return all.filter((m) => m.studentId === studentId && m.courseId === courseId).sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  } catch {
    return [];
  }
};
