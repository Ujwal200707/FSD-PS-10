import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@components/layout/Layout";
import {
  FaBook,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaEye,
  FaPlay,
  FaPlus,
  FaSearch,
  FaStar,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import { getCurrentUser } from "@utils/auth";
import {
  createCourse,
  deleteCourse,
  enrollInCourseApi,
  getCourses,
  getEnrollments,
  saveCourse,
} from "@utils/courses";
import "./Courses.css";

const Courses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const userRole = currentUser?.role || "student";
  const isManager = userRole === "teacher" || userRole === "admin";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState("");
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    level: "Beginner",
    duration: "4 weeks",
    category: "",
    price: "Free",
    thumbnail: "📘",
  });

  const resetForm = () => {
    setCourseForm({
      title: "",
      description: "",
      level: "Beginner",
      duration: "4 weeks",
      category: "",
      price: "Free",
      thumbnail: "📘",
    });
    setEditingCourseId("");
  };

  const loadData = () => {
    const allCourses = getCourses();
    setCourses(allCourses);

    if (userRole === "student" && currentUser?.id) {
      const enrollments = getEnrollments({ studentId: currentUser.id });
      setEnrolledCourseIds(new Set(enrollments.map((e) => e.courseId)));
    }
  };

  useEffect(() => {
    if (location.state?.openCreateCourse && isManager) {
      resetForm();
      setShowCourseForm(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, isManager]);

  useEffect(() => {
    try {
      setLoading(true);
      setError("");
      loadData();
    } catch (err) {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [userRole, currentUser?.id]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        course.title?.toLowerCase().includes(search) ||
        course.description?.toLowerCase().includes(search) ||
        course.instructor?.toLowerCase().includes(search);

      const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [courses, searchTerm, selectedLevel]);

  const handleEnroll = (courseId) => {
    try {
      if (!currentUser?.id) {
        setError("Please log in to enroll");
        return;
      }

      const result = enrollInCourseApi(courseId, currentUser);
      if (!result.success) {
        setError(result.error || "Failed to enroll in course");
        return;
      }

      setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
      setMessage("Successfully enrolled in course!");
      navigate(`/courses/${courseId}/learn`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to enroll in course");
    }
  };

  const openCreate = () => {
    resetForm();
    setShowCourseForm(true);
  };

  const openEdit = (course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      level: course.level || "Beginner",
      duration: course.duration || "4 weeks",
      category: course.category || "",
      price: course.price || "Free",
      thumbnail: course.thumbnail || "📘",
    });
    setShowCourseForm(true);
  };

  const handleSaveCourse = () => {
    if (!courseForm.title.trim() || !courseForm.description.trim()) {
      setError("Title and description are required");
      return;
    }

    const payload = createCourse({
      ...(editingCourseId ? { id: editingCourseId } : {}),
      title: courseForm.title.trim(),
      description: courseForm.description.trim(),
      level: courseForm.level,
      duration: courseForm.duration,
      category: courseForm.category,
      price: courseForm.price,
      thumbnail: courseForm.thumbnail,
      instructor: currentUser?.name || "Instructor",
      instructorId: currentUser?.id || "",
      rating: editingCourseId
        ? courses.find((c) => c.id === editingCourseId)?.rating || 0
        : 0,
      studentsEnrolled: editingCourseId
        ? courses.find((c) => c.id === editingCourseId)?.studentsEnrolled || 0
        : 0,
    });

    const saved = saveCourse(payload);
    if (!saved) {
      setError("Failed to save course");
      return;
    }

    loadData();
    setShowCourseForm(false);
    resetForm();
    setMessage(editingCourseId ? "Course updated" : "Course created");
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDeleteCourse = (courseId) => {
    const ok = window.confirm("Delete this course?");
    if (!ok) return;

    const deleted = deleteCourse(courseId);
    if (!deleted) {
      setError("Failed to delete course");
      return;
    }

    loadData();
    setMessage("Course deleted");
    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="courses-page">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading courses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="courses-page">
        {error && (
          <div className="alert alert-danger">
            {error}
            <button className="close-btn" onClick={() => setError("")}>×</button>
          </div>
        )}
        {message && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        {/* Header */}
        <div className="courses-header">
          <div className="header-title">
            <h1>Courses</h1>
            <p>{filteredCourses.length} courses available</p>
          </div>
          {isManager && (
            <button className="btn btn-primary" onClick={openCreate}>
              <FaPlus /> Create Course
            </button>
          )}
        </div>

        {showCourseForm && (
          <div className="course-form-card">
            <h3>{editingCourseId ? "Edit Course" : "Create Course"}</h3>
            <div className="course-form-grid">
              <input
                className="search-input"
                placeholder="Course title"
                value={courseForm.title}
                onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
              />
              <select
                className="filter-select"
                value={courseForm.level}
                onChange={(e) => setCourseForm((p) => ({ ...p, level: e.target.value }))}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <input
                className="search-input"
                placeholder="Duration (e.g., 6 weeks)"
                value={courseForm.duration}
                onChange={(e) => setCourseForm((p) => ({ ...p, duration: e.target.value }))}
              />
              <input
                className="search-input"
                placeholder="Category"
                value={courseForm.category}
                onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))}
              />
              <input
                className="search-input"
                placeholder="Price"
                value={courseForm.price}
                onChange={(e) => setCourseForm((p) => ({ ...p, price: e.target.value }))}
              />
              <input
                className="search-input"
                placeholder="Thumbnail emoji"
                value={courseForm.thumbnail}
                onChange={(e) => setCourseForm((p) => ({ ...p, thumbnail: e.target.value }))}
              />
              <textarea
                className="search-input course-desc-input"
                placeholder="Course description"
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>
            <div className="course-form-actions">
              <button className="btn btn-primary" onClick={handleSaveCourse}>Save</button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowCourseForm(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="courses-filters">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search courses, instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <FaBook className="empty-icon" />
            <p>No courses found</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-thumbnail">
                  <div className="thumbnail-content">{course.thumbnail || "📚"}</div>
                  <span className="level-badge">{course.level}</span>
                </div>

                <div className="course-body">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-instructor">{course.instructor}</p>
                  <p className="course-description">{course.description?.substring(0, 80)}...</p>

                  <div className="course-meta">
                    <span className="meta-item">
                      <FaClock size={14} /> {course.duration || "8 weeks"}
                    </span>
                    <span className="meta-item">
                      <FaUsers size={14} /> {course.enrolledCount || 0}
                    </span>
                    <span className="meta-item">
                      <FaStar size={14} /> {course.rating || 4.5}★
                    </span>
                  </div>
                </div>

                <div className="course-footer">
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    <FaEye /> View
                  </button>

                  {userRole === "student" ? (
                    enrolledCourseIds.has(course.id) ? (
                      <button className="btn-enrolled" disabled>
                        <FaCheckCircle /> Enrolled
                      </button>
                    ) : (
                      <button
                        className="btn-enroll"
                        onClick={() => handleEnroll(course.id)}
                      >
                        <FaPlay /> Enroll
                      </button>
                    )
                  ) : isManager ? (
                    <div className="course-manager-actions">
                      <button className="btn-manage" onClick={() => openEdit(course)}>
                        <FaEdit /> Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteCourse(course.id)}>
                        <FaTrash /> Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Courses;