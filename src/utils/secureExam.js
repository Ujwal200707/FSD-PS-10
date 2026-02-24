const STORAGE_KEYS = {
  EXAMS: "lms_secure_exams",
  ASSIGNMENTS: "lms_secure_exam_assignments",
  ATTEMPTS: "lms_secure_exam_attempts",
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const readStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const hashString = (input) => {
  let hash = 0;
  const value = String(input || "");
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const seededShuffle = (items, seed) => {
  const array = [...items];
  let currentSeed = hashString(seed);

  for (let i = array.length - 1; i > 0; i -= 1) {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    const j = currentSeed % (i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
};

export const detectSEBClient = () => {
  const ua = (navigator.userAgent || "").toLowerCase();
  const hasSebUa = ua.includes("safeexambrowser") || ua.includes("seb");
  const urlParams = new URLSearchParams(window.location.search);
  const sebFlag = urlParams.get("seb") === "1";
  return hasSebUa || sebFlag;
};

export const createSecureExam = ({
  id = `exam_${Date.now()}`,
  title = "",
  description = "",
  durationMinutes = 60,
  enabledSEB = true,
  autoSubmitOnFocusLoss = true,
  exitPassword = "",
  sebConfigPassword = "",
  sebConfigFileName = "",
  sebConfigContent = "",
  allowedUrl = "",
  questions = [],
  createdBy = "",
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
}) => ({
  id,
  title,
  description,
  durationMinutes,
  enabledSEB,
  autoSubmitOnFocusLoss,
  exitPassword,
  sebConfigPassword,
  sebConfigFileName,
  sebConfigContent,
  allowedUrl,
  questions: ensureArray(questions),
  createdBy,
  createdAt,
  updatedAt,
});

export const getSecureExams = (filters = {}) => {
  let exams = readStorage(STORAGE_KEYS.EXAMS);

  if (filters.createdBy) {
    exams = exams.filter((exam) => exam.createdBy === filters.createdBy);
  }
  if (typeof filters.enabledSEB === "boolean") {
    exams = exams.filter((exam) => Boolean(exam.enabledSEB) === filters.enabledSEB);
  }

  return exams.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
};

export const getSecureExamById = (examId) => getSecureExams().find((exam) => exam.id === examId) || null;

export const saveSecureExam = (examData) => {
  const exams = readStorage(STORAGE_KEYS.EXAMS);
  const normalized = createSecureExam({
    ...examData,
    updatedAt: new Date().toISOString(),
  });

  const index = exams.findIndex((exam) => exam.id === normalized.id);
  if (index >= 0) {
    exams[index] = { ...exams[index], ...normalized };
  } else {
    exams.push(normalized);
  }

  writeStorage(STORAGE_KEYS.EXAMS, exams);
  return normalized;
};

export const deleteSecureExam = (examId) => {
  const exams = readStorage(STORAGE_KEYS.EXAMS).filter((exam) => exam.id !== examId);
  const assignments = readStorage(STORAGE_KEYS.ASSIGNMENTS).filter((assignment) => assignment.examId !== examId);
  const attempts = readStorage(STORAGE_KEYS.ATTEMPTS).filter((attempt) => attempt.examId !== examId);

  writeStorage(STORAGE_KEYS.EXAMS, exams);
  writeStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  writeStorage(STORAGE_KEYS.ATTEMPTS, attempts);
  return true;
};

export const assignSecureExam = ({ examId, studentId, assignedBy = "", required = true }) => {
  const assignments = readStorage(STORAGE_KEYS.ASSIGNMENTS);
  const existing = assignments.find((item) => item.examId === examId && item.studentId === studentId);

  if (existing) {
    return existing;
  }

  const assignment = {
    id: `exa_${Date.now()}_${studentId}`,
    examId,
    studentId,
    required,
    assignedBy,
    assignedAt: new Date().toISOString(),
  };

  assignments.push(assignment);
  writeStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  return assignment;
};

export const unassignSecureExam = ({ examId, studentId }) => {
  const assignments = readStorage(STORAGE_KEYS.ASSIGNMENTS).filter(
    (item) => !(item.examId === examId && item.studentId === studentId)
  );
  writeStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  return true;
};

export const getSecureExamAssignments = (filters = {}) => {
  let assignments = readStorage(STORAGE_KEYS.ASSIGNMENTS);

  if (filters.examId) {
    assignments = assignments.filter((item) => item.examId === filters.examId);
  }
  if (filters.studentId) {
    assignments = assignments.filter((item) => item.studentId === filters.studentId);
  }

  return assignments.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
};

export const getAssignedSecureExamsForStudent = (studentId) => {
  const exams = getSecureExams();
  const assignments = getSecureExamAssignments({ studentId });

  return assignments
    .map((assignment) => {
      const exam = exams.find((item) => item.id === assignment.examId);
      if (!exam) return null;
      return { ...exam, assignment };
    })
    .filter(Boolean);
};

export const getSecureExamForStudent = (examId, studentId) => {
  const assignment = getSecureExamAssignments({ examId, studentId })[0];
  if (!assignment) return null;

  const exam = getSecureExamById(examId);
  if (!exam) return null;

  return { ...exam, assignment };
};

export const getRandomizedExamQuestions = ({ exam, studentId }) => {
  const questions = ensureArray(exam?.questions);
  return seededShuffle(questions, `${exam?.id}_${studentId}`);
};

export const startSecureExamAttempt = ({ examId, studentId, userAgent = "", isSEB = false }) => {
  const attempts = readStorage(STORAGE_KEYS.ATTEMPTS);
  const existingInProgress = attempts.find(
    (attempt) => attempt.examId === examId && attempt.studentId === studentId && attempt.status === "in_progress"
  );

  if (existingInProgress) {
    return existingInProgress;
  }

  const attempt = {
    id: `att_${Date.now()}_${studentId}`,
    examId,
    studentId,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    submittedReason: null,
    userAgent,
    isSEB,
    answers: {},
    score: null,
    activityLog: [
      {
        timestamp: new Date().toISOString(),
        event: "exam_started",
        details: "Exam session started",
      },
    ],
  };

  attempts.push(attempt);
  writeStorage(STORAGE_KEYS.ATTEMPTS, attempts);
  return attempt;
};

export const getSecureExamAttempts = (filters = {}) => {
  let attempts = readStorage(STORAGE_KEYS.ATTEMPTS);

  if (filters.examId) {
    attempts = attempts.filter((attempt) => attempt.examId === filters.examId);
  }
  if (filters.studentId) {
    attempts = attempts.filter((attempt) => attempt.studentId === filters.studentId);
  }
  if (filters.status) {
    attempts = attempts.filter((attempt) => attempt.status === filters.status);
  }

  return attempts.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
};

export const getLatestSecureExamAttempt = ({ examId, studentId }) =>
  getSecureExamAttempts({ examId, studentId })[0] || null;

export const updateSecureExamAttemptAnswers = ({ attemptId, answers }) => {
  const attempts = readStorage(STORAGE_KEYS.ATTEMPTS);
  const index = attempts.findIndex((attempt) => attempt.id === attemptId);
  if (index < 0) return null;

  attempts[index] = {
    ...attempts[index],
    answers: { ...attempts[index].answers, ...answers },
  };

  writeStorage(STORAGE_KEYS.ATTEMPTS, attempts);
  return attempts[index];
};

export const logSecureExamActivity = ({ attemptId, event, details = "" }) => {
  const attempts = readStorage(STORAGE_KEYS.ATTEMPTS);
  const index = attempts.findIndex((attempt) => attempt.id === attemptId);
  if (index < 0) return null;

  const activityLog = ensureArray(attempts[index].activityLog);
  activityLog.push({
    timestamp: new Date().toISOString(),
    event,
    details,
  });

  attempts[index] = {
    ...attempts[index],
    activityLog,
  };

  writeStorage(STORAGE_KEYS.ATTEMPTS, attempts);
  return attempts[index];
};

const calculateScore = (exam, answers) => {
  const questions = ensureArray(exam?.questions);
  if (!questions.length) return 0;

  let correct = 0;
  questions.forEach((question) => {
    const selected = answers?.[question.id];
    if (selected === question.correctOptionIndex) {
      correct += 1;
    }
  });

  return Math.round((correct / questions.length) * 100);
};

export const submitSecureExamAttempt = ({ attemptId, exam, reason = "submitted" }) => {
  const attempts = readStorage(STORAGE_KEYS.ATTEMPTS);
  const index = attempts.findIndex((attempt) => attempt.id === attemptId);
  if (index < 0) return null;

  const score = calculateScore(exam, attempts[index].answers);

  attempts[index] = {
    ...attempts[index],
    status: reason === "submitted" ? "submitted" : "auto_submitted",
    finishedAt: new Date().toISOString(),
    submittedReason: reason,
    score,
    activityLog: [
      ...ensureArray(attempts[index].activityLog),
      {
        timestamp: new Date().toISOString(),
        event: "exam_submitted",
        details: reason,
      },
    ],
  };

  writeStorage(STORAGE_KEYS.ATTEMPTS, attempts);
  return attempts[index];
};

export const createSebTemplateConfig = ({ examId, lmsBaseUrl, exitPassword = "", configPassword = "" }) => {
  const examUrl = `${lmsBaseUrl}/secure-exam/${examId}`;
  return {
    startURL: examUrl,
    sebMode: "kiosk",
    allowURLFilter: true,
    whitelistURL: [examUrl],
    allowSwitchToApplications: false,
    allowBrowserWindowToolbar: false,
    allowPrintScreen: false,
    enablePrivateClipboard: false,
    allowCopyPaste: false,
    allowRightClick: false,
    showTaskBar: false,
    allowSpellCheck: false,
    quitPassword: exitPassword || "CHANGE_ME_EXIT_PASSWORD",
    settingsPassword: configPassword || "OPTIONAL_CONFIG_PASSWORD",
    notes: "Distribute this config file to students and require Safe Exam Browser for exam access.",
  };
};
