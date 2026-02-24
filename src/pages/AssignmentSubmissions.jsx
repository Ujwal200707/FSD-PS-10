import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@components/layout/Layout";
import { FaChevronLeft, FaEye, FaDownload, FaStar, FaComment, FaSave, FaUser, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import { getCurrentUser } from "@utils/auth";

const AssignmentSubmissions = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role || "student";

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  // Mock data
  const mockAssignments = [
    {
      id: 1,
      title: "React Components Assignment",
      description: "Create reusable React components with proper props and state management",
      course: "React Fundamentals",
      dueDate: "2024-02-25",
      status: "Active",
      submissions: 15,
      totalStudents: 20
    },
    {
      id: 2,
      title: "Python Data Structures Quiz",
      description: "Complete quiz on lists, dictionaries, and tuples",
      course: "Advanced Python Programming",
      dueDate: "2024-02-22",
      status: "Active",
      submissions: 8,
      totalStudents: 15
    }
  ];

  const mockSubmissions = [
    {
      id: 1,
      assignmentId: 1,
      studentName: "Alice Johnson",
      studentEmail: "alice@email.com",
      submittedAt: "2024-02-20",
      status: "submitted",
      grade: null,
      feedback: "",
      fileUrl: "assignment1_alice.pdf",
      content: "I have created reusable React components with proper props validation and state management. The components include a Button, Input, and Card component that can be used throughout the application.",
      attachments: [
        { name: "components.js", size: "2.3 MB", url: "/submissions/components.js" },
        { name: "styles.css", size: "156 KB", url: "/submissions/styles.css" },
        { name: "demo.html", size: "45 KB", url: "/submissions/demo.html" }
      ]
    },
    {
      id: 2,
      assignmentId: 1,
      studentName: "Bob Smith",
      studentEmail: "bob@email.com",
      submittedAt: "2024-02-19",
      status: "graded",
      grade: "A",
      feedback: "Excellent work on the React components! Your code is well-structured and follows best practices. The props validation is particularly impressive.",
      fileUrl: "assignment1_bob.pdf",
      content: "Created a comprehensive component library with TypeScript support and proper error handling.",
      attachments: [
        { name: "ComponentLibrary.tsx", size: "3.1 MB", url: "/submissions/ComponentLibrary.tsx" },
        { name: "README.md", size: "12 KB", url: "/submissions/README.md" }
      ]
    },
    {
      id: 3,
      assignmentId: 1,
      studentName: "Carol Davis",
      studentEmail: "carol@email.com",
      submittedAt: "2024-02-18",
      status: "graded",
      grade: "B+",
      feedback: "Good work overall. The components are functional but could benefit from better error handling and more comprehensive documentation.",
      fileUrl: "assignment1_carol.pdf",
      content: "Built basic React components with props and state. Included examples of usage.",
      attachments: [
        { name: "my-components.js", size: "1.8 MB", url: "/submissions/my-components.js" }
      ]
    },
    {
      id: 4,
      assignmentId: 2,
      studentName: "David Wilson",
      studentEmail: "david@email.com",
      submittedAt: "2024-02-21",
      status: "submitted",
      grade: null,
      feedback: "",
      fileUrl: "assignment2_david.pdf",
      content: "Completed the Python data structures quiz. Scored 95% on the assessment covering lists, dictionaries, tuples, and sets.",
      attachments: [
        { name: "quiz_results.pdf", size: "245 KB", url: "/submissions/quiz_results.pdf" },
        { name: "code_examples.py", size: "89 KB", url: "/submissions/code_examples.py" }
      ]
    }
  ];

  useEffect(() => {
    // Check if user has permission
    if (!['admin', 'teacher'].includes(userRole)) {
      navigate('/unauthorized');
      return;
    }

    // Simulate API calls
    setTimeout(() => {
      const assignmentData = mockAssignments.find(a => a.id == assignmentId);
      const assignmentSubmissions = mockSubmissions.filter(s => s.assignmentId == assignmentId);

      if (assignmentData) {
        setAssignment(assignmentData);
        setSubmissions(assignmentSubmissions);
      }
      setLoading(false);
    }, 1000);
  }, [assignmentId, userRole, navigate]);

  const handleGradeSubmission = (submissionId) => {
    if (!grade.trim()) {
      alert("Please enter a grade");
      return;
    }

    setSubmissions(submissions.map(sub =>
      sub.id === submissionId
        ? { ...sub, grade, feedback, status: "graded" }
        : sub
    ));

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
    successMessage.textContent = `✅ Submission graded successfully!`;
    document.body.appendChild(successMessage);
    setTimeout(() => document.body.removeChild(successMessage), 3000);

    // Reset form
    setGrade("");
    setFeedback("");
    setSelectedSubmission(null);
  };

  const getGradeColor = (grade) => {
    if (!grade) return "#6b7280";
    if (grade.startsWith("A")) return "#10b981";
    if (grade.startsWith("B")) return "#f59e0b";
    if (grade.startsWith("C")) return "#f97316";
    return "#ef4444";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted": return "#f59e0b";
      case "graded": return "#10b981";
      default: return "#6b7280";
    }
  };

  if (loading) {
    return (
      <Layout pageTitle="Assignment Submissions">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: "20px", color: "#666" }}>Loading submissions...</p>
        </div>
      </Layout>
    );
  }

  if (!assignment) {
    return (
      <Layout pageTitle="Assignment Not Found">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <FaFileAlt style={{ fontSize: "3rem", color: "#ccc", marginBottom: "20px" }} />
          <h3 style={{ color: "#666", marginBottom: "10px" }}>Assignment Not Found</h3>
          <p style={{ color: "#999" }}>The assignment you're looking for doesn't exist.</p>
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
    <Layout pageTitle={`${assignment.title} - Submissions`}>
      <div style={{ padding: "20px 0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          {/* Header */}
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            marginBottom: "30px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: "#f3f4f6",
                  color: "#6b7280",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <FaChevronLeft />
                Back
              </button>
              <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0 0 5px 0" }}>
                  {assignment.title}
                </h1>
                <p style={{ color: "#6b7280", margin: 0 }}>
                  {assignment.course} • Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937" }}>
                  {submissions.length}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>Submitted</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937" }}>
                  {assignment.totalStudents - submissions.length}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>Pending</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981" }}>
                  {submissions.filter(s => s.status === "graded").length}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>Graded</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
            {/* Submissions List */}
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "20px" }}>
                Student Submissions
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {submissions.map(submission => (
                  <div
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    style={{
                      padding: "15px",
                      border: selectedSubmission?.id === submission.id ? "2px solid #667eea" : "1px solid #e5e7eb",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background: selectedSubmission?.id === submission.id ? "#f0f9ff" : "#fff",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <h4 style={{ fontWeight: "bold", margin: "0 0 5px 0" }}>
                          {submission.studentName}
                        </h4>
                        <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>
                          {submission.studentEmail}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          background: getStatusColor(submission.status) + "20",
                          color: getStatusColor(submission.status)
                        }}>
                          {submission.status}
                        </div>
                        {submission.grade && (
                          <div style={{
                            marginTop: "5px",
                            padding: "2px 6px",
                            borderRadius: "8px",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                            background: getGradeColor(submission.grade) + "20",
                            color: getGradeColor(submission.grade)
                          }}>
                            Grade: {submission.grade}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "15px", fontSize: "0.9rem", color: "#6b7280" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <FaCalendarAlt />
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <FaFileAlt />
                        {submission.attachments?.length || 0} files
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submission Details */}
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
            }}>
              {selectedSubmission ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                    <div>
                      <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: "0 0 5px 0" }}>
                        {selectedSubmission.studentName}'s Submission
                      </h2>
                      <p style={{ color: "#6b7280", margin: 0 }}>
                        Submitted on {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      background: getStatusColor(selectedSubmission.status) + "20",
                      color: getStatusColor(selectedSubmission.status)
                    }}>
                      {selectedSubmission.status}
                    </div>
                  </div>

                  {/* Submission Content */}
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "10px" }}>
                      Submission Content
                    </h3>
                    <div style={{
                      padding: "15px",
                      background: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <p style={{ margin: 0, lineHeight: "1.6" }}>
                        {selectedSubmission.content}
                      </p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "10px" }}>
                        Attachments
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {selectedSubmission.attachments.map((attachment, index) => (
                          <div key={index} style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px",
                            background: "#f8f9fa",
                            borderRadius: "6px",
                            border: "1px solid #e5e7eb"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <FaFileAlt style={{ color: "#6b7280" }} />
                              <span style={{ fontWeight: "500" }}>{attachment.name}</span>
                              <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                                ({attachment.size})
                              </span>
                            </div>
                            <button
                              onClick={() => {
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
                                successMessage.textContent = `✅ Download started for "${attachment.name}"`;
                                document.body.appendChild(successMessage);
                                setTimeout(() => document.body.removeChild(successMessage), 3000);
                              }}
                              style={{
                                padding: "6px 12px",
                                background: "#667eea",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px"
                              }}
                            >
                              <FaDownload />
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grading Section */}
                  {selectedSubmission.status !== "graded" ? (
                    <div style={{
                      padding: "20px",
                      background: "#f0f9ff",
                      borderRadius: "8px",
                      border: "1px solid #3b82f6"
                    }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "15px" }}>
                        Grade Submission
                      </h3>

                      <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                          Grade
                        </label>
                        <select
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "1rem"
                          }}
                        >
                          <option value="">Select Grade</option>
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="B-">B-</option>
                          <option value="C+">C+</option>
                          <option value="C">C</option>
                          <option value="C-">C-</option>
                          <option value="D">D</option>
                          <option value="F">F</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}>
                          Feedback
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Provide constructive feedback for the student..."
                          style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "1rem",
                            minHeight: "100px",
                            resize: "vertical"
                          }}
                        />
                      </div>

                      <button
                        onClick={() => handleGradeSubmission(selectedSubmission.id)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
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
                        <FaSave />
                        Save Grade & Feedback
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      padding: "20px",
                      background: "#f0fdf4",
                      borderRadius: "8px",
                      border: "1px solid #10b981"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
                        <FaStar style={{ color: "#10b981", fontSize: "1.2rem" }} />
                        <span style={{ fontWeight: "bold", color: "#10b981" }}>
                          Grade: {selectedSubmission.grade}
                        </span>
                      </div>

                      {selectedSubmission.feedback && (
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                            <FaComment style={{ color: "#6b7280" }} />
                            <span style={{ fontWeight: "bold" }}>Feedback</span>
                          </div>
                          <p style={{ margin: 0, lineHeight: "1.6", color: "#374151" }}>
                            {selectedSubmission.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                  <FaUser style={{ fontSize: "3rem", marginBottom: "15px", opacity: 0.5 }} />
                  <p>Select a submission to view details and grade</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssignmentSubmissions;