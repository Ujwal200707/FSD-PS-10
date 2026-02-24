// src/routes/AppRoutes.jsx
import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import AdminDashboard from "../pages/dashboard/AdminDashboard";
import TeacherDashboard from "../pages/dashboard/TeacherDashboard";
import StudentDashboard from "../pages/dashboard/StudentDashboard";
import ContentCreatorDashboard from "../pages/dashboard/ContentCreatorDashboard";

import Assignments from "../pages/Assignments";
import AssignmentSubmissions from "../pages/AssignmentSubmissions";
import Courses from "../pages/Courses";
import CourseDetails from "../pages/CourseDetails";
import CourseLearnPage from "../pages/CourseLearnPage";
import CourseEdit from "../pages/CourseEdit";
import Students from "../pages/Students";
import ContentManagement from "../pages/ContentManagement";
import Settings from "../pages/Settings";
import Unauthorized from "../pages/Unauthorized";
import SecureExam from "../pages/SecureExam";
import SecureExamAdmin from "../pages/SecureExamAdmin";
import ExamReminders from "../pages/ExamReminders";
import { ALL_ROLES, ROLES } from "../constants/roles";
import { canAccessRole, getCurrentUser } from "../utils/auth";

const RequireAuth = ({ roles }) => {
  const user = getCurrentUser();

  if (!user) return <Navigate to="/login" replace />;
  if (!canAccessRole(user.role, roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected app shell */}
      <Route element={<RequireAuth roles={ALL_ROLES} />}>
        {/* Role dashboards */}
        <Route element={<RequireAuth roles={[ROLES.ADMIN]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/secure-exams" element={<SecureExamAdmin />} />
          <Route
            path="/admin/add-user"
            element={<Navigate to="/students" replace state={{ openCreateUser: true }} />}
          />
          <Route path="/admin/manage-courses" element={<Courses />} />
        </Route>

        <Route element={<RequireAuth roles={[ROLES.TEACHER]} />}>
          <Route path="/instructor" element={<TeacherDashboard />} />
          <Route path="/instructor/secure-exams" element={<SecureExamAdmin />} />
          <Route path="/teacher" element={<Navigate to="/instructor" replace />} />
          <Route
            path="/instructor/create-course"
            element={<Navigate to="/courses" replace state={{ openCreateCourse: true }} />}
          />
        </Route>

        <Route element={<RequireAuth roles={[ROLES.STUDENT]} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/secure-exam/:examId" element={<SecureExam />} />
          <Route path="/student/submit-assignment" element={<Navigate to="/assignments" replace />} />
          <Route path="/exam-reminders" element={<ExamReminders />} />
        </Route>

        <Route element={<RequireAuth roles={[ROLES.CONTENT]} />}>
          <Route path="/content-creator" element={<ContentCreatorDashboard />} />
          <Route path="/content" element={<Navigate to="/content-creator" replace />} />
          <Route
            path="/content-creator/add-content"
            element={<Navigate to="/manage" replace state={{ openCreateContent: true }} />}
          />
        </Route>

        {/* Shared protected pages */}
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/assignment/:assignmentId" element={<Assignments />} />
        <Route path="/assignment-submissions" element={<Navigate to="/assignments" replace />} />
        <Route path="/assignment-submissions/:assignmentId" element={<AssignmentSubmissions />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<CourseDetails />} />
        <Route path="/courses/:courseId/learn" element={<CourseLearnPage />} />
        <Route path="/courses/:courseId/edit" element={<CourseEdit />} />
        <Route path="/admin/courses/:courseId/edit" element={<CourseEdit />} />
        <Route path="/students" element={<Students />} />
        <Route path="/manage" element={<ContentManagement />} />
        <Route path="/content/manage" element={<ContentManagement />} />
        <Route path="/content/new" element={<ContentManagement />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
