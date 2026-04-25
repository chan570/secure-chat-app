import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { generateAvatar } from "../../utils/GenerateAvatar";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Profile() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState();
  const [loading, setLoading] = useState(false);

  const { currentUser, updateUserProfile, setError } = useAuth();

  useEffect(() => {
    const fetchData = () => {
      const res = generateAvatar();
      setAvatars(res);
    };

    fetchData();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (selectedAvatar === undefined) {
      return setError("Please select an avatar");
    }

    try {
      setError("");
      setLoading(true);
      const user = currentUser;
      const profile = {
        displayName: username,
        photoURL: avatars[selectedAvatar],
      };
      await updateUserProfile(user, profile);
      navigate("/");
    } catch (e) {
      setError("Failed to update profile");
    }

    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="glass max-w-xl w-full p-8 rounded-3xl shadow-2xl animate-fade-in-up space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Customize Your Profile
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Choose an avatar and display name
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {avatars.map((avatar, index) => (
              <div key={index} className="flex justify-center">
                <div 
                  className={classNames(
                    "relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 transition-all duration-300 cursor-pointer hover:scale-105",
                    index === selectedAvatar 
                      ? "ring-4 ring-indigo-500 ring-offset-4 dark:ring-offset-gray-900 scale-105" 
                      : "grayscale hover:grayscale-0"
                  )}
                  onClick={() => setSelectedAvatar(index)}
                >
                  <img
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full rounded-full object-cover shadow-md"
                    src={avatar}
                  />
                  {index === selectedAvatar && (
                    <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-1 shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display Name
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="glass-input block w-full px-4 py-3 rounded-xl text-gray-900 dark:text-white sm:text-sm"
              placeholder="How should others see you?"
              defaultValue={currentUser.displayName || ""}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
