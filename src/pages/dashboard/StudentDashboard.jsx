import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@components/layout/Layout";
import StatCard from "@components/dashboard/StatCard";
import ProgressCard from "@components/ProgressCard";
import RatingModal from "@components/RatingModal";
import {
  FaBookOpen,
  FaClipboardList,
  FaStar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaGraduationCap,
  FaTrophy,
  FaUsers,
  FaShieldAlt,
} from "react-icons/fa";
import { getCurrentUser } from "@utils/auth";
import {
  getCourses,
  getEnrollments,
  getAssignments,
  getSubmissions,
  getStudentProgress,
} from "@utils/courses";
import { getNotifications } from "@utils/notifications";
import { saveRating } from "@utils/ratings";
import { getAssignedSecureExamsForStudent, getLatestSecureExamAttempt } from "@utils/secureExam";
import "./StudentDashboard.css";

/**
 * StudentDashboard Component
 * Displays student's enrolled courses, pending assignments, grades, and notifications
 * Integrates with real course data from utilities
 */
function StudentDashboard() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const studentId = currentUser?.id;

  // State management
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [secureExams, setSecureExams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    assignmentsSubmitted: 0,
    overallProgress: 0,
    unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedCourseForRating, setSelectedCourseForRating] = useState(null);

  // Load all student dashboard data
  useEffect(() => {
    if (!studentId) {
      setError("Student ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Get enrollments for this student
      const enrollments = getEnrollments({ studentId });
      const courses = getCourses();
      const assignments = getAssignments();
      const submissions = getSubmissions({ studentId });
      const userNotifications = getNotifications(studentId);

      // Build enrolled courses with progress
      const enrolled = enrollments
        .map((enrollment) => {
          const course = courses.find((c) => c.id === enrollment.courseId);
          if (!course) return null;

          const progress = getStudentProgress(studentId, enrollment.courseId);
          return {
            ...course,
            enrolledAt: enrollment.enrolledAt,
            progress: Math.round(progress || 0),
          };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));

      setEnrolledCourses(enrolled);

      // Get pending assignments (not submitted by this student)
      const submittedAssignmentIds = submissions.map((s) => s.assignmentId);
      const pending = assignments
        .filter((a) =>
          enrolled.some((c) => c.id === a.courseId) &&
          !submittedAssignmentIds.includes(a.id)
        )
        .map((a) => ({
          ...a,
          courseName: enrolled.find((c) => c.id === a.courseId)?.title || "Course",
          daysUntilDue: Math.ceil(
            (new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
          ),
        }))
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

      setPendingAssignments(pending);

      // Get recent grades (submitted assignments with grades)
      const graded = submissions
        .filter((s) => s.grade !== undefined && s.grade !== null)
        .map((s) => {
          const assignment = assignments.find((a) => a.id === s.assignmentId);
          const course = enrolled.find((c) => c.id === assignment?.courseId);
          return {
            ...s,
            assignmentTitle: assignment?.title || "Assignment",
            courseName: course?.title || "Course",
          };
        })
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
        .slice(0, 5);

      setRecentGrades(graded);

      // Calculate statistics
      const overallProgressAvg =
        enrolled.length > 0
          ? Math.round(enrolled.reduce((sum, c) => sum + c.progress, 0) / enrolled.length)
          : 0;

      setStats({
        coursesEnrolled: enrolled.length,
        assignmentsSubmitted: submissions.length,
        overallProgress: overallProgressAvg,
        unreadNotifications: userNotifications.filter((n) => !n.read).length,
      });

      setNotifications(userNotifications.slice(0, 5));

      const assignedExams = getAssignedSecureExamsForStudent(studentId).map((exam) => {
        const latestAttempt = getLatestSecureExamAttempt({ examId: exam.id, studentId });
        return {
          ...exam,
          latestAttempt,
        };
      });

      setSecureExams(assignedExams);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);
  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleAssignmentClick = (assignmentId) => {
    navigate(`/assignment/${assignmentId}`);
  };

  const handleRateCourse = (course) => {
    setSelectedCourseForRating(course);
    setRatingModalOpen(true);
  };

  const handleSubmitRating = (ratingData) => {
    try {
      saveRating({
        courseId: ratingData.courseId,
        studentId,
        rating: ratingData.rating,
        comment: ratingData.comment,
        createdAt: new Date().toISOString(),
      });
      setRatingModalOpen(false);
      setSelectedCourseForRating(null);
    } catch (err) {
      console.error("Failed to save rating:", err);
    }
  };

  return (
    <Layout>
      <div className="student-dashboard">
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: "20px" }}>
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            title="Courses Enrolled"
            value={stats.coursesEnrolled}
            icon={<FaBookOpen />}
            color="#667eea"
            subtitle="Active enrollments"
          />
          <StatCard
            title="Assignments Submitted"
            value={stats.assignmentsSubmitted}
            icon={<FaCheckCircle />}
            color="#10b981"
            subtitle="Completed work"
          />
          <StatCard
            title="Overall Progress"
            value={`${stats.overallProgress}%`}
            icon={<FaTrophy />}
            color="#f59e0b"
            subtitle="Across all courses"
          />
          <StatCard
            title="Notifications"
            value={stats.unreadNotifications}
            icon={<FaGraduationCap />}
            color="#ef4444"
            subtitle="Unread alerts"
          />
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Enrolled Courses Section */}
          <section className="dashboard-section full-width">
            <div className="section-header">
              <h3>My Courses</h3>
              <button
                className="btn-link"
                onClick={() => navigate("/courses")}
              >
                View All Courses →
              </button>
            </div>

            {enrolledCourses.length === 0 ? (
              <div className="empty-state">
                <FaBookOpen className="empty-icon" />
                <p>No courses enrolled yet</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/courses")}
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="courses-grid">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="course-card-wrapper">
                    <div
                      className="course-card-student"
                      onClick={() => handleCourseClick(course.id)}
                    >
                      <div className="course-thumbnail">
                        <div className="thumbnail-emoji">{course.thumbnail || "📚"}</div>
                        <span className="level-badge">{course.level || "Beginner"}</span>
                      </div>
                      <div className="course-content">
                        <h5 className="course-title">{course.title}</h5>
                        <p className="course-instructor">{course.instructor || "Instructor"}</p>

                        <div className="progress-section">
                          <div className="progress-header">
                            <span className="progress-label">Progress</span>
                            <span className="progress-percent">{course.progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="course-meta">
                          <span className="meta-item">
                            <FaUsers size={12} /> {course.enrolledCount || 0} students
                          </span>
                          <span className="meta-item">
                            <FaStar size={12} /> {course.rating || 4.5}★
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn-rate-course"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRateCourse(course);
                      }}
                      title="Rate this course"
                    >
                      <FaStar /> Rate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Assignments Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Secure Exams (SEB)</h3>
            </div>

            {secureExams.length === 0 ? (
              <div className="empty-state-compact">
                <FaShieldAlt className="empty-icon-small" style={{ color: "#3b82f6" }} />
                <p>No SEB-enabled exams assigned</p>
              </div>
            ) : (
              <div className="secure-exam-list">
                {secureExams.map((exam) => (
                  <div key={exam.id} className="secure-exam-item">
                    <div>
                      <h5>{exam.title}</h5>
                      <p>{exam.durationMinutes} min · SEB only</p>
                      <p>
                        Status: {exam.latestAttempt?.status || "not_started"}
                        {exam.latestAttempt?.startedAt
                          ? ` · Started ${new Date(exam.latestAttempt.startedAt).toLocaleString()}`
                          : ""}
                      </p>
                    </div>
                    <button
                      className="btn-submit"
                      onClick={() => navigate(`/secure-exam/${exam.id}`)}
                    >
                      Open in SEB
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <div className="section-header">
              <h3>Pending Assignments</h3>
              <button
                className="btn-link"
                onClick={() => navigate("/assignments")}
              >
                View All →
              </button>
            </div>

            {pendingAssignments.length === 0 ? (
              <div className="empty-state-compact">
                <FaCheckCircle className="empty-icon-small" style={{ color: "#10b981" }} />
                <p>No pending assignments!</p>
              </div>
            ) : (
              <div className="assignments-list">
                {pendingAssignments.map((assignment) => {
                  const isOverdue = assignment.daysUntilDue < 0;
                  const isUrgent = assignment.daysUntilDue <= 1 && assignment.daysUntilDue >= 0;

                  return (
                    <div
                      key={assignment.id}
                      className={`assignment-item ${isOverdue ? "overdue" : isUrgent ? "urgent" : ""}`}
                      onClick={() => handleAssignmentClick(assignment.id)}
                    >
                      <div className="assignment-icon">
                        {isOverdue ? (
                          <FaExclamationTriangle />
                        ) : (
                          <FaClock />
                        )}
                      </div>
                      <div className="assignment-details">
                        <h5 className="assignment-title">{assignment.title}</h5>
                        <p className="assignment-course">{assignment.courseName}</p>
                        <p className="assignment-due">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          {isOverdue
                            ? ` · Overdue ${Math.abs(assignment.daysUntilDue)} days`
                            : assignment.daysUntilDue === 0
                            ? " · Due today"
                            : ` · ${assignment.daysUntilDue} days left`}
                        </p>
                      </div>
                      <button
                        className="btn-submit"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate("/student/submit-assignment");
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recent Grades Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h3>Recent Grades</h3>
            </div>

            {recentGrades.length === 0 ? (
              <div className="empty-state-compact">
                <FaStar className="empty-icon-small" style={{ color: "#f59e0b" }} />
                <p>No grades posted yet</p>
              </div>
            ) : (
              <div className="grades-list">
                {recentGrades.map((grade) => {
                  const gradeValue = typeof grade.grade === "number" ? grade.grade : 0;
                  const gradeColor =
                    gradeValue >= 90
                      ? "#10b981"
                      : gradeValue >= 80
                      ? "#f59e0b"
                      : gradeValue >= 70
                      ? "#3b82f6"
                      : "#ef4444";

                  return (
                    <div key={grade.id} className="grade-item">
                      <div className="grade-assignment">
                        <h5 className="grade-title">{grade.assignmentTitle}</h5>
                        <p className="grade-course">{grade.courseName}</p>
                      </div>
                      <div className="grade-score">
                        <div className="grade-badge" style={{ backgroundColor: gradeColor }}>
                          {grade.grade}
                        </div>
                      </div>
                      <div className="grade-date">
                        {new Date(grade.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Notifications Section */}
          {notifications.length > 0 && (
            <section className="dashboard-section">
              <div className="section-header">
                <h3>Recent Notifications</h3>
                <button
                  className="btn-link"
                  onClick={() => navigate("/assignments")}
                >
                  View All →
                </button>
              </div>

              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-icon">
                      {notification.type === "assignment_due" && <FaClock />}
                      {notification.type === "grade_posted" && <FaStar />}
                      {notification.type === "announcement" && <FaClipboardList />}
                      {notification.type === "enrollment" && <FaBookOpen />}
                    </div>
                    <div className="notification-content">
                      <h5 className="notification-title">{notification.title}</h5>
                      <p className="notification-message">{notification.message}</p>
                      <p className="notification-date">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && <div className="notification-unread"></div>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <RatingModal
          isOpen={ratingModalOpen}
          courseId={selectedCourseForRating?.id}
          courseTitle={selectedCourseForRating?.title}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedCourseForRating(null);
          }}
          onSubmit={handleSubmitRating}
        />
      </div>
    </Layout>
  );
}

export default StudentDashboard;
