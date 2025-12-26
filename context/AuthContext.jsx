// Authentication Context Provider
// Manages user authentication state across the application

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Create the Auth Context
const AuthContext = createContext({});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  // Current user state
  const [user, setUser] = useState(null);
  // Loading state while checking authentication
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUser(user);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {/* Only render children when not loading */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
