import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@components/layout/Layout";
import { FaUsers, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaUserGraduate, FaEnvelope, FaCalendarAlt, FaUser, FaCog } from "react-icons/fa";
import { getCurrentUser } from "@utils/auth";

const Students = () => {
  const location = useLocation();
  const currentUser = getCurrentUser();
  const userRole = currentUser?.role || "student";

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    status: "Active",
    enrolledCourses: 0,
    joinDate: ""
  });

  // Mock student data
  const mockStudents = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice.johnson@email.com",
      status: "Active",
      enrolledCourses: 5,
      joinDate: "2024-01-15",
      lastActive: "2024-02-20",
      progress: 78
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob.smith@email.com",
      status: "Active",
      enrolledCourses: 3,
      joinDate: "2024-01-20",
      lastActive: "2024-02-19",
      progress: 65
    },
    {
      id: 3,
      name: "Carol Davis",
      email: "carol.davis@email.com",
      status: "Inactive",
      enrolledCourses: 2,
      joinDate: "2024-01-10",
      lastActive: "2024-02-10",
      progress: 45
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david.wilson@email.com",
      status: "Active",
      enrolledCourses: 7,
      joinDate: "2024-01-25",
      lastActive: "2024-02-20",
      progress: 82
    }
  ];

  useEffect(() => {
    if (location.state?.openCreateUser && (userRole === "admin" || userRole === "teacher")) {
      setEditingStudent(null);
      setFormData({
        name: "",
        email: "",
        status: "Active",
        enrolledCourses: 0,
        joinDate: "",
      });
      setShowModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, userRole]);

  useEffect(() => {
    // Simulate API call with role-specific data
    setTimeout(() => {
      let roleSpecificStudents = mockStudents;

      // Filter data based on role
      if (userRole === 'student') {
        // Students only see their own profile
        roleSpecificStudents = mockStudents.filter(student =>
          student.email === currentUser?.email
        );
      } else if (userRole === 'teacher') {
        // Teachers see students in their courses
        roleSpecificStudents = mockStudents.filter(student =>
          student.enrolledCourses > 0 // Mock: assume enrolled students
        );
      }
      // Admin and content creators see all students

      setStudents(roleSpecificStudents);
      setFilteredStudents(roleSpecificStudents);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedStatus !== "All") {
      filtered = filtered.filter(student => student.status === selectedStatus);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, selectedStatus, students]);

  const handleDelete = (studentId) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      setStudents(students.filter(student => student.id !== studentId));
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      status: student.status,
      enrolledCourses: student.enrolledCourses,
      joinDate: student.joinDate
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingStudent) {
      setStudents(students.map(student =>
        student.id === editingStudent.id
          ? { ...student, ...formData }
          : student
      ));
    } else {
      const newStudent = {
        id: students.length + 1,
        ...formData,
        lastActive: new Date().toISOString().split('T')[0],
        progress: 0
      };
      setStudents([...students, newStudent]);
    }
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      status: "Active",
      enrolledCourses: 0,
      joinDate: ""
    });
  };

  const getStatusColor = (status) => {
    return status === "Active" ? "#10b981" : "#6b7280";
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "#10b981";
    if (progress >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <Layout pageTitle={
      userRole === 'admin' ? "User Management" :
      userRole === 'teacher' ? "My Students" :
      userRole === 'content' ? "Student Analytics" :
      "My Profile"
    }>
      <div style={{ padding: "30px" }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <div>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 8px 0"
            }}>
              {userRole === 'admin' && "User Management"}
              {userRole === 'teacher' && "My Students"}
              {userRole === 'content' && "Student Analytics"}
              {userRole === 'student' && "My Profile"}
            </h1>
            <p style={{ color: "#6b7280", margin: 0 }}>
              {userRole === 'admin' && "Manage user accounts, roles, and platform access"}
              {userRole === 'teacher' && "View and manage students enrolled in your courses"}
              {userRole === 'content' && "Analyze student engagement and learning patterns"}
              {userRole === 'student' && "View your profile and learning progress"}
            </p>
          </div>
          {(userRole === 'admin' || userRole === 'teacher') && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              <FaPlus />
              {userRole === 'admin' && "Add User"}
              {userRole === 'teacher' && "Add Student"}
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap"
        }}>
          <div style={{ flex: 1, minWidth: "300px" }}>
            <div style={{ position: "relative" }}>
              <FaSearch style={{
                position: "absolute",
                left: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6b7280"
              }} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 45px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  transition: "border-color 0.3s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#667eea"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
          </div>
          <div style={{ minWidth: "150px" }}>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "2px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "1rem",
                background: "#fff",
                cursor: "pointer"
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
          </div>
        ) : (
          <div style={{
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "20px 30px",
              borderBottom: "1px solid #e5e7eb",
              background: "#f9fafb"
            }}>
              <h3 style={{ margin: 0, color: "#1f2937" }}>
                Students ({filteredStudents.length})
              </h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ padding: "15px 20px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Student</th>
                    <th style={{ padding: "15px 20px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Status</th>
                    <th style={{ padding: "15px 20px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Courses</th>
                    <th style={{ padding: "15px 20px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Progress</th>
                    <th style={{ padding: "15px 20px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Join Date</th>
                    <th style={{ padding: "15px 20px", textAlign: "center", fontWeight: "600", color: "#374151" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontWeight: "600"
                          }}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: "600", color: "#1f2937" }}>{student.name}</div>
                            <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "20px" }}>
                        <span style={{
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          background: getStatusColor(student.status) + "20",
                          color: getStatusColor(student.status)
                        }}>
                          {student.status}
                        </span>
                      </td>
                      <td style={{ padding: "20px", color: "#374151" }}>
                        {student.enrolledCourses} courses
                      </td>
                      <td style={{ padding: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "100px",
                            height: "8px",
                            background: "#e5e7eb",
                            borderRadius: "4px",
                            overflow: "hidden"
                          }}>
                            <div style={{
                              width: `${student.progress}%`,
                              height: "100%",
                              background: getProgressColor(student.progress),
                              borderRadius: "4px"
                            }}></div>
                          </div>
                          <span style={{ fontSize: "0.9rem", color: "#374151" }}>
                            {student.progress}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "20px", color: "#6b7280" }}>
                        {new Date(student.joinDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "20px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            onClick={() => handleEdit(student)}
                            style={{
                              padding: "8px",
                              background: "#3b82f6",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "background 0.3s ease"
                            }}
                            onMouseOver={(e) => e.target.style.background = "#2563eb"}
                            onMouseOut={(e) => e.target.style.background = "#3b82f6"}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            style={{
                              padding: "8px",
                              background: "#ef4444",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              transition: "background 0.3s ease"
                            }}
                            onMouseOver={(e) => e.target.style.background = "#dc2626"}
                            onMouseOut={(e) => e.target.style.background = "#ef4444"}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "30px",
              width: "500px",
              maxWidth: "90vw",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}>
              <h2 style={{ margin: "0 0 20px 0", color: "#1f2937" }}>
                {editingStudent ? "Edit Student" : "Add New Student"}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#374151" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#374151" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#374151" }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", color: "#374151" }}>
                    Enrolled Courses
                  </label>
                  <input
                    type="number"
                    value={formData.enrolledCourses}
                    onChange={(e) => setFormData({...formData, enrolledCourses: parseInt(e.target.value) || 0})}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "1rem"
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {editingStudent ? "Update" : "Add"} Student
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingStudent(null);
                    setFormData({
                      name: "",
                      email: "",
                      status: "Active",
                      enrolledCourses: 0,
                      joinDate: ""
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Layout>
  );
};

export default Students;