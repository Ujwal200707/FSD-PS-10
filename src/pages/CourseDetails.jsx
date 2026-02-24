import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@components/layout/Layout";
import { FaBook, FaClock, FaUsers, FaStar, FaPlay, FaDownload, FaChevronLeft, FaCheckCircle, FaLock, FaVideo, FaFileAlt, FaLink, FaEdit } from "react-icons/fa";
import { getCurrentUser } from "@utils/auth";
import {
  enrollInCourseApi,
  getAssignments,
  getCourseLearningContent,
  getCourseVideos,
  getStudentProgress,
  isStudentEnrolled,
} from "@utils/courses";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role || "student";

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [progress, setProgress] = useState(0);

  // Mock course content data
  const mockCourseContent = {
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
      enrolled: isStudentEnrolled(currentUser?.id, 1),
      progress: 35,
      modules: [
        {
          id: 1,
          title: "Introduction to React",
          duration: "2h 30m",
          completed: true,
          lessons: [
            { id: 1, title: "What is React?", type: "video", duration: "15m", completed: true },
            { id: 2, title: "Setting up Development Environment", type: "video", duration: "20m", completed: true },
            { id: 3, title: "Your First React Component", type: "video", duration: "25m", completed: true },
            { id: 4, title: "JSX Fundamentals", type: "article", duration: "10m", completed: true }
          ]
        },
        {
          id: 2,
          title: "Components and Props",
          duration: "3h 15m",
          completed: false,
          lessons: [
            { id: 5, title: "Creating Reusable Components", type: "video", duration: "30m", completed: false },
            { id: 6, title: "Understanding Props", type: "video", duration: "25m", completed: false },
            { id: 7, title: "Component Composition", type: "video", duration: "35m", completed: false },
            { id: 8, title: "Props Validation", type: "article", duration: "15m", completed: false }
          ]
        },
        {
          id: 3,
          title: "State Management",
          duration: "4h 45m",
          completed: false,
          lessons: [
            { id: 9, title: "Introduction to State", type: "video", duration: "20m", completed: false },
            { id: 10, title: "useState Hook", type: "video", duration: "40m", completed: false },
            { id: 11, title: "State Updates and Re-renders", type: "video", duration: "35m", completed: false },
            { id: 12, title: "State vs Props", type: "quiz", duration: "15m", completed: false }
          ]
        }
      ],
      assignments: [
        { id: 1, title: "Build a Todo App", dueDate: "2024-02-25", submitted: false },
        { id: 2, title: "Component Library", dueDate: "2024-03-05", submitted: false }
      ],
      resources: [
        { id: 1, title: "React Documentation", type: "link", url: "https://react.dev" },
        { id: 2, title: "Course Materials PDF", type: "download", url: "/materials/react-fundamentals.pdf" },
        { id: 3, title: "Code Examples", type: "download", url: "/examples/react-examples.zip" }
      ]
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
      enrolled: isStudentEnrolled(currentUser?.id, 2),
      progress: 0,
      modules: [
        {
          id: 1,
          title: "Advanced Functions",
          duration: "3h 20m",
          completed: false,
          lessons: [
            { id: 1, title: "Decorators Deep Dive", type: "video", duration: "45m", completed: false },
            { id: 2, title: "Generator Functions", type: "video", duration: "35m", completed: false }
          ]
        }
      ],
      assignments: [],
      resources: []
    }
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const learningCourse = getCourseLearningContent(courseId);

      const courseData = learningCourse
        ? {
            ...learningCourse,
            students: Number(learningCourse.studentsEnrolled || learningCourse.students || 0),
            enrolled: currentUser?.id
              ? isStudentEnrolled(String(currentUser.id), String(learningCourse.id))
              : false,
            progress: currentUser?.id
              ? getStudentProgress(String(currentUser.id), String(learningCourse.id))
              : 0,
            assignments: getAssignments({ courseId: String(learningCourse.id) }).map((assignment) => ({
              ...assignment,
              submitted: false,
            })),
            resources: getCourseVideos(String(learningCourse.id)).map((video) => ({
              id: video.id,
              title: video.title,
              type: "link",
              url: `https://www.youtube.com/watch?v=${video.youtubeId}`,
            })),
          }
        : mockCourseContent[courseId];

      if (courseData) {
        setCourse(courseData);
        setProgress(courseData.progress || 0);
      }
      setLoading(false);
    }, 1000);
  }, [courseId, currentUser?.id]);

  const handleEnroll = () => {
    if (!course) return;

    const result = enrollInCourseApi(course.id, currentUser);
    if (result.success) {

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
      successMessage.textContent = `✅ Successfully enrolled in "${course.title}"!`;
      document.body.appendChild(successMessage);
      setTimeout(() => document.body.removeChild(successMessage), 3000);

      // Update course state
      setCourse({...course, enrolled: true});
      navigate(`/courses/${course.id}/learn`);
    }
  };

  const handleLessonComplete = (lessonId) => {
    // Mock lesson completion
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
    successMessage.textContent = `✅ Lesson completed!`;
    document.body.appendChild(successMessage);
    setTimeout(() => document.body.removeChild(successMessage), 3000);
  };

  if (loading) {
    return (
      <Layout pageTitle="Course Details">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "20px", color: "#666" }}>Loading course details...</p>
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
    <Layout pageTitle={course.title}>
      <div style={{ padding: "20px 0" }}>
        {/* Course Header */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          padding: "40px 0",
          marginBottom: "30px"
        }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: "rgba(255,255,255,0.2)",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <FaChevronLeft />
              Back
            </button>

            <div style={{ display: "flex", gap: "30px", alignItems: "flex-start" }}>
              <div style={{
                width: "200px",
                height: "150px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4rem",
                flexShrink: 0
              }}>
                {course.thumbnail}
              </div>

              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "10px" }}>
                  {course.title}
                </h1>
                <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: "20px" }}>
                  {course.description}
                </p>

                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaUsers />
                    <span>{course.students.toLocaleString()} students</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaClock />
                    <span>{course.duration}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaStar />
                    <span>{course.rating} rating</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <span style={{
                    background: "#10b981",
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontWeight: "bold"
                  }}>
                    {course.level}
                  </span>
                  <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                    Instructor: {course.instructor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", gap: "30px" }}>
            {/* Main Content */}
            <div style={{ flex: 1 }}>
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: "30px" }}>
                {["overview", "curriculum", "assignments", "resources"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "15px 25px",
                      border: "none",
                      background: activeTab === tab ? "#667eea" : "transparent",
                      color: activeTab === tab ? "#fff" : "#6b7280",
                      fontWeight: "600",
                      cursor: "pointer",
                      borderRadius: "8px 8px 0 0",
                      textTransform: "capitalize"
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "20px" }}>
                    Course Overview
                  </h2>
                  <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#374151", marginBottom: "30px" }}>
                    {course.description}
                  </p>

                  {course.enrolled && (
                    <div style={{ marginBottom: "30px" }}>
                      <h3 style={{ fontSize: "1.4rem", fontWeight: "bold", marginBottom: "15px" }}>
                        Your Progress
                      </h3>
                      <div style={{
                        width: "100%",
                        height: "20px",
                        background: "#e5e7eb",
                        borderRadius: "10px",
                        overflow: "hidden"
                      }}>
                        <div style={{
                          width: `${progress}%`,
                          height: "100%",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          transition: "width 0.3s ease"
                        }}></div>
                      </div>
                      <p style={{ marginTop: "10px", color: "#6b7280" }}>
                        {progress}% complete
                      </p>
                    </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    <div style={{
                      padding: "20px",
                      background: "#f8f9fa",
                      borderRadius: "12px",
                      textAlign: "center"
                    }}>
                      <FaBook style={{ fontSize: "2rem", color: "#667eea", marginBottom: "10px" }} />
                      <h4 style={{ fontWeight: "bold", marginBottom: "5px" }}>Modules</h4>
                      <p style={{ color: "#6b7280" }}>{course.modules?.length || 0} modules</p>
                    </div>
                    <div style={{
                      padding: "20px",
                      background: "#f8f9fa",
                      borderRadius: "12px",
                      textAlign: "center"
                    }}>
                      <FaClock style={{ fontSize: "2rem", color: "#10b981", marginBottom: "10px" }} />
                      <h4 style={{ fontWeight: "bold", marginBottom: "5px" }}>Duration</h4>
                      <p style={{ color: "#6b7280" }}>{course.duration}</p>
                    </div>
                    <div style={{
                      padding: "20px",
                      background: "#f8f9fa",
                      borderRadius: "12px",
                      textAlign: "center"
                    }}>
                      <FaFileAlt style={{ fontSize: "2rem", color: "#f59e0b", marginBottom: "10px" }} />
                      <h4 style={{ fontWeight: "bold", marginBottom: "5px" }}>Assignments</h4>
                      <p style={{ color: "#6b7280" }}>{course.assignments?.length || 0} assignments</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "curriculum" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "20px" }}>
                    Course Curriculum
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {course.modules?.map(module => (
                      <div key={module.id} style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "20px",
                        background: "#fff"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                          <h3 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{module.title}</h3>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>{module.duration}</span>
                            {module.completed && <FaCheckCircle style={{ color: "#10b981" }} />}
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {module.lessons?.map(lesson => (
                            <div key={lesson.id} style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px",
                              background: lesson.completed ? "#f0fdf4" : "#f8f9fa",
                              borderRadius: "8px",
                              border: lesson.completed ? "1px solid #10b981" : "1px solid #e5e7eb"
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {lesson.type === "video" && <FaVideo style={{ color: "#ef4444" }} />}
                                {lesson.type === "article" && <FaFileAlt style={{ color: "#3b82f6" }} />}
                                {lesson.type === "quiz" && <FaCheckCircle style={{ color: "#f59e0b" }} />}
                                <span style={{
                                  fontWeight: lesson.completed ? "bold" : "normal",
                                  color: lesson.completed ? "#10b981" : "#374151"
                                }}>
                                  {lesson.title}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>{lesson.duration}</span>
                                {course.enrolled ? (
                                  lesson.completed ? (
                                    <FaCheckCircle style={{ color: "#10b981" }} />
                                  ) : (
                                    <button
                                      onClick={() => handleLessonComplete(lesson.id)}
                                      style={{
                                        padding: "6px 12px",
                                        background: "#667eea",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "0.8rem"
                                      }}
                                    >
                                      <FaPlay style={{ marginRight: "4px" }} />
                                      Start
                                    </button>
                                  )
                                ) : (
                                  <FaLock style={{ color: "#9ca3af" }} />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "assignments" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "20px" }}>
                    Course Assignments
                  </h2>
                  {course.assignments?.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {course.assignments.map(assignment => (
                        <div key={assignment.id} style={{
                          padding: "20px",
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div>
                            <h4 style={{ fontWeight: "bold", marginBottom: "5px" }}>{assignment.title}</h4>
                            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                              Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {assignment.submitted ? (
                              <span style={{
                                padding: "6px 12px",
                                background: "#10b981",
                                color: "#fff",
                                borderRadius: "20px",
                                fontSize: "0.8rem",
                                fontWeight: "bold"
                              }}>
                                Submitted
                              </span>
                            ) : (
                              <button
                                onClick={() => navigate(`/assignments`)}
                                style={{
                                  padding: "8px 16px",
                                  background: "#667eea",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontWeight: "bold"
                                }}
                              >
                                Submit Assignment
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>
                      No assignments available for this course yet.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "resources" && (
                <div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "20px" }}>
                    Course Resources
                  </h2>
                  {course.resources?.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
                      {course.resources.map(resource => (
                        <div key={resource.id} style={{
                          padding: "20px",
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "15px"
                        }}>
                          {resource.type === "link" && <FaLink style={{ color: "#3b82f6", fontSize: "1.5rem" }} />}
                          {resource.type === "download" && <FaDownload style={{ color: "#10b981", fontSize: "1.5rem" }} />}
                          <div style={{ flex: 1 }}>
                            <h4 style={{ fontWeight: "bold", marginBottom: "5px" }}>{resource.title}</h4>
                            <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>{resource.type}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (resource.type === "link") {
                                window.open(resource.url, "_blank");
                              } else {
                                // Mock download
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
                                successMessage.textContent = `✅ Download started for "${resource.title}"`;
                                document.body.appendChild(successMessage);
                                setTimeout(() => document.body.removeChild(successMessage), 3000);
                              }
                            }}
                            style={{
                              padding: "8px 16px",
                              background: "#667eea",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "bold"
                            }}
                          >
                            {resource.type === "link" ? "Open" : "Download"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>
                      No resources available for this course yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div style={{ width: "300px", flexShrink: 0 }}>
              <div style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                position: "sticky",
                top: "20px"
              }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "20px" }}>
                  Course Actions
                </h3>

                {userRole === 'student' && (
                  <>
                    {!course.enrolled ? (
                      <button
                        onClick={handleEnroll}
                        style={{
                          width: "100%",
                          padding: "15px",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          marginBottom: "15px"
                        }}
                      >
                        <FaBook style={{ marginRight: "8px" }} />
                        Enroll Now - {course.price}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/courses/${course.id}/learn`)}
                        style={{
                          width: "100%",
                          padding: "15px",
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          marginBottom: "15px"
                        }}
                      >
                        <FaPlay style={{ marginRight: "8px" }} />
                        Continue Learning
                      </button>
                    )}
                  </>
                )}

                {(userRole === 'admin' || userRole === 'teacher' || userRole === 'content') && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button
                      onClick={() => navigate(`/courses/${course.id}/edit`)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#f59e0b",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <FaEdit />
                      Edit Course
                    </button>

                    <button
                      onClick={() => navigate(`/students`)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#3b82f6",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <FaUsers />
                      View Students
                    </button>
                  </div>
                )}

                <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #e5e7eb" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "10px" }}>
                    Course Info
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.9rem", color: "#6b7280" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Level:</span>
                      <span style={{ fontWeight: "bold", color: "#374151" }}>{course.level}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Duration:</span>
                      <span style={{ fontWeight: "bold", color: "#374151" }}>{course.duration}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Students:</span>
                      <span style={{ fontWeight: "bold", color: "#374151" }}>{course.students.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Rating:</span>
                      <span style={{ fontWeight: "bold", color: "#374151" }}>{course.rating}/5.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetails;