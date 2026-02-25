import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@components/layout/Layout";
import {
  FaBell,
  FaCalendarAlt,
  FaClock,
  FaTrash,
  FaPlus,
  FaExclamationTriangle,
  FaCheckCircle,
  FaBook,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { getCurrentUser } from "@utils/auth";
import {
  getAssignedSecureExamsForStudent,
  getSecureExamById,
} from "@utils/secureExam";
import {
  getExamReminders,
  getUpcomingExamReminders,
  saveExamReminder,
  deleteExamReminder,
  toggleExamReminder,
} from "@utils/examReminders";
import { createNotification, addNotification } from "@utils/notifications";
import "./ExamReminders.css";

function ExamReminders() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const studentId = currentUser?.id;
  const studentEmail = currentUser?.email;

  const [reminders, setReminders] = useState([]);
  const [assignedExams, setAssignedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    examId: "",
    reminderDate: "",
    message: "",
    studentEmail: "",
  });

  // Load data
  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get assigned exams
      const exams = getAssignedSecureExamsForStudent(studentId);
      setAssignedExams(exams);

      // Get reminders
      const studentReminders = getExamReminders(studentId);
      setReminders(studentReminders);
    } catch (err) {
      console.error("Failed to load exam reminders:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // Get upcoming reminders (reminders with date in the future)
  const upcomingReminders = useMemo(() => {
    const now = new Date();
    return reminders.filter(
      (r) => r.isActive && new Date(r.reminderDate) > now
    );
  }, [reminders]);

  // Get past reminders
  const pastReminders = useMemo(() => {
    const now = new Date();
    return reminders.filter(
      (r) => !r.isActive || new Date(r.reminderDate) <= now
    );
  }, [reminders]);

  // Handle adding a new reminder
  const handleAddReminder = () => {
    if (!newReminder.examId || !newReminder.reminderDate) {
      return;
    }

    const exam = assignedExams.find((e) => e.id === newReminder.examId);
    const reminderMessage =
      newReminder.message ||
      `Reminder for exam: ${exam?.title || "Exam"}`;

    const reminder = saveExamReminder({
      examId: newReminder.examId,
      studentId,
      studentEmail: newReminder.studentEmail || studentEmail,
      reminderDate: new Date(newReminder.reminderDate).toISOString(),
      message: reminderMessage,
    });

    setReminders((prev) => [...prev, reminder]);
    // Create an in-app notification for the created reminder and include student email
    try {
      const notifMessage = `Reminder set for ${exam?.title || "Exam"} on ${formatDate(
        reminder.reminderDate
      )} ${formatTime(reminder.reminderDate)}. Student email: ${studentEmail}`;

      const notif = createNotification({
        type: "announcement",
        title: "Exam Reminder Created",
        message: notifMessage,
        actionUrl: exam ? `/secure-exam/${exam.id}` : null,
        relatedTo: { reminderId: reminder.id, examId: reminder.examId, studentEmail },
      });

      addNotification(studentId, notif);
    } catch (e) {
      console.warn("Failed to create reminder notification:", e);
    }
    setNewReminder({ examId: "", reminderDate: "", message: "" });
    setShowAddForm(false);
  };

  // Handle deleting a reminder
  const handleDeleteReminder = (reminderId) => {
    if (!window.confirm("Delete this reminder?")) return;

    deleteExamReminder(reminderId);
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  // Handle toggling reminder
  const handleToggleReminder = (reminderId) => {
    const updated = toggleExamReminder(reminderId);
    if (updated) {
      setReminders((prev) =>
        prev.map((r) => (r.id === reminderId ? updated : r))
      );
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get days until reminder
  const getDaysUntil = (dateString) => {
    const now = new Date();
    const target = new Date(dateString);
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Get exam by ID
  const getExamById = (examId) => {
    return assignedExams.find((e) => e.id === examId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="exam-reminders-page">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading exam reminders...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="exam-reminders-page">
        {/* Header */}
        <div className="reminders-header">
          <div className="header-content">
            <div className="header-icon">
              <FaBell />
            </div>
            <div className="header-text">
              <h1>Exam Reminders</h1>
              <p>Stay prepared for your upcoming exams</p>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <FaPlus /> Add Reminder
          </button>
        </div>

        {/* Add Reminder Form */}
        {showAddForm && (
          <div className="add-reminder-card">
            <h3>Add New Reminder</h3>
            <div className="reminder-form">
              <div className="form-group">
                <label>Exam Name</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Enter exam name..."
                  value={newReminder.examId}
                  onChange={(e) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      examId: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Reminder Date & Time</label>
                <input
                  type="datetime-local"
                  className="search-input"
                  value={newReminder.reminderDate}
                  onChange={(e) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      reminderDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Message (optional)</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Custom reminder message..."
                  value={newReminder.message}
                  onChange={(e) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-group">
                <label>Student Email (optional)</label>
                <input
                  type="email"
                  className="search-input"
                  placeholder="Student email (defaults to your account email)"
                  value={newReminder.studentEmail || studentEmail || ""}
                  onChange={(e) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      studentEmail: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleAddReminder}
                  disabled={!newReminder.examId || !newReminder.reminderDate}
                >
                  Save Reminder
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewReminder({ examId: "", reminderDate: "", message: "", studentEmail: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="reminders-stats">
          <div className="stat-card">
            <div className="stat-icon upcoming">
              <FaClock />
            </div>
            <div className="stat-info">
              <h3>{upcomingReminders.length}</h3>
              <p>Upcoming Reminders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon exams">
              <FaBook />
            </div>
            <div className="stat-info">
              <h3>{assignedExams.length}</h3>
              <p>Assigned Exams</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon past">
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <h3>{pastReminders.length}</h3>
              <p>Past Reminders</p>
            </div>
          </div>
        </div>

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <section className="reminders-section">
            <h2>
              <FaClock /> Upcoming Reminders
            </h2>
            <div className="reminders-list">
              {upcomingReminders
                .sort(
                  (a, b) =>
                    new Date(a.reminderDate) - new Date(b.reminderDate)
                )
                .map((reminder) => {
                  const daysUntil = getDaysUntil(reminder.reminderDate);

                  return (
                    <div
                      key={reminder.id}
                      className={`reminder-card ${
                        daysUntil <= 1 ? "urgent" : ""
                      }`}
                    >
                      <div className="reminder-date-badge">
                        <span className="days-count">{daysUntil}</span>
                        <span className="days-label">
                          {daysUntil === 0
                            ? "Today"
                            : daysUntil === 1
                            ? "Tomorrow"
                            : "days"}
                        </span>
                      </div>
                      <div className="reminder-content">
                        <h4>{reminder.examId || "Exam"}</h4>
                        <p className="reminder-message">{reminder.message}</p>
                        <div className="reminder-meta">
                          <span>
                            <FaCalendarAlt />{" "}
                            {formatDate(reminder.reminderDate)}
                          </span>
                          <span>
                            <FaClock /> {formatTime(reminder.reminderDate)}
                          </span>
                        </div>
                      </div>
                      <div className="reminder-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleToggleReminder(reminder.id)}
                          title={reminder.isActive ? "Pause" : "Activate"}
                        >
                          {reminder.isActive ? (
                            <FaToggleOn />
                          ) : (
                            <FaToggleOff />
                          )}
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteReminder(reminder.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* No Reminders State */}
        {reminders.length === 0 && (
          <div className="empty-state">
            <FaBell className="empty-icon" />
            <h3>No Exam Reminders Yet</h3>
            <p>
              You don't have any exam reminders set up. Add a reminder to stay
              prepared for your upcoming exams.
            </p>
            {assignedExams.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                <FaPlus /> Create Your First Reminder
              </button>
            )}
          </div>
        )}

        {/* Past Reminders */}
        {pastReminders.length > 0 && (
          <section className="reminders-section past-section">
            <h2>
              <FaCheckCircle /> Past Reminders
            </h2>
            <div className="reminders-list">
              {pastReminders
                .sort(
                  (a, b) =>
                    new Date(b.reminderDate) - new Date(a.reminderDate)
                )
                .map((reminder) => {
                  return (
                    <div key={reminder.id} className="reminder-card past">
                      <div className="reminder-date-badge past">
                        <FaCheckCircle />
                      </div>
                      <div className="reminder-content">
                        <h4>{reminder.examId || "Exam"}</h4>
                        <p className="reminder-message">{reminder.message}</p>
                        <div className="reminder-meta">
                          <span>
                            <FaCalendarAlt />{" "}
                            {formatDate(reminder.reminderDate)}
                          </span>
                        </div>
                      </div>
                      <div className="reminder-actions">
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDeleteReminder(reminder.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* Assigned Exams List */}
        {assignedExams.length > 0 && (
          <section className="reminders-section">
            <h2>
              <FaBook /> Your Assigned Exams
            </h2>
            <div className="exams-grid">
              {assignedExams.map((exam) => (
                <div
                  key={exam.id}
                  className="exam-card"
                  onClick={() => navigate(`/secure-exam/${exam.id}`)}
                >
                  <div className="exam-icon">
                    <FaBook />
                  </div>
                  <div className="exam-info">
                    <h4>{exam.title}</h4>
                    <p>
                      {exam.durationMinutes} minutes • SEB Required
                    </p>
                  </div>
                  <button className="btn-view-small">
                    View Exam
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

export default ExamReminders;
