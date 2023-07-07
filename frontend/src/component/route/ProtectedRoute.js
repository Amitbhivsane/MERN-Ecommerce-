import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

const ProtectedRoute = ({ isAdmin, component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.user);
  const Navigate = useNavigate();

  // //
  // if (isAdmin === true && user.role !== "admin") {
  //   return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
  // }
  if (loading) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
