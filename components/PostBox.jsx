// PostBox Component - Instagram Style
// Allows users to create new posts with text and images

"use client";

import { useState, useRef } from "react";
import { db, storage } from "@/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";

const PostBox = () => {
  // State for post text input
  const [text, setText] = useState("");
  // State for selected image
  const [image, setImage] = useState(null);
  // State for image preview URL
  const [imagePreview, setImagePreview] = useState(null);
  // State for loading/submitting status
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for upload progress
  const [uploadProgress, setUploadProgress] = useState("");
  // Get current user from auth context
  const { user } = useAuth();
  // Ref for file input
  const fileInputRef = useRef(null);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      // Check file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input - need either text or image
    if (!text.trim() && !image) return;

    setIsSubmitting(true);
    setUploadProgress("Preparing...");

    try {
      let imageUrl = null;

      // Upload image if selected
      if (image) {
        setUploadProgress("Uploading image...");
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(snapshot.ref);
        setUploadProgress("Creating post...");
      }

      // Add new post to Firestore "posts" collection
      await addDoc(collection(db, "posts"), {
        text: text.trim(),
        imageUrl: imageUrl,
        userName: user.displayName,
        userId: user.uid,
        userPhoto: user.photoURL,
        timestamp: serverTimestamp(),
        likes: [],
        likeCount: 0,
        comments: []
      });

      // Clear inputs after successful submission
      setText("");
      setImage(null);
      setImagePreview(null);
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert(`Failed to create post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              {user?.displayName?.charAt(0)}
            </div>
          )}
          <span className="font-semibold text-sm text-gray-900">{user?.displayName}</span>
        </div>
      </div>

      {/* Post form */}
      <form onSubmit={handleSubmit}>
        {/* Text input area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full px-4 py-3 text-sm resize-none focus:outline-none placeholder-gray-400 min-h-[80px]"
          maxLength={2200}
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="px-4 pb-3 relative">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="px-4 pb-2">
            <div className="flex items-center space-x-2 text-sm text-blue-500">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{uploadProgress}</span>
            </div>
          </div>
        )}

        {/* Footer with actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          {/* Left side icons */}
          <div className="flex items-center space-x-4">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            {/* Image upload button */}
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className={`transition-colors ${image ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
              title="Add photo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </button>
            <button type="button" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </button>
          </div>

          {/* Character count */}
          <span className={`text-xs ${text.length > 2000 ? 'text-red-500' : 'text-gray-400'}`}>
            {text.length}/2,200
          </span>

          {/* Submit button */}
          <button
            type="submit"
            disabled={(!text.trim() && !image) || isSubmitting}
            className={`font-semibold text-sm px-4 py-1.5 rounded-lg transition-all ${
              (!text.trim() && !image) || isSubmitting
                ? "text-blue-300 cursor-not-allowed"
                : "text-white bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Share"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostBox;
