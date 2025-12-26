// Stories Component - Instagram Style
// Display and create stories that expire in 24 hours

"use client";

import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  doc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";

const Stories = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewingStory, setViewingStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const progressInterval = useRef(null);

  useEffect(() => {
    // Get stories from last 24 hours
    const twentyFourHoursAgo = Timestamp.fromDate(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const q = query(
      collection(db, "stories"),
      where("timestamp", ">", twentyFourHoursAgo),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storiesData = [];
      const userStoriesMap = new Map();

      snapshot.forEach((doc) => {
        const story = { id: doc.id, ...doc.data() };
        
        // Group stories by user
        if (!userStoriesMap.has(story.userId)) {
          userStoriesMap.set(story.userId, {
            userId: story.userId,
            userName: story.userName,
            userPhoto: story.userPhoto,
            stories: []
          });
        }
        userStoriesMap.get(story.userId).stories.push(story);
      });

      // Convert map to array
      userStoriesMap.forEach((value) => {
        storiesData.push(value);
      });

      setStories(storiesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle story image selection
  const handleStorySelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      alert("File size should be less than 10MB");
      return;
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Please select an image or video file");
      return;
    }

    setUploading(true);

    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `stories/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Add story to Firestore
      await addDoc(collection(db, "stories"), {
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        mediaUrl: downloadURL,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
        timestamp: serverTimestamp(),
        viewers: []
      });

      alert("Story added successfully!");
    } catch (error) {
      console.error("Error adding story:", error);
      alert(`Failed to add story: ${error.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // View story
  const openStory = (userStories, index = 0) => {
    setViewingStory(userStories);
    setCurrentStoryIndex(index);
    setProgress(0);
    startProgress();
  };

  // Start progress timer
  const startProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    setProgress(0);
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + 2;
      });
    }, 100);
  };

  // Next story
  const nextStory = () => {
    if (!viewingStory) return;

    if (currentStoryIndex < viewingStory.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      closeStory();
    }
  };

  // Previous story
  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  // Close story viewer
  const closeStory = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    setViewingStory(null);
    setCurrentStoryIndex(0);
    setProgress(0);
  };

  // Check if current user has stories
  const userHasStory = stories.some((s) => s.userId === user?.uid);

  return (
    <>
      {/* Stories Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 overflow-x-auto">
        <div className="flex space-x-4">
          {/* Add Your Story */}
          <div className="flex flex-col items-center space-y-1 flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleStorySelect}
              accept="image/*,video/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative"
            >
              <div className={`w-16 h-16 rounded-full ${userHasStory ? 'p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 'bg-gray-100'} flex items-center justify-center`}>
                <div className={`${userHasStory ? 'w-[60px] h-[60px] border-2 border-white' : 'w-16 h-16'} rounded-full bg-gray-100 flex items-center justify-center overflow-hidden`}>
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="You" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-gray-400">{user?.displayName?.charAt(0)}</span>
                  )}
                </div>
              </div>
              {!userHasStory && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
            <span className="text-xs">{uploading ? "Uploading..." : "Your story"}</span>
          </div>

          {/* Other Users' Stories */}
          {stories
            .filter((s) => s.userId !== user?.uid)
            .map((userStory) => (
              <div
                key={userStory.userId}
                className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
                onClick={() => openStory(userStory)}
              >
                <div className="p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full">
                  <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden">
                    {userStory.userPhoto ? (
                      <img
                        src={userStory.userPhoto}
                        alt={userStory.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {userStory.userName?.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs truncate w-16 text-center">
                  {userStory.userName?.split(" ")[0]}
                </span>
              </div>
            ))}

          {/* Show own stories if exists */}
          {userHasStory && (
            <div
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
              onClick={() => openStory(stories.find((s) => s.userId === user.uid))}
            >
              <div className="p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full">
                <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Your story" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                      {user?.displayName?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs">Your story</span>
            </div>
          )}

          {/* Loading placeholder */}
          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center space-y-1 flex-shrink-0 animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                  <div className="w-12 h-2 bg-gray-200 rounded"></div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {viewingStory && viewingStory.stories[currentStoryIndex] && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
            {viewingStory.stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width: index < currentStoryIndex ? "100%" : index === currentStoryIndex ? `${progress}%` : "0%"
                  }}
                />
              </div>
            ))}
          </div>

          {/* User info */}
          <div className="absolute top-8 left-4 flex items-center space-x-3 z-10">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {viewingStory.userPhoto ? (
                <img src={viewingStory.userPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white">
                  {viewingStory.userName?.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-white font-semibold text-sm">{viewingStory.userName}</span>
            <span className="text-gray-400 text-xs">
              {viewingStory.stories[currentStoryIndex].timestamp?.toDate?.()?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={closeStory}
            className="absolute top-8 right-4 text-white z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Story content */}
          <div className="relative w-full h-full max-w-lg mx-auto flex items-center justify-center">
            {viewingStory.stories[currentStoryIndex].mediaType === "video" ? (
              <video
                src={viewingStory.stories[currentStoryIndex].mediaUrl}
                className="max-h-full max-w-full object-contain"
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={viewingStory.stories[currentStoryIndex].mediaUrl}
                alt="Story"
                className="max-h-full max-w-full object-contain"
              />
            )}

            {/* Navigation areas */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
              onClick={prevStory}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
              onClick={nextStory}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Stories;
