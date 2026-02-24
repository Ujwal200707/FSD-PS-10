import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@components/layout/Layout";
import {
  FaUsers,
  FaBook,
  FaClipboardList,
  FaChartBar,
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaDownload,
  FaShieldAlt,
} from "react-icons/fa";
import { getAllUsers, getUsersByRole, deleteUser, saveUser, generatePlatformReport } from "@utils/admin";
import { getCourses, getEnrollments, getSubmissions } from "@utils/courses";
import { getCurrentUser } from "@utils/auth";
import ExportPanel from "@components/ExportPanel";
import AnalyticsChart from "@components/AnalyticsChart";
import { exportUserReport, exportEnrollmentReport, exportGradeReport } from "@utils/exports";
import { getAdminAnalytics } from "@utils/analytics";



const AdminDashboard = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [report, setReport] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    setUsers(getAllUsers());
    setCourses(getCourses());
    setEnrollments(getEnrollments());
    setSubmissions(getSubmissions());
    setAnalytics(getAdminAnalytics());
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const stats = useMemo(
    () => ({
      totalUsers: users.length,
      students: users.filter((u) => u.role === "student").length,
      instructors: users.filter((u) => u.role === "teacher").length,
      admins: users.filter((u) => u.role === "admin").length,
      activeEnrollments: enrollments.length,
      totalCourses: courses.length,
    }),
    [users, enrollments, courses]
  );

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure? This action cannot be undone.")) {
      deleteUser(userId);
      setUsers(getAllUsers());
    }
  };

  const handleToggleUserStatus = (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    saveUser({ ...user, status: newStatus });
    setUsers(getAllUsers());
  };

  const handleGenerateReport = () => {
    const newReport = generatePlatformReport();
    setReport(newReport);
  };

  const exportHandlers = [
    {
      id: "users",
      label: "Users",
      description: "Export all users to CSV",
      handler: () => exportUserReport(users),
    },
    {
      id: "enrollments",
      label: "Enrollments",
      description: "Export all enrollments to CSV",
      handler: () => exportEnrollmentReport(
        enrollments.map((e) => ({
          ...e,
          studentName: users.find((u) => u.id === e.studentId)?.name || "Unknown",
          courseName: courses.find((c) => c.id === e.courseId)?.title || "Unknown",
        }))
      ),
    },
    {
      id: "grades",
      label: "Grades",
      description: "Export all grades to CSV",
      handler: () => exportGradeReport(
        submissions.filter(s => s.grade !== null && s.grade !== undefined).map((s) => ({
          ...s,
          studentName: users.find((u) => u.id === s.studentId)?.name || "Unknown",
          assignmentName: s.assignmentName || "Assignment",
          grade: s.grade,
        }))
      ),
    },
  ];


  return (
    <Layout pageTitle="Administration Dashboard">
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", margin: "0 0 8px 0" }}>Administration Dashboard</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>Manage platform users, courses, and system settings</p>
        <div style={{ marginTop: "14px" }}>
          <button
            onClick={() => navigate("/admin/secure-exams")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
              color: "#fff",
              border: "none",
              padding: "10px 14px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <FaShieldAlt /> Manage SEB Secure Exams
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <div style={{ background: "var(--color-card-bg)", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px" }}>
              <FaUsers />
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", margin: "0 0 4px 0", fontSize: "14px" }}>Total Users</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>{stats.totalUsers}</h3>
            </div>
          </div>
        </div>

        <div style={{ background: "var(--color-card-bg)", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px" }}>
              <FaBook />
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", margin: "0 0 4px 0", fontSize: "14px" }}>Active Courses</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>{stats.totalCourses}</h3>
            </div>
          </div>
        </div>

        <div style={{ background: "var(--color-card-bg)", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px" }}>
              <FaClipboardList />
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", margin: "0 0 4px 0", fontSize: "14px" }}>Enrollments</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>{stats.activeEnrollments}</h3>
            </div>
          </div>
        </div>

        <div style={{ background: "var(--color-card-bg)", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px" }}>
              <FaChartBar />
            </div>
            <div>
              <p style={{ color: "var(--text-secondary)", margin: "0 0 4px 0", fontSize: "14px" }}>Instructors</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>{stats.instructors}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Export Panel */}
      <ExportPanel exports={exportHandlers} />

      {/* Analytics Charts */}
      {analytics && (
        <div style={{ marginTop: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 16px 0" }}>Analytics Overview</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "32px" }}>
            <AnalyticsChart
              title="Engagement by Role"
              data={[
                { label: "Students", value: analytics.engagementByRole.student },
                { label: "Instructors", value: analytics.engagementByRole.instructor },
                { label: "Content", value: analytics.engagementByRole.contentcreator },
              ]}
            />
            <div style={{ background: "var(--color-card-bg)", borderRadius: "12px", padding: "20px", border: "1px solid var(--border-color)" }}>
              <h3 style={{ margin: "0 0 16px", color: "var(--text-primary)", fontSize: "16px" }}>Key Metrics</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Avg Grade</span>
                  <strong style={{ color: "var(--text-primary)" }}>{analytics.avgGrade}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "12px", borderBottom: "1px solid var(--border-color)" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Completion Rate</span>
                  <strong style={{ color: "var(--text-primary)" }}>{analytics.completionRate}%</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Total Enrollments</span>
                  <strong style={{ color: "var(--text-primary)" }}>{analytics.totalEnrollments}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Section */}
      <div style={{ background: "var(--color-card-bg)", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: "32px", border: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>Platform Analytics</h2>
          <button
            onClick={handleGenerateReport}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <FaDownload /> Generate Report
          </button>
        </div>

        {report && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <div style={{ background: "var(--bg-primary)", padding: "16px", borderRadius: "8px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 12px 0", color: "var(--text-primary)" }}>User Breakdown</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ fontSize: "14px", padding: "6px 0", color: "var(--text-secondary)" }}>Students: <strong style={{ color: "var(--text-primary)" }}>{report.userBreakdown.students}</strong></li>
                <li style={{ fontSize: "14px", padding: "6px 0", color: "var(--text-secondary)" }}>Instructors: <strong style={{ color: "var(--text-primary)" }}>{report.userBreakdown.instructors}</strong></li>
                <li style={{ fontSize: "14px", padding: "6px 0", color: "var(--text-secondary)" }}>Admins: <strong style={{ color: "var(--text-primary)" }}>{report.userBreakdown.admins}</strong></li>
              </ul>
            </div>

            <div style={{ background: "var(--bg-primary)", padding: "16px", borderRadius: "8px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 12px 0", color: "var(--text-primary)" }}>Course Statistics</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                <li style={{ fontSize: "14px", padding: "6px 0", color: "var(--text-secondary)" }}>Active Courses: <strong style={{ color: "var(--text-primary)" }}>{report.courseStats.activeCoursesCount}</strong></li>
                <li style={{ fontSize: "14px", padding: "6px 0", color: "var(--text-secondary)" }}>Avg Students/Course: <strong style={{ color: "var(--text-primary)" }}>{report.courseStats.averageStudentsPerCourse}</strong></li>
                <li style={{ fontSize: "14px", padding: "6px 0", color: "var(--text-secondary)" }}>Submission Rate: <strong style={{ color: "var(--text-primary)" }}>{report.engagementMetrics.submissionRate}%</strong></li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* User Management */}
      <div style={{ background: "var(--color-card-bg)", padding: "24px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "var(--text-primary)" }}>User Management</h2>
          <button
            onClick={() => navigate("/admin/add-user")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <FaUserPlus /> Add New User
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-primary)", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <FaSearch style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: "14px", color: "var(--text-primary)" }}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px", cursor: "pointer", background: "var(--color-card-bg)", color: "var(--text-primary)" }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Instructor</option>
            <option value="student">Student</option>
            <option value="content">Content Creator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "14px", cursor: "pointer", background: "var(--color-card-bg)", color: "var(--text-primary)" }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                <th style={{ textAlign: "left", padding: "12px", fontWeight: "600", color: "var(--text-secondary)", fontSize: "14px" }}>Name</th>
                <th style={{ textAlign: "left", padding: "12px", fontWeight: "600", color: "var(--text-secondary)", fontSize: "14px" }}>Email</th>
                <th style={{ textAlign: "left", padding: "12px", fontWeight: "600", color: "var(--text-secondary)", fontSize: "14px" }}>Role</th>
                <th style={{ textAlign: "left", padding: "12px", fontWeight: "600", color: "var(--text-secondary)", fontSize: "14px" }}>Status</th>
                <th style={{ textAlign: "left", padding: "12px", fontWeight: "600", color: "var(--text-secondary)", fontSize: "14px" }}>Join Date</th>
                <th style={{ textAlign: "center", padding: "12px", fontWeight: "600", color: "var(--text-secondary)", fontSize: "14px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "12px", fontSize: "14px", color: "var(--text-primary)" }}><strong>{user.name || "N/A"}</strong></td>
                    <td style={{ padding: "12px", fontSize: "14px", color: "var(--text-primary)" }}>{user.email}</td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: user.role === "admin" ? "#fee2e2" : user.role === "teacher" ? "#dbeafe" : "#dcfce7",
                        color: user.role === "admin" ? "#7f1d1d" : user.role === "teacher" ? "#0c2d6b" : "#15803d"
                      }}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        background: user.status === "active" ? "#dcfce7" : "#fee2e2",
                        color: user.status === "active" ? "#15803d" : "#7f1d1d"
                      }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: user.status === "active" ? "#10b981" : "#ef4444" }}></span>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>{new Date(user.joinDate).toLocaleDateString()}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          marginRight: "8px",
                          fontSize: "16px",
                          color: user.status === "active" ? "#10b981" : "#6b7280",
                        }}
                        title={user.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {user.status === "active" ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button
                        onClick={() => navigate("/students")}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          marginRight: "8px",
                          fontSize: "16px",
                          color: "#3b82f6",
                        }}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                          color: "#ef4444",
                        }}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "32px", color: "var(--text-secondary)" }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default AdminDashboard;
