import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const WithPrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return null;

  return currentUser ? children : <Navigate to="/login" />;
};

export default WithPrivateRoute;