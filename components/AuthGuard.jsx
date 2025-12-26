// Auth Guard Component - Instagram Style
// Protects routes from unauthenticated users

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-6">
            <span className="text-4xl font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              SocialHub
            </span>
          </div>
          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-6">
            <span className="text-4xl font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              SocialHub
            </span>
          </div>
          <p className="text-gray-400 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};

export default AuthGuard;
