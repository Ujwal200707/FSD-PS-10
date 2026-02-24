import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@components/layout/Layout";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronUp,
  FaCheckCircle,
  FaClock,
  FaBook,
  FaLink,
  FaPlus,
  FaSave,
  FaStar,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import { getCurrentUser } from "@utils/auth";
import {
  createCourseVideoApi,
  deleteCourseVideoApi,
  extractYoutubeVideoId,
  getAssignments,
  getCourseById,
  getCourseVideosApi,
  getYoutubeThumbnailFromUrl,
  saveCourse,
  updateCourseVideoApi,
} from "@utils/courses";

const CourseEdit = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role || "student";
  const canManageVideos = ["admin", "teacher", "content"].includes(userRole);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructor: "",
    category: "",
    duration: "",
    level: "",
    price: "",
    thumbnail: "",
    status: "Active"
  });
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [videoList, setVideoList] = useState([]);
  const [videoDrafts, setVideoDrafts] = useState({});
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState("");
  const [editingVideoId, setEditingVideoId] = useState("");
  const [videosCollapsed, setVideosCollapsed] = useState(false);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [addVideoForm, setAddVideoForm] = useState({
    title: "",
    youtubeUrl: "",
    description: "",
  });
  const [addVideoErrors, setAddVideoErrors] = useState({});
  const [videoActionLoadingId, setVideoActionLoadingId] = useState("");
  const [confirmDeleteVideo, setConfirmDeleteVideo] = useState(null);

  const getStudentCount = (courseData) => {
    const count = Number(
      courseData?.students ?? courseData?.studentsEnrolled ?? courseData?.enrolledCount ?? 0
    );
    return Number.isFinite(count) ? count : 0;
  };

  // Mock course data
  const mockCourses = {
    1: {
      id: 1,
      title: "React Fundamentals",
      instructor: "Dr. Sarah Johnson",
      category: "Web Development",
      duration: "8 weeks",
      students: 1250,
      rating: 4.8,
      price: "Free",
      level: "Beginner",
      description: "Learn the basics of React.js and build modern web applications.",
      thumbnail: "🎨",
      status: "Active"
    },
    2: {
      id: 2,
      title: "Advanced Python Programming",
      instructor: "Prof. Michael Chen",
      category: "Programming",
      duration: "12 weeks",
      students: 890,
      rating: 4.9,
      price: "Free",
      level: "Advanced",
      description: "Master advanced Python concepts including decorators, generators, and async programming.",
      thumbnail: "🐍",
      status: "Active"
    }
  };

  const categories = ["Web Development", "Programming", "Design", "Data Science", "Business"];
  const levels = ["Beginner", "Intermediate", "Advanced"];
  const statuses = ["Active", "Draft", "Archived"];

  const showToast = (text, type = "success") => {
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#10b981" : "#ef4444"};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1100;
      font-weight: 500;
    `;
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 2500);
  };

  const buildVideoDrafts = (videos) => {
    const nextDrafts = {};
    videos.forEach((video) => {
      nextDrafts[video.id] = {
        title: video.title || "",
        youtubeUrl: `https://www.youtube.com/watch?v=${video.youtubeId || ""}`,
        description: video.description || "",
      };
    });
    return nextDrafts;
  };

  const validateVideoForm = (form) => {
    const errors = {};
    if (!String(form.title || "").trim()) {
      errors.title = "Title is required";
    }
    if (!String(form.youtubeUrl || "").trim()) {
      errors.youtubeUrl = "YouTube URL is required";
    } else if (!extractYoutubeVideoId(form.youtubeUrl)) {
      errors.youtubeUrl = "Enter a valid YouTube URL";
    }
    return errors;
  };

  const getPreviewVideo = (videoId) => {
    const draft = videoDrafts[videoId];
    if (!draft) return "";
    return getYoutubeThumbnailFromUrl(draft.youtubeUrl);
  };

  useEffect(() => {
    // Check permissions
    if (!["admin", "content", "teacher"].includes(userRole)) {
      navigate('/courses');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      const courseData = getCourseById(courseId) || mockCourses[courseId];
      if (courseData) {
        const normalizedCourseData = {
          ...courseData,
          students: getStudentCount(courseData),
          studentsEnrolled: getStudentCount(courseData),
          rating: Number(courseData.rating) || 0,
        };

        setCourse(normalizedCourseData);
        setFormData({
          title: normalizedCourseData.title,
          description: normalizedCourseData.description,
          instructor: normalizedCourseData.instructor,
          category: normalizedCourseData.category,
          duration: normalizedCourseData.duration,
          level: normalizedCourseData.level,
          price: normalizedCourseData.price,
          thumbnail: normalizedCourseData.thumbnail,
          status: normalizedCourseData.status
        });

        const normalizedModules = Array.isArray(normalizedCourseData.modules)
          ? normalizedCourseData.modules.map((module, index) => ({
              id: module.id || index + 1,
              title: module.title || `Module ${index + 1}`,
              duration: module.duration || "",
              lessons: Array.isArray(module.lessons)
                ? module.lessons.length
                : Number(module.lessons) || 0,
            }))
          : [];
        setModules(normalizedModules);

        const courseAssignments = getAssignments({ courseId: String(normalizedCourseData.id) });
        setAssignments(courseAssignments);

        if (["admin", "teacher", "content"].includes(userRole)) {
          setVideosLoading(true);
          const videosResult = getCourseVideosApi(courseId);
          if (videosResult.success) {
            setVideoList(videosResult.data || []);
            setVideoDrafts(buildVideoDrafts(videosResult.data || []));
            setVideosError("");
          } else {
            setVideosError("Failed to load recommended videos");
          }
          setVideosLoading(false);
        }
      }
      setLoading(false);
    }, 1000);
  }, [courseId, userRole, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      const saved = saveCourse({
        ...course,
        id: String(course.id),
        title: formData.title.trim(),
        description: formData.description.trim(),
        instructor: formData.instructor,
        category: formData.category,
        duration: formData.duration,
        level: formData.level,
        price: formData.price,
        thumbnail: formData.thumbnail,
        status: formData.status,
        modules: modules.map((module) => ({
          id: module.id,
          title: module.title,
          duration: module.duration,
          lessons: Number(module.lessons) || 0,
        })),
      });

      if (!saved) {
        setSaving(false);
        showToast("Failed to update course", "error");
        return;
      }

      setSaving(false);

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-weight: 500;
      `;
      successMessage.textContent = `✅ Course "${formData.title}" updated successfully!`;
      document.body.appendChild(successMessage);
      setTimeout(() => document.body.removeChild(successMessage), 3000);

      // Navigate back
      setTimeout(() => navigate(-1), 1000);
    }, 1500);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      // Simulate API call
      setTimeout(() => {
        const successMessage = document.createElement('div');
        successMessage.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ef4444;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          font-weight: 500;
        `;
        successMessage.textContent = `🗑️ Course deleted successfully!`;
        document.body.appendChild(successMessage);
        setTimeout(() => document.body.removeChild(successMessage), 3000);

        setTimeout(() => navigate('/courses'), 1000);
      }, 1000);
    }
  };

  const addModule = () => {
    const newModule = {
      id: modules.length + 1,
      title: "",
      duration: "",
      lessons: 0
    };
    setModules([...modules, newModule]);
  };

  const updateModule = (id, field, value) => {
    setModules(modules.map(module =>
      module.id === id ? { ...module, [field]: value } : module
    ));
  };

  const removeModule = (id) => {
    setModules(modules.filter(module => module.id !== id));
  };

  const handleVideoDraftChange = (videoId, field, value) => {
    setVideoDrafts((prev) => ({
      ...prev,
      [videoId]: {
        ...(prev[videoId] || {}),
        [field]: value,
      },
    }));
  };

  const handleAddVideo = () => {
    const errors = validateVideoForm(addVideoForm);
    setAddVideoErrors(errors);
    if (Object.keys(errors).length) {
      return;
    }

    const tempId = `tmp_${Date.now()}`;
    const optimisticVideo = {
      id: tempId,
      title: addVideoForm.title.trim(),
      description: addVideoForm.description.trim(),
      source: "Custom",
      youtubeId: extractYoutubeVideoId(addVideoForm.youtubeUrl),
      thumbnail: getYoutubeThumbnailFromUrl(addVideoForm.youtubeUrl),
    };

    const previousVideos = videoList;
    setVideoList((prev) => [...prev, optimisticVideo]);
    setVideoActionLoadingId(tempId);

    const result = createCourseVideoApi({
      courseId,
      actorRole: userRole,
      payload: {
        title: addVideoForm.title,
        youtubeUrl: addVideoForm.youtubeUrl,
        description: addVideoForm.description,
      },
    });

    if (!result.success) {
      setVideoList(previousVideos);
      setVideoActionLoadingId("");
      showToast(result.error || "Failed to add video", "error");
      return;
    }

    const updatedList = result.videos || [];
    setVideoList(updatedList);
    setVideoDrafts(buildVideoDrafts(updatedList));
    setVideoActionLoadingId("");
    setShowAddVideoForm(false);
    setAddVideoForm({ title: "", youtubeUrl: "", description: "" });
    setAddVideoErrors({});
    showToast("Video added successfully");
  };

  const handleSaveVideoEdit = (videoId) => {
    const draft = videoDrafts[videoId] || {};
    const errors = validateVideoForm(draft);
    if (Object.keys(errors).length) {
      setVideosError(errors.title || errors.youtubeUrl || "Invalid video data");
      return;
    }

    setVideosError("");
    const previousVideos = videoList;
    const optimisticVideos = videoList.map((video) =>
      video.id === videoId
        ? {
            ...video,
            title: draft.title.trim(),
            description: draft.description.trim(),
            youtubeId: extractYoutubeVideoId(draft.youtubeUrl),
            thumbnail: getYoutubeThumbnailFromUrl(draft.youtubeUrl),
          }
        : video
    );

    setVideoList(optimisticVideos);
    setVideoActionLoadingId(videoId);

    const result = updateCourseVideoApi({
      courseId,
      videoId,
      actorRole: userRole,
      payload: {
        title: draft.title,
        youtubeUrl: draft.youtubeUrl,
        description: draft.description,
      },
    });

    if (!result.success) {
      setVideoList(previousVideos);
      setVideoActionLoadingId("");
      showToast(result.error || "Failed to update video", "error");
      return;
    }

    setVideoList(result.videos || []);
    setVideoDrafts(buildVideoDrafts(result.videos || []));
    setEditingVideoId("");
    setVideoActionLoadingId("");
    showToast("Video updated successfully");
  };

  const handleDeleteVideo = (videoId) => {
    const previousVideos = videoList;
    setVideoList((prev) => prev.filter((video) => String(video.id) !== String(videoId)));
    setConfirmDeleteVideo(null);
    setVideoActionLoadingId(videoId);

    const result = deleteCourseVideoApi({
      courseId,
      videoId,
      actorRole: userRole,
    });

    if (!result.success) {
      setVideoList(previousVideos);
      setVideoActionLoadingId("");
      showToast(result.error || "Failed to delete video", "error");
      return;
    }

    setVideoList(result.videos || []);
    setVideoDrafts(buildVideoDrafts(result.videos || []));
    setVideoActionLoadingId("");
    showToast("Video removed");
  };

  if (loading) {
    return (
      <Layout pageTitle="Edit Course">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "20px", color: "#666" }}>Loading course...</p>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout pageTitle="Course Not Found">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <FaBook style={{ fontSize: "3rem", color: "#ccc", marginBottom: "20px" }} />
          <h3 style={{ color: "#666", marginBottom: "10px" }}>Course Not Found</h3>
          <p style={{ color: "#999" }}>The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#667eea",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Go Back
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout pageTitle={`Edit ${course.title}`}>
      <div style={{ padding: "20px 0" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 20px" }}>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: "#f3f4f6",
                  color: "#6b7280",
                  border: "none",
                  padding: "10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <FaChevronLeft />
              </button>
              <div>
                <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0 0 5px 0" }}>
                  Edit Course
                </h1>
                <p style={{ color: "#6b7280", margin: 0 }}>
                  Make changes to course information and content
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 20px",
                  background: saving ? "#9ca3af" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FaSave />
                {saving ? "Saving..." : "Save Changes"}
              </button>

              {userRole === 'admin' && (
                <button
                  onClick={handleDelete}
                  style={{
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <FaTrash />
                  Delete Course
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>
            {/* Main Form */}
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "30px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "25px" }}>
                Course Information
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                    Instructor *
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                    placeholder="Enter instructor name"
                  />
                </div>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    minHeight: "100px",
                    resize: "vertical"
                  }}
                  placeholder="Enter course description"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                  >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                    placeholder="e.g., 8 weeks"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                    Price
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                    placeholder="e.g., Free or $99"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                    Thumbnail
                  </label>
                  <input
                    type="text"
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                    placeholder="e.g., 🎨 or 📊"
                  />
                </div>
              </div>

              {/* Course Modules */}
              <div style={{ marginTop: "40px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Course Modules</h3>
                  <button
                    onClick={addModule}
                    style={{
                      padding: "8px 16px",
                      background: "#667eea",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.9rem"
                    }}
                  >
                    <FaPlus />
                    Add Module
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {modules.map(module => (
                    <div key={module.id} style={{
                      padding: "20px",
                      background: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr auto", gap: "15px", alignItems: "center" }}>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                          placeholder="Module title"
                          style={{
                            padding: "10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "1rem"
                          }}
                        />
                        <input
                          type="text"
                          value={module.duration}
                          onChange={(e) => updateModule(module.id, 'duration', e.target.value)}
                          placeholder="Duration"
                          style={{
                            padding: "10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "1rem"
                          }}
                        />
                        <input
                          type="number"
                          value={module.lessons}
                          onChange={(e) => updateModule(module.id, 'lessons', parseInt(e.target.value) || 0)}
                          placeholder="Lessons"
                          style={{
                            padding: "10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "1rem"
                          }}
                        />
                        <button
                          onClick={() => removeModule(module.id)}
                          style={{
                            padding: "10px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer"
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {canManageVideos && (
                <div style={{ marginTop: "40px" }}>
                  <div
                    onClick={() => setVideosCollapsed((prev) => !prev)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      padding: "14px 16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      cursor: "pointer",
                    }}
                  >
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: 0 }}>
                      🎥 Recommended Learning Videos
                    </h3>
                    {videosCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                  </div>

                  <div
                    style={{
                      maxHeight: videosCollapsed ? "0" : "2200px",
                      opacity: videosCollapsed ? 0 : 1,
                      overflow: "hidden",
                      transition: "all 0.35s ease",
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "16px",
                        background: "#fff",
                      }}
                    >
                      {videosError && (
                        <div
                          style={{
                            background: "#fee2e2",
                            color: "#991b1b",
                            border: "1px solid #fecaca",
                            borderRadius: "8px",
                            padding: "10px 12px",
                            marginBottom: "12px",
                          }}
                        >
                          {videosError}
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                        <div style={{ color: "#6b7280", fontSize: "0.92rem" }}>
                          Add and manage curated YouTube resources for this course.
                        </div>
                        <button
                          onClick={() => setShowAddVideoForm((prev) => !prev)}
                          style={{
                            padding: "8px 12px",
                            background: "#2563eb",
                            color: "#fff",
                            borderRadius: "8px",
                            border: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <FaPlus /> + Add Video
                        </button>
                      </div>

                      {showAddVideoForm && (
                        <div
                          style={{
                            border: "1px solid #dbeafe",
                            background: "#eff6ff",
                            borderRadius: "10px",
                            padding: "14px",
                            marginBottom: "16px",
                          }}
                        >
                          <div style={{ display: "grid", gap: "10px" }}>
                            <input
                              type="text"
                              placeholder="Video Title"
                              value={addVideoForm.title}
                              onChange={(e) =>
                                setAddVideoForm((prev) => ({ ...prev, title: e.target.value }))
                              }
                              style={{
                                width: "100%",
                                padding: "10px",
                                border: `1px solid ${addVideoErrors.title ? "#ef4444" : "#cbd5e1"}`,
                                borderRadius: "8px",
                              }}
                            />
                            {addVideoErrors.title && (
                              <span style={{ color: "#b91c1c", fontSize: "0.82rem" }}>{addVideoErrors.title}</span>
                            )}

                            <input
                              type="text"
                              placeholder="YouTube URL"
                              value={addVideoForm.youtubeUrl}
                              onChange={(e) =>
                                setAddVideoForm((prev) => ({ ...prev, youtubeUrl: e.target.value }))
                              }
                              style={{
                                width: "100%",
                                padding: "10px",
                                border: `1px solid ${addVideoErrors.youtubeUrl ? "#ef4444" : "#cbd5e1"}`,
                                borderRadius: "8px",
                              }}
                            />
                            {addVideoErrors.youtubeUrl && (
                              <span style={{ color: "#b91c1c", fontSize: "0.82rem" }}>
                                {addVideoErrors.youtubeUrl}
                              </span>
                            )}

                            <textarea
                              placeholder="Description"
                              value={addVideoForm.description}
                              onChange={(e) =>
                                setAddVideoForm((prev) => ({ ...prev, description: e.target.value }))
                              }
                              style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                minHeight: "88px",
                                resize: "vertical",
                              }}
                            />

                            {getYoutubeThumbnailFromUrl(addVideoForm.youtubeUrl) ? (
                              <img
                                src={getYoutubeThumbnailFromUrl(addVideoForm.youtubeUrl)}
                                alt="Video thumbnail preview"
                                style={{
                                  width: "210px",
                                  height: "118px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  border: "1px solid #cbd5e1",
                                }}
                              />
                            ) : null}

                            <div style={{ display: "flex", gap: "10px" }}>
                              <button
                                onClick={handleAddVideo}
                                style={{
                                  padding: "9px 12px",
                                  background: "#16a34a",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontWeight: 600,
                                }}
                              >
                                Save Video
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddVideoForm(false);
                                  setAddVideoErrors({});
                                }}
                                style={{
                                  padding: "9px 12px",
                                  background: "#e5e7eb",
                                  color: "#111827",
                                  border: "none",
                                  borderRadius: "8px",
                                  fontWeight: 600,
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {videosLoading ? (
                        <div style={{ color: "#6b7280" }}>Loading videos...</div>
                      ) : videoList.length === 0 ? (
                        <div
                          style={{
                            padding: "18px",
                            border: "1px dashed #cbd5e1",
                            borderRadius: "10px",
                            color: "#6b7280",
                            textAlign: "center",
                          }}
                        >
                          No videos added yet.
                        </div>
                      ) : (
                        <div style={{ display: "grid", gap: "12px" }}>
                          {videoList.map((video) => {
                            const isEditing = editingVideoId === String(video.id);
                            const draft = videoDrafts[video.id] || {
                              title: video.title,
                              youtubeUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
                              description: video.description,
                            };

                            return (
                              <div
                                key={video.id}
                                style={{
                                  border: "1px solid #e5e7eb",
                                  borderRadius: "10px",
                                  padding: "12px",
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "12px",
                                  alignItems: "start",
                                }}
                              >
                                <img
                                  src={getPreviewVideo(video.id) || video.thumbnail}
                                  alt={video.title}
                                  style={{
                                    width: "100%",
                                    height: "102px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                    border: "1px solid #d1d5db",
                                    maxWidth: "180px",
                                    flex: "0 0 180px",
                                  }}
                                />

                                <div style={{ display: "grid", gap: "8px", flex: "1 1 320px" }}>
                                  <input
                                    type="text"
                                    value={draft.title || ""}
                                    disabled={!isEditing}
                                    onChange={(e) =>
                                      handleVideoDraftChange(video.id, "title", e.target.value)
                                    }
                                    style={{
                                      width: "100%",
                                      padding: "9px",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "8px",
                                      background: isEditing ? "#fff" : "#f8fafc",
                                    }}
                                  />
                                  <input
                                    type="text"
                                    value={draft.youtubeUrl || ""}
                                    disabled={!isEditing}
                                    onChange={(e) =>
                                      handleVideoDraftChange(video.id, "youtubeUrl", e.target.value)
                                    }
                                    style={{
                                      width: "100%",
                                      padding: "9px",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "8px",
                                      background: isEditing ? "#fff" : "#f8fafc",
                                    }}
                                  />
                                  <textarea
                                    value={draft.description || ""}
                                    disabled={!isEditing}
                                    onChange={(e) =>
                                      handleVideoDraftChange(video.id, "description", e.target.value)
                                    }
                                    style={{
                                      width: "100%",
                                      padding: "9px",
                                      border: "1px solid #cbd5e1",
                                      borderRadius: "8px",
                                      minHeight: "78px",
                                      resize: "vertical",
                                      background: isEditing ? "#fff" : "#f8fafc",
                                    }}
                                  />
                                  <a
                                    href={`https://youtube.com/watch?v=${video.youtubeId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      color: "#2563eb",
                                      fontSize: "0.86rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    <FaLink /> Open on YouTube
                                  </a>
                                </div>

                                <div style={{ display: "grid", gap: "8px", minWidth: "110px", flex: "0 0 110px" }}>
                                  {isEditing ? (
                                    <>
                                      <button
                                        onClick={() => handleSaveVideoEdit(video.id)}
                                        disabled={videoActionLoadingId === String(video.id)}
                                        style={{
                                          padding: "8px 10px",
                                          background: "#16a34a",
                                          color: "#fff",
                                          border: "none",
                                          borderRadius: "8px",
                                          fontWeight: 600,
                                        }}
                                      >
                                        <FaCheckCircle /> Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingVideoId("");
                                          setVideoDrafts((prev) => ({
                                            ...prev,
                                            [video.id]: {
                                              title: video.title,
                                              youtubeUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
                                              description: video.description,
                                            },
                                          }));
                                        }}
                                        style={{
                                          padding: "8px 10px",
                                          background: "#e5e7eb",
                                          color: "#111827",
                                          border: "none",
                                          borderRadius: "8px",
                                          fontWeight: 600,
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => setEditingVideoId(String(video.id))}
                                      style={{
                                        padding: "8px 10px",
                                        background: "#2563eb",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Edit
                                    </button>
                                  )}

                                  <button
                                    onClick={() => setConfirmDeleteVideo(video)}
                                    disabled={videoActionLoadingId === String(video.id)}
                                    style={{
                                      padding: "8px 10px",
                                      background: "#ef4444",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "8px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    <FaTrash /> Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              {/* Course Preview */}
              <div style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                marginBottom: "20px"
              }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "15px" }}>
                  Course Preview
                </h3>

                <div style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "8px",
                  padding: "20px",
                  color: "#fff",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "10px" }}>
                    {formData.thumbnail || "📚"}
                  </div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "5px" }}>
                    {formData.title || "Course Title"}
                  </h4>
                  <p style={{ fontSize: "0.9rem", opacity: 0.9 }}>
                    {formData.instructor || "Instructor Name"}
                  </p>
                </div>

                <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280" }}>Category:</span>
                    <span style={{ fontWeight: "bold" }}>{formData.category || "Not set"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280" }}>Level:</span>
                    <span style={{ fontWeight: "bold" }}>{formData.level || "Not set"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280" }}>Duration:</span>
                    <span style={{ fontWeight: "bold" }}>{formData.duration || "Not set"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#6b7280" }}>Price:</span>
                    <span style={{ fontWeight: "bold" }}>{formData.price || "Not set"}</span>
                  </div>
                </div>
              </div>

              {/* Course Stats */}
              <div style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
              }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "15px" }}>
                  Course Statistics
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      background: "#e0f2fe",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <FaUsers style={{ color: "#0284c7" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                        {getStudentCount(course).toLocaleString()}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>Students</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      background: "#fef3c7",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <FaStar style={{ color: "#d97706" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                        {course.rating}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>Rating</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      background: "#ecfdf5",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <FaClock style={{ color: "#059669" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                        {modules.length}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>Modules</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      background: "#fef2f2",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <FaBook style={{ color: "#dc2626" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                        {assignments.length}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>Assignments</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {confirmDeleteVideo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: "1.2rem" }}>Delete video?</h3>
            <p style={{ margin: "0 0 16px", color: "#6b7280" }}>
              Are you sure you want to remove “{confirmDeleteVideo.title}”? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setConfirmDeleteVideo(null)}
                style={{
                  padding: "9px 12px",
                  background: "#e5e7eb",
                  color: "#111827",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVideo(confirmDeleteVideo.id)}
                style={{
                  padding: "9px 12px",
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CourseEdit;