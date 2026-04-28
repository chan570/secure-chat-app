import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { currentUser, register, setError } = useAuth();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);
      await register(email, password);
      navigate("/2fa", { state: { from: "/profile" } });
    } catch (e) {
      setError("Failed to register");
    }

    setLoading(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="glass max-w-md w-full p-8 rounded-3xl shadow-2xl animate-fade-in-up space-y-8">
        <div>
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-6">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h2 className="text-3xl text-center font-bold text-gray-900 dark:text-white">
            Join ChatApp
          </h2>
          <p className="mt-2 text-center text-gray-500 dark:text-gray-400">
            Create an account to start chatting
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleFormSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="glass-input block w-full px-4 py-3 rounded-xl text-gray-900 dark:text-white sm:text-sm"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="glass-input block w-full px-4 py-3 rounded-xl text-gray-900 dark:text-white sm:text-sm"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="glass-input block w-full px-4 py-3 rounded-xl text-gray-900 dark:text-white sm:text-sm"
                placeholder="••••••••"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
