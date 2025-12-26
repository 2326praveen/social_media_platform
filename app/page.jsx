// Home Page - Instagram Style
// Main feed page with post creation and post list

"use client";

import Navbar from "@/components/Navbar";
import PostBox from "@/components/PostBox";
import PostList from "@/components/PostList";
import Stories from "@/components/Stories";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";

function HomeContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-[470px] mx-auto px-4 py-6">
        {/* Stories Section */}
        <Stories />

        {/* Post Creation Box */}
        <PostBox />

        {/* Posts List */}
        <PostList />
      </main>

      {/* Footer */}
      <footer className="max-w-[470px] mx-auto px-4 py-8 text-center">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
          <span>About</span>
          <span>Help</span>
          <span>Press</span>
          <span>API</span>
          <span>Jobs</span>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Locations</span>
          <span>Language</span>
        </div>
        <p className="text-xs text-gray-400">© 2025 SOCIALHUB FROM META</p>
      </footer>
    </div>
  );
}

// Wrap with AuthGuard for protection
export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
