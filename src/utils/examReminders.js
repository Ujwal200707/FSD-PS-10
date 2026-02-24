/**
 * Exam Reminders Utility
 * Manages exam reminders/notifications for students
 */

const STORAGE_KEY = "lms_exam_reminders";

const readStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const writeStorage = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/**
 * Create an exam reminder
 */
export const createExamReminder = ({
  id = `reminder_${Date.now()}`,
  examId,
  studentId,
  reminderDate,
  message = "",
  isActive = true,
  createdAt = new Date().toISOString(),
}) => ({
  id,
  examId,
  studentId,
  reminderDate,
  message,
  isActive,
  createdAt,
});

/**
 * Get all exam reminders for a student
 */
export const getExamReminders = (studentId) => {
  const reminders = readStorage();
  return reminders
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
};

/**
 * Get upcoming exam reminders (reminders with date in the future)
 */
export const getUpcomingExamReminders = (studentId) => {
  const reminders = getExamReminders(studentId);
  const now = new Date();
  return reminders.filter((r) => r.isActive && new Date(r.reminderDate) > now);
};

/**
 * Get past exam reminders (reminders with date in the past)
 */
export const getPastExamReminders = (studentId) => {
  const reminders = getExamReminders(studentId);
  const now = new Date();
  return reminders.filter((r) => !r.isActive || new Date(r.reminderDate) <= now);
};

/**
 * Save an exam reminder
 */
export const saveExamReminder = (reminderData) => {
  const reminders = readStorage();
  const normalized = createExamReminder(reminderData);

  const index = reminders.findIndex((r) => r.id === normalized.id);
  if (index >= 0) {
    reminders[index] = { ...reminders[index], ...normalized };
  } else {
    reminders.push(normalized);
  }

  writeStorage(reminders);
  return normalized;
};

/**
 * Delete an exam reminder
 */
export const deleteExamReminder = (reminderId) => {
  const reminders = readStorage().filter((r) => r.id !== reminderId);
  writeStorage(reminders);
  return true;
};

/**
 * Toggle reminder active status
 */
export const toggleExamReminder = (reminderId) => {
  const reminders = readStorage();
  const index = reminders.findIndex((r) => r.id === reminderId);
  
  if (index >= 0) {
    reminders[index].isActive = !reminders[index].isActive;
    writeStorage(reminders);
    return reminders[index];
  }
  return null;
};

/**
 * Get exams with their reminders for a student
 * Combines exam data with reminder information
 */
export const getExamsWithReminders = (studentId) => {
  const { getAssignedSecureExamsForStudent, getSecureExamById } = require("./secureExam");
  const assignedExams = getAssignedSecureExamsForStudent(studentId);
  const reminders = getExamReminders(studentId);

  return assignedExams.map((exam) => {
    const examReminders = reminders.filter((r) => r.examId === exam.id);
    const nextReminder = examReminders
      .filter((r) => r.isActive)
      .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate))[0] || null;

    const examDate = exam.scheduledDate ? new Date(exam.scheduledDate) : null;
    const now = new Date();
    const daysUntilExam = examDate ? Math.ceil((examDate - now) / (1000 * 60 * 60 * 24)) : null;

    return {
      ...exam,
      reminders: examReminders,
      nextReminder,
      daysUntilExam,
      isUpcoming: daysUntilExam !== null && daysUntilExam > 0,
      isToday: daysUntilExam === 0,
      isPast: daysUntilExam !== null && daysUntilExam < 0,
    };
  });
};

/**
 * Auto-create reminders for assigned exams
 * Creates default reminders for exams scheduled in the future
 */
export const autoCreateRemindersForExam = (exam, studentId) => {
  if (!exam.scheduledDate) return [];

  const examDate = new Date(exam.scheduledDate);
  const now = new Date();
  
  if (examDate <= now) return [];

  const defaultReminders = [
    { daysBefore: 7, message: `Reminder: Your exam "${exam.title}" is scheduled for next week.` },
    { daysBefore: 3, message: `Heads up! "${exam.title}" is in 3 days. Start preparing!` },
    { daysBefore: 1, message: `Tomorrow! Your exam "${exam.title}" is scheduled for tomorrow.` },
    { daysBefore: 0, message: `Today is your exam "${exam.title}"! Good luck!` },
  ];

  const createdReminders = [];

  defaultReminders.forEach(({ daysBefore, message }) => {
    const reminderDate = new Date(examDate);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);

    if (reminderDate > now) {
      const reminder = saveExamReminder({
        examId: exam.id,
        studentId,
        reminderDate: reminderDate.toISOString(),
        message,
      });
      createdReminders.push(reminder);
    }
  });

  return createdReminders;
};
