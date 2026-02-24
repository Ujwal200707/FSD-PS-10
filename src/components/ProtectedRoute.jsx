import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { canAccessRole, getCurrentUser } from "../utils/auth";

const ProtectedRoute = ({ roles = [], children }) => {
  const location = useLocation();
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessRole(user.role, roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;