import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { resetPassword, setError } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(email);
      setMessage("Check your inbox for further instructions");
    } catch (err) {
      setError("Failed to reset password");
    }

    setLoading(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="glass max-w-md w-full p-8 rounded-3xl shadow-2xl animate-fade-in-up space-y-8">
        <div>
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-3xl text-center font-bold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-gray-500 dark:text-gray-400">
            Enter your email to receive a reset link
          </p>
        </div>

        {message && (
          <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500/50 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl relative" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
