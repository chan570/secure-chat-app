import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import Register from "./components/accounts/Register";
import Login from "./components/accounts/Login";
import Profile from "./components/accounts/Profile";
import ForgotPassword from "./components/accounts/ForgotPassword";
import TwoFactorAuth from "./components/accounts/TwoFactorAuth";
import WithPrivateRoute from "./utils/WithPrivateRoute";
import ChatLayout from "./components/layouts/ChatLayout";
import ErrorMessage from "./components/layouts/ErrorMessage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="h-screen flex flex-col overflow-hidden">
          <ErrorMessage />
          <main className="flex-1 flex flex-col overflow-hidden">
            <Routes>
              <Route exact path="/register" element={<Register />} />
              <Route exact path="/login" element={<Login />} />
              <Route exact path="/forgot-password" element={<ForgotPassword />} />
              <Route exact path="/2fa" element={<TwoFactorAuth />} />
              <Route
                exact
                path="/profile"
                element={
                  <WithPrivateRoute>
                    <Profile />
                  </WithPrivateRoute>
                }
              />
              <Route
                exact
                path="/"
                element={
                  <WithPrivateRoute>
                    <ChatLayout />
                  </WithPrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
