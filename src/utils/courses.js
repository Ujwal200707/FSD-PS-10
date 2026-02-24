/**
 * Course and content management utilities
 */

const STORAGE_KEYS = {
  COURSES: "lms_courses",
  ENROLLMENTS: "lms_enrollments",
  ASSIGNMENTS: "lms_assignments",
  SUBMISSIONS: "lms_submissions",
  GRADES: "lms_grades",
  COURSE_VIDEOS: "lms_course_videos",
  LESSON_PROGRESS: "lms_lesson_progress",
  VIDEO_WATCHED: "lms_video_watched",
};

const PROTECTED_VIDEO_EDIT_ROLES = ["admin", "teacher", "content"];

export const createCourse = ({
  id = String(Date.now()),
  title = "",
  description = "",
  instructor = "",
  instructorId = "",
  category = "",
  level = "Beginner",
  duration = "4 weeks",
  price = "Free",
  thumbnail = "📚",
  studentsEnrolled = 0,
  rating = 0,
  reviews = 0,
  modules = [],
  status = "Active",
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
}) => ({
  id,
  title,
  description,
  instructor,
  instructorId,
  category,
  level,
  duration,
  price,
  thumbnail,
  studentsEnrolled,
  rating,
  reviews,
  modules,
  status,
  createdAt,
  updatedAt,
});

export const getCourses = (filters = {}) => {
  try {
    let courses = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || "[]");
    
    if (filters.instructorId) {
      courses = courses.filter((c) => c.instructorId === filters.instructorId);
    }
    if (filters.status) {
      courses = courses.filter((c) => c.status === filters.status);
    }
    if (filters.category) {
      courses = courses.filter((c) => c.category === filters.category);
    }
    if (filters.level) {
      courses = courses.filter((c) => c.level === filters.level);
    }
    
    return courses;
  } catch {
    return [];
  }
};

export const saveCourse = (courseData) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || "[]");
    const exists = all.findIndex((c) => c.id === courseData.id);
    
    if (exists >= 0) {
      all[exists] = { ...all[exists], ...courseData, updatedAt: new Date().toISOString() };
    } else {
      all.push(courseData);
    }
    
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(all));
    return courseData;
  } catch {
    return null;
  }
};

export const deleteCourse = (courseId) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || "[]");
    const filtered = all.filter((c) => c.id !== courseId);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
};

export const enrollStudent = (courseId, studentId, studentEmail) => {
  try {
    const enrollments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENTS) || "[]");
    
    const exists = enrollments.some((e) => e.courseId === courseId && e.studentId === studentId);
    if (exists) return false;
    
    enrollments.push({
      id: String(Date.now()),
      courseId,
      studentId,
      studentEmail,
      enrolledAt: new Date().toISOString(),
      progress: 0,
    });
    
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    
    // Update course student count
    const courses = JSON.parse(localStorage.getItem(STORAGE_KEYS.COURSES) || "[]");
    const courseIndex = courses.findIndex((c) => c.id === courseId);
    if (courseIndex >= 0) {
      courses[courseIndex].studentsEnrolled = (courses[courseIndex].studentsEnrolled || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    }
    
    return true;
  } catch {
    return false;
  }
};

export const getEnrollments = (filters = {}) => {
  try {
    let enrollments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENTS) || "[]");
    
    if (filters.studentId) {
      enrollments = enrollments.filter((e) => e.studentId === filters.studentId);
    }
    if (filters.courseId) {
      enrollments = enrollments.filter((e) => e.courseId === filters.courseId);
    }
    
    return enrollments;
  } catch {
    return [];
  }
};

export const createAssignment = ({
  id = String(Date.now()),
  courseId = "",
  title = "",
  description = "",
  dueDate = "",
  points = 100,
  status = "Active",
  createdAt = new Date().toISOString(),
}) => ({
  id,
  courseId,
  title,
  description,
  dueDate,
  points,
  status,
  createdAt,
});

export const getAssignments = (filters = {}) => {
  try {
    let assignments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || "[]");
    
    if (filters.courseId) {
      assignments = assignments.filter((a) => a.courseId === filters.courseId);
    }
    if (filters.status) {
      assignments = assignments.filter((a) => a.status === filters.status);
    }
    
    return assignments;
  } catch {
    return [];
  }
};

export const saveAssignment = (assignmentData) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS) || "[]");
    const exists = all.findIndex((a) => a.id === assignmentData.id);
    
    if (exists >= 0) {
      all[exists] = assignmentData;
    } else {
      all.push(assignmentData);
    }
    
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(all));
    return assignmentData;
  } catch {
    return null;
  }
};

export const submitAssignment = ({
  id = String(Date.now()),
  assignmentId = "",
  studentId = "",
  studentName = "",
  submissionDate = new Date().toISOString(),
  fileUrl = "",
  content = "",
  status = "submitted",
}) => ({
  id,
  assignmentId,
  studentId,
  studentName,
  submissionDate,
  fileUrl,
  content,
  status,
  grade: null,
  feedback: "",
});

export const getSubmissions = (filters = {}) => {
  try {
    let submissions = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || "[]");
    
    if (filters.assignmentId) {
      submissions = submissions.filter((s) => s.assignmentId === filters.assignmentId);
    }
    if (filters.studentId) {
      submissions = submissions.filter((s) => s.studentId === filters.studentId);
    }
    if (filters.status) {
      submissions = submissions.filter((s) => s.status === filters.status);
    }
    
    return submissions;
  } catch {
    return [];
  }
};

export const saveSubmission = (submissionData) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || "[]");
    const exists = all.findIndex((s) => s.id === submissionData.id);
    
    if (exists >= 0) {
      all[exists] = submissionData;
    } else {
      all.push(submissionData);
    }
    
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(all));
    return submissionData;
  } catch {
    return null;
  }
};

export const gradeSubmission = (submissionId, grade, feedback) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || "[]");
    const submission = all.find((s) => s.id === submissionId);
    
    if (submission) {
      submission.grade = grade;
      submission.feedback = feedback;
      submission.status = "graded";
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(all));
      return submission;
    }
    return null;
  } catch {
    return null;
  }
};

export const getStudentProgress = (studentId, courseId) => {
  try {
    const enrollments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENTS) || "[]");
    const enrollment = enrollments.find(
      (e) => e.studentId === studentId && e.courseId === courseId
    );
    
    if (!enrollment) return 0;
    
    return enrollment.progress || 0;
  } catch {
    return 0;
  }
};

export const updateStudentProgress = (studentId, courseId, progress) => {
  try {
    const enrollments = JSON.parse(localStorage.getItem(STORAGE_KEYS.ENROLLMENTS) || "[]");
    const enrollment = enrollments.find(
      (e) => e.studentId === studentId && e.courseId === courseId
    );
    
    if (enrollment) {
      enrollment.progress = Math.min(100, Math.max(0, progress));
      localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
      return enrollment.progress;
    }
    return null;
  } catch {
    return null;
  }
};

const normalizeString = (value) => String(value || "").trim().toLowerCase();

const deriveTopicKeyword = (course = {}) => {
  const title = normalizeString(course.title);
  const category = normalizeString(course.category);

  if (title.includes("react") || title.includes("frontend") || category.includes("web")) {
    return "web-development";
  }
  if (title.includes("python") || category.includes("data")) {
    return "python";
  }
  if (title.includes("ui") || title.includes("ux") || category.includes("design")) {
    return "design";
  }
  if (title.includes("javascript")) {
    return "javascript";
  }

  return "programming";
};

const VIDEO_LIBRARY = {
  "web-development": [
    {
      id: "vid_web_1",
      title: "React Course for Beginners",
      description: "Comprehensive React fundamentals and project-based practice.",
      source: "freeCodeCamp",
      youtubeId: "bMknfKXIFA8",
    },
    {
      id: "vid_web_2",
      title: "React JS Crash Course",
      description: "Fast-paced React crash course for modern frontend development.",
      source: "Traversy Media",
      youtubeId: "w7ejDZ8SWv8",
    },
    {
      id: "vid_web_3",
      title: "React Tutorial for Beginners",
      description: "Step-by-step React tutorial covering components, props, and state.",
      source: "Programming with Mosh",
      youtubeId: "SqcY0GlETPk",
    },
  ],
  python: [
    {
      id: "vid_py_1",
      title: "Python Full Course for Beginners",
      description: "End-to-end Python course with core syntax and practical examples.",
      source: "freeCodeCamp",
      youtubeId: "rfscVS0vtbw",
    },
    {
      id: "vid_py_2",
      title: "Python Tutorial for Beginners",
      description: "Clear Python introduction with hands-on mini examples.",
      source: "Programming with Mosh",
      youtubeId: "_uQrJ0TkZlc",
    },
    {
      id: "vid_py_3",
      title: "Python OOP Tutorial",
      description: "Object-oriented programming patterns in Python.",
      source: "Corey Schafer",
      youtubeId: "ZDa-Z5JzLYM",
    },
  ],
  javascript: [
    {
      id: "vid_js_1",
      title: "JavaScript Full Course",
      description: "Modern JavaScript fundamentals and ES features.",
      source: "freeCodeCamp",
      youtubeId: "PkZNo7MFNFg",
    },
    {
      id: "vid_js_2",
      title: "JavaScript Crash Course",
      description: "Concise JavaScript crash course with DOM examples.",
      source: "Traversy Media",
      youtubeId: "hdI2bqOjy3c",
    },
    {
      id: "vid_js_3",
      title: "JavaScript Tutorial for Beginners",
      description: "Beginner-friendly JavaScript tutorial and concepts.",
      source: "Programming with Mosh",
      youtubeId: "W6NZfCO5SIk",
    },
  ],
  design: [
    {
      id: "vid_design_1",
      title: "UI/UX Design Course",
      description: "Core UI/UX principles, usability, and design systems.",
      source: "freeCodeCamp",
      youtubeId: "c9Wg6Cb_YlU",
    },
    {
      id: "vid_design_2",
      title: "UI Design Principles",
      description: "Practical visual design principles for product interfaces.",
      source: "Traversy Media",
      youtubeId: "3YB4Qf6wq6Q",
    },
    {
      id: "vid_design_3",
      title: "Figma UI Design Tutorial",
      description: "Beginner to intermediate Figma and UI workflow tutorial.",
      source: "Tech With Tim",
      youtubeId: "FTFaQWZBqQ8",
    },
  ],
  programming: [
    {
      id: "vid_prog_1",
      title: "Computer Science Full Course",
      description: "Broad computer science fundamentals for software learners.",
      source: "freeCodeCamp",
      youtubeId: "zOjov-2OZ0E",
    },
    {
      id: "vid_prog_2",
      title: "Programming Roadmap for Beginners",
      description: "Structured path for beginners to become developers.",
      source: "Programming with Mosh",
      youtubeId: "8jLOx1hD3_o",
    },
    {
      id: "vid_prog_3",
      title: "Learn to Code: Start Here",
      description: "Practical guidance for getting started in programming.",
      source: "Tech With Tim",
      youtubeId: "N4mEzFDjqtA",
    },
  ],
};

const toEmbedUrl = (youtubeId) => `https://www.youtube.com/embed/${youtubeId}`;
const toThumbnailUrl = (youtubeId) => `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;

export const extractYoutubeVideoId = (urlOrId = "") => {
  const value = String(urlOrId || "").trim();
  if (!value) return "";

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const parsedUrl = new URL(value);
    const host = parsedUrl.hostname.replace("www.", "");

    if (host === "youtu.be") {
      const shortId = parsedUrl.pathname.replace("/", "");
      return /^[a-zA-Z0-9_-]{11}$/.test(shortId) ? shortId : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsedUrl.pathname === "/watch") {
        const watchId = parsedUrl.searchParams.get("v") || "";
        return /^[a-zA-Z0-9_-]{11}$/.test(watchId) ? watchId : "";
      }

      if (parsedUrl.pathname.startsWith("/embed/")) {
        const embedId = parsedUrl.pathname.replace("/embed/", "").split("/")[0];
        return /^[a-zA-Z0-9_-]{11}$/.test(embedId) ? embedId : "";
      }

      if (parsedUrl.pathname.startsWith("/shorts/")) {
        const shortsId = parsedUrl.pathname.replace("/shorts/", "").split("/")[0];
        return /^[a-zA-Z0-9_-]{11}$/.test(shortsId) ? shortsId : "";
      }
    }
  } catch {
    return "";
  }

  return "";
};

export const getYoutubeThumbnailFromUrl = (urlOrId = "") => {
  const videoId = extractYoutubeVideoId(urlOrId);
  return videoId ? toThumbnailUrl(videoId) : "";
};

const mapVideoForUI = (video) => ({
  ...video,
  embedUrl: toEmbedUrl(video.youtubeId),
  thumbnail: toThumbnailUrl(video.youtubeId),
});

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const buildDefaultLessons = (module, moduleIndex) => {
  const lessonCount = Number(module.lessons) > 0 ? Number(module.lessons) : 4;
  return Array.from({ length: lessonCount }).map((_, lessonIndex) => ({
    id: `m${module.id || moduleIndex + 1}_l${lessonIndex + 1}`,
    title: `${module.title} · Lesson ${lessonIndex + 1}`,
    type: lessonIndex % 3 === 0 ? "video" : lessonIndex % 3 === 1 ? "article" : "quiz",
    duration: `${10 + lessonIndex * 5}m`,
  }));
};

const normalizeModules = (course) => {
  if (!Array.isArray(course?.modules)) {
    return [];
  }

  return course.modules.map((module, moduleIndex) => {
    const lessons = Array.isArray(module.lessons)
      ? module.lessons.map((lesson, lessonIndex) => ({
          id: lesson.id || `m${module.id || moduleIndex + 1}_l${lessonIndex + 1}`,
          title: lesson.title || `Lesson ${lessonIndex + 1}`,
          type: lesson.type || "video",
          duration: lesson.duration || "15m",
        }))
      : buildDefaultLessons(module, moduleIndex);

    return {
      id: module.id || `m${moduleIndex + 1}`,
      title: module.title || `Module ${moduleIndex + 1}`,
      duration: module.duration || `${Math.max(1, lessons.length)}h`,
      lessons,
    };
  });
};

export const getCourseById = (courseId) => getCourses().find((course) => String(course.id) === String(courseId)) || null;

export const isStudentEnrolled = (studentId, courseId) =>
  getEnrollments({ studentId }).some((enrollment) => String(enrollment.courseId) === String(courseId));

export const enrollInCourseApi = (courseId, student) => {
  const studentId = student?.id;
  if (!studentId) {
    return { success: false, error: "Student not authenticated" };
  }

  const enrolled = enrollStudent(String(courseId), String(studentId), student?.email || "");
  if (!enrolled && !isStudentEnrolled(String(studentId), String(courseId))) {
    return { success: false, error: "Enrollment failed" };
  }

  const enrollment = getEnrollments({ studentId: String(studentId), courseId: String(courseId) })[0] || null;
  return { success: true, enrollment };
};

export const getCourseLearningContent = (courseId) => {
  const course = getCourseById(courseId);
  if (!course) return null;

  return {
    ...course,
    modules: normalizeModules(course),
  };
};

export const getCourseVideos = (courseId) => {
  const course = getCourseById(courseId);
  if (!course) return [];

  const customVideosMap = readJson(STORAGE_KEYS.COURSE_VIDEOS, {});
  const customVideos = customVideosMap[String(courseId)];

  if (Array.isArray(customVideos) && customVideos.length) {
    return customVideos.map(mapVideoForUI);
  }

  const topic = deriveTopicKeyword(course);
  const fallbackVideos = VIDEO_LIBRARY[topic] || VIDEO_LIBRARY.programming;
  return fallbackVideos.map(mapVideoForUI);
};

export const getCourseVideosApi = (courseId) => {
  const videos = getCourseVideos(courseId);
  return { success: true, data: videos };
};

export const saveCourseVideos = ({ courseId, videos = [], actorRole = "" }) => {
  const normalizedRole = normalizeString(actorRole);
  if (!PROTECTED_VIDEO_EDIT_ROLES.includes(normalizedRole)) {
    return { success: false, error: "You are not allowed to edit videos" };
  }

  const sanitized = videos
    .map((video, index) => ({
      id: video.id || `vid_custom_${Date.now()}_${index}`,
      title: String(video.title || "").trim(),
      description: String(video.description || "").trim(),
      source: String(video.source || "Custom").trim(),
      youtubeId: String(video.youtubeId || "").trim(),
    }))
    .filter((video) => video.title && video.youtubeId);

  const all = readJson(STORAGE_KEYS.COURSE_VIDEOS, {});
  all[String(courseId)] = sanitized;
  writeJson(STORAGE_KEYS.COURSE_VIDEOS, all);

  return { success: true, videos: sanitized.map(mapVideoForUI) };
};

export const createCourseVideoApi = ({ courseId, actorRole = "", payload = {} }) => {
  const youtubeId = extractYoutubeVideoId(payload.youtubeUrl || payload.youtubeId || "");
  if (!youtubeId) {
    return { success: false, error: "Invalid YouTube URL" };
  }

  const existing = getCourseVideos(courseId).map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    source: video.source,
    youtubeId: video.youtubeId,
  }));

  const result = saveCourseVideos({
    courseId,
    actorRole,
    videos: [
      ...existing,
      {
        id: `vid_custom_${Date.now()}`,
        title: String(payload.title || "").trim(),
        description: String(payload.description || "").trim(),
        source: String(payload.source || "Custom").trim(),
        youtubeId,
      },
    ],
  });

  if (!result.success) {
    return { success: false, error: result.error || "Failed to create video" };
  }

  const created = result.videos[result.videos.length - 1] || null;
  return { success: true, data: created, videos: result.videos };
};

export const updateCourseVideoApi = ({ courseId, videoId, actorRole = "", payload = {} }) => {
  const currentVideos = getCourseVideos(courseId).map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    source: video.source,
    youtubeId: video.youtubeId,
  }));

  const target = currentVideos.find((video) => String(video.id) === String(videoId));
  if (!target) {
    return { success: false, error: "Video not found" };
  }

  const updatedYoutubeId = payload.youtubeUrl || payload.youtubeId
    ? extractYoutubeVideoId(payload.youtubeUrl || payload.youtubeId)
    : target.youtubeId;

  if (!updatedYoutubeId) {
    return { success: false, error: "Invalid YouTube URL" };
  }

  const updatedList = currentVideos.map((video) =>
    String(video.id) === String(videoId)
      ? {
          ...video,
          title: payload.title !== undefined ? String(payload.title || "").trim() : video.title,
          description:
            payload.description !== undefined
              ? String(payload.description || "").trim()
              : video.description,
          source: payload.source !== undefined ? String(payload.source || "Custom").trim() : video.source,
          youtubeId: updatedYoutubeId,
        }
      : video
  );

  const result = saveCourseVideos({ courseId, actorRole, videos: updatedList });
  if (!result.success) {
    return { success: false, error: result.error || "Failed to update video" };
  }

  const updated = result.videos.find((video) => String(video.id) === String(videoId)) || null;
  return { success: true, data: updated, videos: result.videos };
};

export const deleteCourseVideoApi = ({ courseId, videoId, actorRole = "" }) => {
  const currentVideos = getCourseVideos(courseId).map((video) => ({
    id: video.id,
    title: video.title,
    description: video.description,
    source: video.source,
    youtubeId: video.youtubeId,
  }));

  const exists = currentVideos.some((video) => String(video.id) === String(videoId));
  if (!exists) {
    return { success: false, error: "Video not found" };
  }

  const nextVideos = currentVideos.filter((video) => String(video.id) !== String(videoId));
  const result = saveCourseVideos({ courseId, actorRole, videos: nextVideos });

  if (!result.success) {
    return { success: false, error: result.error || "Failed to delete video" };
  }

  return { success: true, videos: result.videos };
};

const getProgressKey = (studentId, courseId) => `${studentId}::${courseId}`;

export const getCompletedLessonIds = (studentId, courseId) => {
  const all = readJson(STORAGE_KEYS.LESSON_PROGRESS, {});
  const values = all[getProgressKey(studentId, courseId)] || [];
  return new Set(Array.isArray(values) ? values : []);
};

export const toggleLessonCompletion = (studentId, courseId, lessonId) => {
  const key = getProgressKey(studentId, courseId);
  const all = readJson(STORAGE_KEYS.LESSON_PROGRESS, {});
  const current = new Set(Array.isArray(all[key]) ? all[key] : []);

  if (current.has(lessonId)) {
    current.delete(lessonId);
  } else {
    current.add(lessonId);
  }

  all[key] = [...current];
  writeJson(STORAGE_KEYS.LESSON_PROGRESS, all);
  return new Set(all[key]);
};

export const getWatchedVideoIds = (studentId, courseId) => {
  const all = readJson(STORAGE_KEYS.VIDEO_WATCHED, {});
  const values = all[getProgressKey(studentId, courseId)] || [];
  return new Set(Array.isArray(values) ? values : []);
};

export const markVideoWatched = (studentId, courseId, videoId) => {
  const key = getProgressKey(studentId, courseId);
  const all = readJson(STORAGE_KEYS.VIDEO_WATCHED, {});
  const current = new Set(Array.isArray(all[key]) ? all[key] : []);
  current.add(videoId);
  all[key] = [...current];
  writeJson(STORAGE_KEYS.VIDEO_WATCHED, all);
  return new Set(all[key]);
};

export const calculateLearningProgress = (modules = [], completedLessonIds = new Set()) => {
  const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
  if (!totalLessons) return 0;
  return Math.round((completedLessonIds.size / totalLessons) * 100);
};
