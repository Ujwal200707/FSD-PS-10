import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Layout from "@components/layout/Layout";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronDown,
  FaChevronRight,
  FaClock,
  FaFileUpload,
  FaPlay,
  FaUserGraduate,
  FaVideo,
} from "react-icons/fa";
import { ROLES } from "../constants/roles";
import { getCurrentUser } from "@utils/auth";
import {
  calculateLearningProgress,
  getAssignments,
  getCompletedLessonIds,
  getCourseLearningContent,
  getCourseVideos,
  getEnrollments,
  getSubmissions,
  getWatchedVideoIds,
  isStudentEnrolled,
  markVideoWatched,
  saveSubmission,
  submitAssignment,
  toggleLessonCompletion,
  updateStudentProgress,
} from "@utils/courses";
import "./CourseLearnPage.css";

const CourseLearnPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const userRole = currentUser?.role;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [course, setCourse] = useState(null);
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [watchedVideoIds, setWatchedVideoIds] = useState(new Set());

  const progress = useMemo(
    () => calculateLearningProgress(modules, completedLessonIds),
    [modules, completedLessonIds]
  );

  useEffect(() => {
    const loadLearningData = () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const learningCourse = getCourseLearningContent(courseId);
        if (!learningCourse) {
          setError("Course not found");
          setLoading(false);
          return;
        }

        const enrolled = isStudentEnrolled(currentUser.id, courseId);
        if (!enrolled) {
          setLoading(false);
          return;
        }

        const enrollment = getEnrollments({ studentId: currentUser.id, courseId })[0];
        const allAssignments = getAssignments({ courseId });
        const submissions = getSubmissions({ studentId: currentUser.id });

        setCourse(learningCourse);
        setModules(learningCourse.modules || []);
        setEnrollmentDate(enrollment?.enrolledAt || "");

        const defaultExpanded = (learningCourse.modules || []).reduce((acc, module, index) => {
          acc[module.id] = index === 0;
          return acc;
        }, {});
        setExpandedModules(defaultExpanded);

        const completedSet = getCompletedLessonIds(currentUser.id, courseId);
        setCompletedLessonIds(completedSet);

        const watchedSet = getWatchedVideoIds(currentUser.id, courseId);
        setWatchedVideoIds(watchedSet);

        const assignmentView = allAssignments.map((assignment) => {
          const submission = submissions.find((item) => item.assignmentId === assignment.id);
          return {
            ...assignment,
            submission,
            submitted: Boolean(submission),
          };
        });

        setAssignments(assignmentView);
        setVideos(getCourseVideos(courseId));
      } catch {
        setError("Failed to load course learning content");
      } finally {
        setLoading(false);
      }
    };

    loadLearningData();
  }, [courseId, currentUser]);

  useEffect(() => {
    if (currentUser?.id && courseId) {
      updateStudentProgress(currentUser.id, courseId, progress);
    }
  }, [courseId, currentUser?.id, progress]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== ROLES.STUDENT) {
    return <Navigate to={`/course/${courseId}`} replace />;
  }

  if (!loading && !isStudentEnrolled(currentUser.id, courseId)) {
    return <Navigate to={`/course/${courseId}`} replace />;
  }

  const toggleModule = (moduleId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleLessonToggle = (lessonId) => {
    const updatedSet = toggleLessonCompletion(currentUser.id, courseId, lessonId);
    setCompletedLessonIds(updatedSet);
    setMessage("Lesson progress updated");
    setTimeout(() => setMessage(""), 2500);
  };

  const handleAssignmentUpload = (assignment) => {
    const payload = submitAssignment({
      assignmentId: assignment.id,
      studentId: currentUser.id,
      studentName: currentUser.name || currentUser.email,
      content: "Submitted from learning dashboard",
      fileUrl: `upload://${assignment.id}`,
      status: "submitted",
    });

    const saved = saveSubmission(payload);
    if (!saved) {
      setError("Failed to submit assignment");
      return;
    }

    setAssignments((prev) =>
      prev.map((item) =>
        item.id === assignment.id
          ? {
              ...item,
              submitted: true,
              submission: saved,
            }
          : item
      )
    );

    setMessage(`Submitted: ${assignment.title}`);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleMarkVideoWatched = (videoId) => {
    const updatedSet = markVideoWatched(currentUser.id, courseId, videoId);
    setWatchedVideoIds(updatedSet);
    setMessage("Video marked as watched");
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <Layout pageTitle={course ? `${course.title} · Learn` : "Course Learning"}>
      <div className="course-learn-page">
        {error ? <div className="learn-alert learn-alert-error">{error}</div> : null}
        {message ? <div className="learn-alert learn-alert-success">{message}</div> : null}

        {loading ? (
          <div className="learn-skeleton-grid">
            <div className="learn-skeleton learn-skeleton-header" />
            <div className="learn-skeleton" />
            <div className="learn-skeleton" />
            <div className="learn-skeleton" />
          </div>
        ) : (
          <>
            <section className="learn-card learn-header-card">
              <div className="learn-header-main">
                <h1>{course?.title}</h1>
                <p>{course?.description}</p>
                <div className="learn-header-meta">
                  <span>
                    <FaUserGraduate /> {course?.instructor || "Instructor"}
                  </span>
                  <span>
                    <FaCalendarAlt />
                    {enrollmentDate ? new Date(enrollmentDate).toLocaleDateString() : "Enrolled today"}
                  </span>
                </div>
              </div>

              <div className="learn-progress-wrap">
                <div className="learn-progress-label">
                  <span>Progress</span>
                  <strong>{progress}%</strong>
                </div>
                <div className="learn-progress-track">
                  <div className="learn-progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </section>

            <section className="learn-card">
              <div className="learn-section-header">
                <h2>Modules & Lessons</h2>
              </div>
              <div className="modules-list">
                {modules.map((module) => {
                  const isExpanded = Boolean(expandedModules[module.id]);
                  return (
                    <article key={module.id} className="module-card">
                      <button className="module-toggle" onClick={() => toggleModule(module.id)}>
                        <span className="module-title-wrap">
                          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                          <strong>{module.title}</strong>
                        </span>
                        <span className="module-duration">{module.duration}</span>
                      </button>

                      {isExpanded ? (
                        <div className="module-lessons">
                          {module.lessons.map((lesson) => {
                            const completed = completedLessonIds.has(lesson.id);
                            return (
                              <div key={lesson.id} className={`lesson-item ${completed ? "completed" : ""}`}>
                                <div className="lesson-meta">
                                  <span className="lesson-type">{lesson.type}</span>
                                  <span>{lesson.title}</span>
                                  <small>
                                    <FaClock /> {lesson.duration}
                                  </small>
                                </div>
                                <button
                                  className={`lesson-action ${completed ? "done" : ""}`}
                                  onClick={() => handleLessonToggle(lesson.id)}
                                >
                                  {completed ? (
                                    <>
                                      <FaCheckCircle /> Completed
                                    </>
                                  ) : (
                                    <>
                                      <FaPlay /> Mark Completed
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="learn-card">
              <div className="learn-section-header">
                <h2>Assignments</h2>
              </div>

              {assignments.length ? (
                <div className="assignments-list-learn">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="assignment-item-learn">
                      <div>
                        <h4>{assignment.title}</h4>
                        <p>
                          Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "TBA"}
                        </p>
                      </div>
                      <div className="assignment-actions">
                        <span className={`status-pill ${assignment.submitted ? "submitted" : "pending"}`}>
                          {assignment.submitted ? "Submitted" : "Pending"}
                        </span>
                        <button
                          className="upload-btn"
                          onClick={() => handleAssignmentUpload(assignment)}
                          disabled={assignment.submitted}
                        >
                          <FaFileUpload />
                          {assignment.submitted ? "Uploaded" : "Upload Submission"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-copy">No assignments available for this course yet.</p>
              )}
            </section>

            <section className="learn-card">
              <div className="learn-section-header">
                <h2>🎥 Recommended Learning Videos</h2>
              </div>

              {videos.length ? (
                <div className="videos-grid">
                  {videos.map((video) => {
                    const watched = watchedVideoIds.has(video.id);
                    return (
                      <article key={video.id} className="video-card">
                        <img src={video.thumbnail} alt={video.title} className="video-thumb" />
                        <div className="video-content">
                          <h4>{video.title}</h4>
                          <p>{video.description}</p>
                          <span className="video-source">{video.source}</span>
                        </div>

                        <div className="video-embed-wrap">
                          <iframe
                            src={video.embedUrl}
                            title={video.title}
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>

                        <button
                          className={`watch-btn ${watched ? "watched" : ""}`}
                          onClick={() => handleMarkVideoWatched(video.id)}
                          disabled={watched}
                        >
                          <FaVideo /> {watched ? "Watched" : "Mark as Watched"}
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-copy">No recommended videos available.</p>
              )}
            </section>

            <div className="learn-actions-footer">
              <button className="back-btn" onClick={() => navigate(`/course/${courseId}`)}>
                Back to Course Details
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default CourseLearnPage;
