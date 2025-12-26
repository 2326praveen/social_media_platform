// Login Page - Instagram Style
// Google authentication login page

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      alert("Failed to sign in. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row items-center gap-8 max-w-4xl w-full">
        
        {/* Left side - Phone mockup (hidden on mobile) */}
        <div className="hidden md:block relative">
          <div className="relative w-[380px] h-[580px]">
            {/* Phone frame */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-[3rem] p-3">
              <div className="w-full h-full bg-black rounded-[2.5rem] p-2">
                <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-[2rem] flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-5xl mb-4">📱</div>
                    <p className="text-2xl font-light">SocialHub</p>
                    <p className="text-sm opacity-80 mt-2">Connect & Share</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-[350px] space-y-3">
          {/* Main login card */}
          <div className="bg-white border border-gray-200 rounded-sm p-10">
            {/* Logo */}
            <h1 className="text-4xl font-semibold text-center mb-8 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              SocialHub
            </h1>

            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Log in with Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-4 text-sm font-semibold text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Demo login fields (non-functional, just for UI) */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Phone number, username, or email"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                disabled
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-sm text-sm focus:outline-none focus:border-gray-400"
                disabled
              />
              <button
                className="w-full bg-blue-200 text-white font-semibold py-2 rounded-lg text-sm cursor-not-allowed"
                disabled
              >
                Log in
              </button>
            </div>

            {/* Forgot password */}
            <p className="text-center text-xs text-blue-900 mt-4 cursor-pointer hover:underline">
              Forgot password?
            </p>
          </div>

          {/* Sign up card */}
          <div className="bg-white border border-gray-200 rounded-sm p-5 text-center">
            <p className="text-sm">
              Don&apos;t have an account?{" "}
              <button onClick={handleGoogleSignIn} className="text-blue-500 font-semibold hover:underline">
                Sign up
              </button>
            </p>
          </div>

          {/* Get the app */}
          <div className="text-center py-4">
            <p className="text-sm mb-4">Get the app.</p>
            <div className="flex justify-center space-x-2">
              <div className="bg-black text-white px-4 py-2 rounded-lg text-xs flex items-center space-x-1">
                <span>🍎</span>
                <span>App Store</span>
              </div>
              <div className="bg-black text-white px-4 py-2 rounded-lg text-xs flex items-center space-x-1">
                <span>▶️</span>
                <span>Google Play</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
