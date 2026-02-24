/**
 * Analytics and reporting utilities
 */

import { getCourses, getEnrollments, getAssignments, getSubmissions } from "./courses.js";
import { getAllUsers } from "./admin.js";
import { getCourseProgress, getStudentProgress } from "./progress.js";

export const getAdminAnalytics = () => {
  try {
    const students = getAllUsers().filter(u => u.role === "student");
    const courses = getCourses();
    const enrollments = getEnrollments();
    const submissions = getSubmissions();

    const totalStudents = students.length;
    const totalCourses = courses.length;
    const totalEnrollments = enrollments.length;
    
    const avgGrade = submissions.length > 0 
      ? (submissions.filter(s => s.grade !== null && s.grade !== undefined).reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.filter(s => s.grade !== null && s.grade !== undefined).length).toFixed(2) 
      : 0;

    const completionRate = enrollments.length > 0 
      ? ((submissions.filter((s) => s.grade !== null && s.grade !== undefined && s.grade >= 50).length / enrollments.length) * 100).toFixed(2) 
      : 0;

    const engagementByRole = {
      student: getAllUsers().filter((s) => s.role === "student").length,
      instructor: getAllUsers().filter((s) => s.role === "teacher").length,
      contentcreator: getAllUsers().filter((s) => s.role === "content").length,
      admin: getAllUsers().filter((s) => s.role === "admin").length,
    };

    const courseMetrics = courses.map((course) => {
      const courseEnrollments = enrollments.filter((e) => e.courseId === course.id);
      const courseSubmissions = submissions.filter((s) => s.courseId === course.id);
      const gradedSubmissions = courseSubmissions.filter((s) => s.grade !== null && s.grade !== undefined);
      const avgCourseGrade = gradedSubmissions.length > 0 ? (gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length).toFixed(2) : 0;

      return {
        name: course.title,
        enrollments: courseEnrollments.length,
        avgGrade: parseFloat(avgCourseGrade),
        completionRate: courseEnrollments.length > 0 ? ((gradedSubmissions.filter((s) => s.grade >= 50).length / courseEnrollments.length) * 100).toFixed(2) : 0,
      };
    });

    return {
      totalStudents,
      totalCourses,
      totalEnrollments,
      avgGrade: parseFloat(avgGrade),
      completionRate: parseFloat(completionRate),
      engagementByRole,
      courseMetrics,
    };
  } catch {
    return {
      totalStudents: 0,
      totalCourses: 0,
      totalEnrollments: 0,
      avgGrade: 0,
      completionRate: 0,
      engagementByRole: { student: 0, instructor: 0, contentcreator: 0, admin: 0 },
      courseMetrics: [],
    };
  }
};

export const getInstructorAnalytics = (instructorId) => {
  try {
    const courses = getCourses().filter((c) => c.instructorId === instructorId);
    const submissions = getSubmissions().filter((s) => courses.some((c) => c.id === s.courseId));
    const gradedSubmissions = submissions.filter((s) => s.grade !== null && s.grade !== undefined);

    const totalCourses = courses.length;
    const totalStudents = new Set(submissions.map((s) => s.studentId)).size;
    const avgGrade = gradedSubmissions.length > 0 ? (gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length).toFixed(2) : 0;
    const submissionRate = submissions.length > 0 ? ((gradedSubmissions.length / submissions.length) * 100).toFixed(2) : 0;

    const courseMetrics = courses.map((course) => {
      const courseSubmissions = submissions.filter((s) => s.courseId === course.id);
      const courseGradedSubmissions = courseSubmissions.filter((s) => s.grade !== null && s.grade !== undefined);
      const avgCourseGrade = courseGradedSubmissions.length > 0 ? (courseGradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / courseGradedSubmissions.length).toFixed(2) : 0;

      return {
        name: course.title,
        students: new Set(courseSubmissions.map((s) => s.studentId)).size,
        submissions: courseSubmissions.length,
        graded: courseGradedSubmissions.length,
        avgGrade: parseFloat(avgCourseGrade),
      };
    });

    return {
      totalCourses,
      totalStudents,
      avgGrade: parseFloat(avgGrade),
      submissionRate: parseFloat(submissionRate),
      courseMetrics,
    };
  } catch {
    return {
      totalCourses: 0,
      totalStudents: 0,
      avgGrade: 0,
      submissionRate: 0,
      courseMetrics: [],
    };
  }
};

export const getStudentAnalytics = (studentId) => {
  try {
    const enrollments = getEnrollments().filter((e) => e.studentId === studentId);
    const courses = getCourses();
    const submissions = getSubmissions().filter((s) => s.studentId === studentId);
    const progressRecords = getStudentProgress(studentId);

    const totalCoursesEnrolled = enrollments.length;
    const gradedSubmissions = submissions.filter((s) => s.grade !== null && s.grade !== undefined);
    const avgGrade = gradedSubmissions.length > 0 ? (gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length).toFixed(2) : 0;
    const completedCourses = progressRecords.filter((p) => p.completedLessons === p.totalLessons).length;
    const overallProgress = progressRecords.length > 0 ? (progressRecords.reduce((sum, p) => sum + (p.completedLessons / (p.totalLessons || 1)), 0) / progressRecords.length).toFixed(2) : 0;

    const courseProgress = enrollments.map((enrollment) => {
      const course = courses.find((c) => c.id === enrollment.courseId);
      const progress = progressRecords.find((p) => p.courseId === enrollment.courseId);
      const courseSubmission = submissions.find((s) => s.courseId === enrollment.courseId);

      return {
        name: course?.title || "",
        progress: progress ? ((progress.completedLessons / (progress.totalLessons || 1)) * 100).toFixed(2) : 0,
        grade: courseSubmission?.grade || 0,
        status: progress && progress.completedLessons === progress.totalLessons ? "Completed" : "In Progress",
      };
    });

    return {
      totalCoursesEnrolled,
      avgGrade: parseFloat(avgGrade),
      completedCourses,
      overallProgress: parseFloat(overallProgress),
      courseProgress,
    };
  } catch {
    return {
      totalCoursesEnrolled: 0,
      avgGrade: 0,
      completedCourses: 0,
      overallProgress: 0,
      courseProgress: [],
    };
  }
};

export const getContentCreatorAnalytics = (creatorId) => {
  try {
    const courses = getCourses().filter((c) => c.content_creator_id === creatorId);
    const enrollments = getEnrollments().filter((e) => courses.some((c) => c.id === e.courseId));

    const totalContent = courses.length;
    const totalReach = enrollments.length;
    const avgEnrollmentsPerCourse = totalContent > 0 ? (totalReach / totalContent).toFixed(2) : 0;

    const contentQuality = courses.map((course) => {
      const courseEnrollments = enrollments.filter((e) => e.courseId === course.id);
      return {
        name: course.title,
        enrollments: courseEnrollments.length,
        rating: (Math.random() * 2 + 3).toFixed(1),
      };
    });

    return {
      totalContent,
      totalReach,
      avgEnrollmentsPerCourse: parseFloat(avgEnrollmentsPerCourse),
      contentQuality,
    };
  } catch {
    return {
      totalContent: 0,
      totalReach: 0,
      avgEnrollmentsPerCourse: 0,
      contentQuality: [],
    };
  }
};
