import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@components/layout/Layout";
import StatCard from "@components/dashboard/StatCard";
import {
  FaBook,
  FaUsers,
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaStar,
  FaTrophy,
} from "react-icons/fa";
import { getCurrentUser } from "@utils/auth";
import {
  getCourses,
  getEnrollments,
  getAssignments,
  getSubmissions,
  gradeSubmission,
} from "@utils/courses";
import "./TeacherDashboard.css";

/**
 * TeacherDashboard Component
 * Displays teacher's courses, student submissions, grading interface, and analytics
 * Integrates with real course management and grading utilities
 */
function TeacherDashboard() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const teacherId = currentUser?.id;

  // State management
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [gradedSubmissions, setGradedSubmissions] = useState([]);
  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    activeStudents: 0,
    pendingGrades: 0,
    totalSubmissions: 0,
  });
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingForm, setGradingForm] = useState({ grade: "", feedback: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load all teacher dashboard data
  useEffect(() => {
    if (!teacherId) {
      setError("Teacher ID not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Get teacher's courses
      const courses = getCourses();
      const instructorCourseList = courses.filter(
        (c) => c.instructorId === teacherId || c.instructor === currentUser?.name
      );

      setInstructorCourses(instructorCourseList);

      // Get all submissions for teacher's courses
      const submissions = getSubmissions();
      const courseIds = instructorCourseList.map((c) => c.id);
      const assignments = getAssignments();

      const relevantSubmissions = submissions.filter((s) => {
        const assignment = assignments.find((a) => a.id === s.assignmentId);
        return assignment && courseIds.includes(assignment.courseId);
      });

      // Separate pending and graded submissions
      const pending = relevantSubmissions
        .filter((s) => s.grade === undefined || s.grade === null)
        .map((s) => {
          const assignment = assignments.find((a) => a.id === s.assignmentId);
          const course = instructorCourseList.find((c) => c.id === assignment?.courseId);
          return {
            ...s,
            assignmentTitle: assignment?.title || "Assignment",
            courseName: course?.title || "Course",
            submittedDate: new Date(s.submittedAt).toLocaleDateString(),
          };
        })
        .slice(0, 10);

      const graded = relevantSubmissions
        .filter((s) => s.grade !== undefined && s.grade !== null)
        .map((s) => {
          const assignment = assignments.find((a) => a.id === s.assignmentId);
          const course = instructorCourseList.find((c) => c.id === assignment?.courseId);
          return {
            ...s,
            assignmentTitle: assignment?.title || "Assignment",
            courseName: course?.title || "Course",
            submittedDate: new Date(s.submittedAt).toLocaleDateString(),
          };
        })
        .sort((a, b) => new Date(b.gradedAt) - new Date(a.gradedAt))
        .slice(0, 5);

      setPendingSubmissions(pending);
      setGradedSubmissions(graded);

      // Get enrollments for student count
      const enrollments = getEnrollments();
      const studentCount = new Set(
        enrollments
          .filter((e) => courseIds.includes(e.courseId))
          .map((e) => e.studentId)
      ).size;

      // Calculate statistics
      setCourseStats({
        totalCourses: instructorCourseList.length,
        activeStudents: studentCount,
        pendingGrades: pending.length,
        totalSubmissions: relevantSubmissions.length,
      });
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [teacherId, currentUser?.name]);

  const handleGradeSubmission = () => {
    if (!selectedSubmission || !gradingForm.grade) {
      setError("Please enter a grade");
      return;
    }

    try {
      gradeSubmission(selectedSubmission.id, gradingForm.grade, gradingForm.feedback);
      
      // Update UI
      setPendingSubmissions((prev) =>
        prev.filter((s) => s.id !== selectedSubmission.id)
      );

      setGradedSubmissions((prev) => [
        {
          ...selectedSubmission,
          grade: gradingForm.grade,
          feedback: gradingForm.feedback,
        },
        ...prev,
      ]);

      setSuccess("Grade submitted successfully!");
      setSelectedSubmission(null);
      setGradingForm({ grade: "", feedback: "" });

      // Update stats
      setCourseStats((prev) => ({
        ...prev,
        pendingGrades: prev.pendingGrades - 1,
      }));

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to submit grade");
    }
  };

  const handleSubmissionSelect = (submission) => {
    setSelectedSubmission(submission);
    setGradingForm({ grade: "", feedback: "" });
  };

  const getGradeColor = (grade) => {
    const g = typeof grade === "number" ? grade : parseInt(grade);
    if (g >= 90) return "#10b981";
    if (g >= 80) return "#f59e0b";
    if (g >= 70) return "#3b82f6";
    return "#ef4444";
  };

  if (loading) {
    return (
      <Layout>
        <div className="teacher-dashboard">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="teacher-dashboard">
        {error && (
          <div className="alert alert-danger">
            {error}
            <button onClick={() => setError("")} className="close-btn">×</button>
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            title="Courses Teaching"
            value={courseStats.totalCourses}
            icon={<FaBook />}
            color="#667eea"
            subtitle="Active courses"
          />
          <StatCard
            title="Active Students"
            value={courseStats.activeStudents}
            icon={<FaUsers />}
            color="#10b981"
            subtitle="All enrollments"
          />
          <StatCard
            title="Pending Grades"
            value={courseStats.pendingGrades}
            icon={<FaClipboardList />}
            color="#f59e0b"
            subtitle="Awaiting review"
          />
          <StatCard
            title="Total Submissions"
            value={courseStats.totalSubmissions}
            icon={<FaCheckCircle />}
            color="#3b82f6"
            subtitle="All time"
          />
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* My Courses Section */}
          <section className="dashboard-section full-width">
            <div className="section-header">
              <h3>My Courses</h3>
              <button
                className="btn-link"
                onClick={() => navigate("/courses")}
              >
                Manage Courses →
              </button>
            </div>

            {instructorCourses.length === 0 ? (
              <div className="empty-state">
                <FaBook className="empty-icon" />
                <p>No courses yet</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/instructor/create-course")}
                >
                  Create Course
                </button>
              </div>
            ) : (
              <div className="courses-grid">
                {instructorCourses.map((course) => {
                  const courseSubmissions = pendingSubmissions.filter(
                    (s) => s.courseName === course.title
                  );
                  return (
                    <div key={course.id} className="course-card-teacher">
                      <div className="course-header">
                        <h4>{course.title}</h4>
                        <span className="course-level">{course.level}</span>
                      </div>
                      <p className="course-description">{course.description?.substring(0, 80)}...</p>
                      <div className="course-stats">
                        <span>👥 {course.enrolledCount || 0} students</span>
                        <span>⭐ {course.rating || 4.5}★</span>
                      </div>
                      {courseSubmissions.length > 0 && (
                        <div className="pending-badge">
                          {courseSubmissions.length} pending submissions
                        </div>
                      )}
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        <FaEye size={14} /> View Course
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Submissions Overview (read-only counts per course) */}
          <section className="dashboard-section full-width">
            <div className="section-header">
              <h3>Submissions Overview</h3>
            </div>
            <div className="submissions-overview-grid">
              {instructorCourses.map((course) => {
                const assignments = getAssignments().filter((a) => a.courseId === course.id);
                const courseSubmissionCount = getSubmissions().filter((s) =>
                  assignments.some((a) => a.id === s.assignmentId)
                ).length;
                return (
                  <div key={course.id} className="submission-count-card">
                    <h4>{course.title}</h4>
                    <div className="submission-count">{courseSubmissionCount} students submitted</div>
                    <div className="course-meta">{assignments.length} assignments</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Recently Graded Section */}
          {gradedSubmissions.length > 0 && (
            <section className="dashboard-section full-width">
              <div className="section-header">
                <h3>Recently Graded</h3>
              </div>

              <div className="graded-list">
                {gradedSubmissions.map((submission) => {
                  const gradeValue = typeof submission.grade === "number" 
                    ? submission.grade 
                    : parseInt(submission.grade);

                  return (
                    <div key={submission.id} className="graded-item">
                      <div className="graded-info">
                        <h5 className="student-name">{submission.studentName}</h5>
                        <div className="graded-meta">
                          <span>{submission.assignmentTitle}</span>
                          <span className="separator">•</span>
                          <span>{submission.courseName}</span>
                        </div>
                        {submission.feedback && (
                          <p className="feedback-preview">{submission.feedback.substring(0, 60)}...</p>
                        )}
                      </div>
                      <div className="graded-grade">
                        <div
                          className="grade-display"
                          style={{ backgroundColor: getGradeColor(gradeValue) }}
                        >
                          {gradeValue}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default TeacherDashboard;
