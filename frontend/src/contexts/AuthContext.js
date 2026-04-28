import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

import auth from "../config/firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [is2FAVerified, set2FAVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function register(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    set2FAVerified(false);
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function updateUserProfile(user, profile) {
    return updateProfile(user, profile);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) set2FAVerified(false);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    is2FAVerified,
    set2FAVerified,
    error,
    setError,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
