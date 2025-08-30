import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireRole = null, fallback = "/login" }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to={fallback} replace />;
  }

  if (requireRole && !hasRole(requireRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
