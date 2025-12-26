// Root Layout
// Main application layout with AuthProvider

import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Application metadata
export const metadata = {
  title: "SocialHub - Connect with the World",
  description: "A social media platform to share posts and chat in real-time",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Wrap entire app with AuthProvider for authentication state */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
