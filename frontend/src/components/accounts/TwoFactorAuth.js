import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function TwoFactorAuth() {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const inputRefs = useRef([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { set2FAVerified, setError, currentUser } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  // Generate a mock code on mount
  useEffect(() => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    console.log("====================================");
    console.log("🔒 YOUR 2FA CODE IS:", code);
    console.log("====================================");
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newPin = [...pin];
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredPin = pin.join("");

    if (enteredPin === generatedCode) {
      try {
        setLoading(true);
        set2FAVerified(true);
        
        // Redirect based on where they came from
        const from = location.state?.from || "/";
        navigate(from);
      } catch (err) {
        setError("Verification failed");
      }
    } else {
      setError("Invalid security code");
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="glass max-w-md w-full p-8 rounded-3xl shadow-2xl animate-fade-in-up space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Your Identity</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            We've sent a 6-digit security code to your email.
            <br />
            <span className="text-xs font-mono text-indigo-400 mt-2 block">(Check the browser console for the mock code)</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2 sm:gap-4">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-bold rounded-xl glass-input focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || pin.some(d => !d)}
            className="w-full py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => window.location.reload()}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}
