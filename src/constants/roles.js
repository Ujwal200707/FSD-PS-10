export const ROLES = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  CONTENT: "content",
};

export const ALL_ROLES = [
  ROLES.ADMIN,
  ROLES.TEACHER,
  ROLES.STUDENT,
  ROLES.CONTENT,
];

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.TEACHER]: "Teacher",
  [ROLES.STUDENT]: "Student",
  [ROLES.CONTENT]: "Content Creator",
};

export const ROLE_HOME = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.TEACHER]: "/instructor",
  [ROLES.STUDENT]: "/student",
  [ROLES.CONTENT]: "/content-creator",
};
