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

          {/* Pending Submissions vs Grading Interface */}
          <div className="grading-grid">
            {/* Pending Submissions List */}
            <section className="dashboard-section">
              <div className="section-header">
                <h3>Pending Submissions ({pendingSubmissions.length})</h3>
                <button
                  className="btn-link"
                  onClick={() => navigate("/assignments")}
                >
                  Grade Assignments →
                </button>
              </div>

              {pendingSubmissions.length === 0 ? (
                <div className="empty-state-compact">
                  <FaCheckCircle className="empty-icon-small" style={{ color: "#10b981" }} />
                  <p>All submissions graded!</p>
                </div>
              ) : (
                <div className="submissions-list">
                  {pendingSubmissions.map((submission) => (
                    <div
                      key={submission.id}
                      className={`submission-item ${
                        selectedSubmission?.id === submission.id ? "selected" : ""
                      }`}
                      onClick={() => handleSubmissionSelect(submission)}
                    >
                      <div className="submission-info">
                        <h5 className="student-name">{submission.studentName}</h5>
                        <p className="assignment-name">{submission.assignmentTitle}</p>
                        <p className="course-name">{submission.courseName}</p>
                        <p className="submit-date">Submitted: {submission.submittedDate}</p>
                      </div>
                      <div className="submission-action">
                        <FaEye size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Grading Interface */}
            <section className="dashboard-section">
              <div className="section-header">
                <h3>Grading Panel</h3>
              </div>

              {!selectedSubmission ? (
                <div className="empty-state-compact">
                  <FaClipboardList className="empty-icon-small" />
                  <p>Select a submission to grade</p>
                </div>
              ) : (
                <div className="grading-form">
                  <div className="form-section">
                    <h4>Submission Details</h4>
                    <div className="detail-row">
                      <span className="label">Student:</span>
                      <span className="value">{selectedSubmission.studentName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Assignment:</span>
                      <span className="value">{selectedSubmission.assignmentTitle}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Course:</span>
                      <span className="value">{selectedSubmission.courseName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Submitted:</span>
                      <span className="value">{selectedSubmission.submittedDate}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="grade">Grade (0-100):</label>
                    <input
                      id="grade"
                      type="number"
                      min="0"
                      max="100"
                      value={gradingForm.grade}
                      onChange={(e) =>
                        setGradingForm({ ...gradingForm, grade: e.target.value })
                      }
                      placeholder="Enter grade"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="feedback">Feedback:</label>
                    <textarea
                      id="feedback"
                      value={gradingForm.feedback}
                      onChange={(e) =>
                        setGradingForm({ ...gradingForm, feedback: e.target.value })
                      }
                      placeholder="Provide constructive feedback..."
                      className="form-textarea"
                      rows="5"
                    />
                  </div>

                  <button
                    className="btn btn-submit"
                    onClick={handleGradeSubmission}
                  >
                    <FaCheckCircle /> Submit Grade
                  </button>
                </div>
              )}
            </section>
          </div>

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
