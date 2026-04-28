import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const WithPrivateRoute = ({ children }) => {
  const { currentUser, is2FAVerified, loading } = useAuth();

  if (loading) return null;

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!is2FAVerified) {
    return <Navigate to="/2fa" />;
  }

  return children;
};

export default WithPrivateRoute;