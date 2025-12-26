// PostList Component - Instagram Style
// Displays all posts with real-time updates

"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebaseConfig";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { FollowButton } from "@/components/FollowSystem";

const PostList = () => {
  // State for posts array
  const [posts, setPosts] = useState([]);
  // Loading state
  const [loading, setLoading] = useState(true);
  // Get current user
  const { user } = useAuth();
  // State for expanded comments
  const [expandedComments, setExpandedComments] = useState({});
  // State for comment inputs
  const [commentInputs, setCommentInputs] = useState({});
  // State for menu visibility
  const [showMenu, setShowMenu] = useState({});
  // State for saved posts
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    // Create query to get posts ordered by timestamp (newest first)
    const q = query(
      collection(db, "posts"),
      orderBy("timestamp", "desc")
    );

    // Subscribe to real-time updates using onSnapshot
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setPosts(postsArray);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Handle like/unlike
  const handleLike = async (postId, likes = []) => {
    const postRef = doc(db, "posts", postId);
    const isLiked = likes.includes(user.uid);

    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
          likeCount: (likes.length || 1) - 1
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
          likeCount: (likes.length || 0) + 1
        });
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  // Handle delete post
  const handleDelete = async (postId, postUserId) => {
    if (user.uid !== postUserId) return;
    
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
    setShowMenu({});
  };

  // Handle add comment
  const handleAddComment = async (postId) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    try {
      const postRef = doc(db, "posts", postId);
      const newComment = {
        id: Date.now().toString(),
        text: commentText,
        userName: user.displayName,
        userId: user.uid,
        userPhoto: user.photoURL,
        createdAt: new Date().toISOString()
      };
      
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
      
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (postId, comment) => {
    if (user.uid !== comment.userId) return;
    
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        comments: arrayRemove(comment)
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Toggle comments visibility
  const toggleComments = (postId) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId]
    });
  };

  // Handle save/unsave post
  const handleSavePost = (postId) => {
    if (savedPosts.includes(postId)) {
      setSavedPosts(savedPosts.filter(id => id !== postId));
    } else {
      setSavedPosts([...savedPosts, postId]);
    }
  };

  // Handle share post
  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.userName}`,
          text: post.text,
          url: window.location.href
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(post.text);
      alert("Post text copied to clipboard!");
    }
  };

  // Format timestamp to relative time
  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    const now = new Date();
    const postDate = timestamp.toDate();
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return postDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                <div className="h-2 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-2xl font-light text-gray-800 mb-2">Share Photos</h3>
        <p className="text-gray-500 text-sm">When you share photos, they will appear on your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Render each post */}
      {posts.map((post) => {
        const isLiked = post.likes?.includes(user?.uid);
        
        return (
          <div
            key={post.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Post header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                {/* User avatar with gradient ring */}
                <div className="p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full">
                  {post.userPhoto ? (
                    <img
                      src={post.userPhoto}
                      alt={post.userName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm border-2 border-white">
                      {post.userName?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                {/* Username and time */}
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-sm text-gray-900">{post.userName}</p>
                  {user.uid !== post.userId && (
                    <>
                      <span className="text-gray-300">•</span>
                      <FollowButton
                        targetUserId={post.userId}
                        targetUserName={post.userName}
                        targetUserPhoto={post.userPhoto}
                        size="small"
                      />
                    </>
                  )}
                </div>
              </div>
              {/* More options */}
              <div className="relative">
                <button 
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setShowMenu({ ...showMenu, [post.id]: !showMenu[post.id] })}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="6" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="12" cy="18" r="1.5"/>
                  </svg>
                </button>
                {showMenu[post.id] && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowMenu({})} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      {user.uid === post.userId && (
                        <button
                          onClick={() => handleDelete(post.id, post.userId)}
                          className="w-full flex items-center px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete post
                        </button>
                      )}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(post.text);
                          setShowMenu({});
                          alert("Post text copied!");
                        }}
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy text
                      </button>
                      <button
                        onClick={() => setShowMenu({})}
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-sm text-gray-700"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Post Image */}
            {post.imageUrl && (
              <div className="w-full">
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full object-cover max-h-[600px]"
                />
              </div>
            )}

            {/* Post content */}
            {post.text && (
              <div className="px-4 py-2">
                <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {post.text}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Like button */}
                  <button 
                    onClick={() => handleLike(post.id, post.likes)}
                    className={`hover:opacity-60 transition-opacity ${isLiked ? 'like-animation' : ''}`}
                  >
                    {isLiked ? (
                      <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    )}
                  </button>
                  {/* Comment button */}
                  <button 
                    className="hover:opacity-60 transition-opacity"
                    onClick={() => toggleComments(post.id)}
                  >
                    <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                    </svg>
                  </button>
                  {/* Share button */}
                  <button 
                    className="hover:opacity-60 transition-opacity"
                    onClick={() => handleShare(post)}
                  >
                    <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
                {/* Save button */}
                <button 
                  className="hover:opacity-60 transition-opacity"
                  onClick={() => handleSavePost(post.id)}
                >
                  {savedPosts.includes(post.id) ? (
                    <svg className="w-7 h-7 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Like count */}
              {(post.likes?.length > 0 || post.likeCount > 0) && (
                <p className="font-semibold text-sm mt-2">
                  {post.likes?.length || post.likeCount} {(post.likes?.length || post.likeCount) === 1 ? 'like' : 'likes'}
                </p>
              )}

              {/* Caption */}
              <div className="mt-1">
                <span className="font-semibold text-sm mr-2">{post.userName}</span>
                <span className="text-sm text-gray-900">{post.text?.slice(0, 100)}{post.text?.length > 100 ? '...' : ''}</span>
              </div>

              {/* View comments link */}
              {post.comments?.length > 0 && !expandedComments[post.id] && (
                <button 
                  onClick={() => toggleComments(post.id)}
                  className="text-sm text-gray-500 mt-1"
                >
                  View all {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                </button>
              )}

              {/* Comments section */}
              {expandedComments[post.id] && (
                <div className="mt-3 space-y-2">
                  {post.comments?.map((comment) => (
                    <div key={comment.id} className="flex items-start justify-between group">
                      <div className="flex items-start space-x-2">
                        {comment.userPhoto ? (
                          <img src={comment.userPhoto} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs">
                            {comment.userName?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-sm mr-2">{comment.userName}</span>
                          <span className="text-sm">{comment.text}</span>
                        </div>
                      </div>
                      {user.uid === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(post.id, comment)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment input */}
              {expandedComments[post.id] && (
                <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ""}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    placeholder="Add a comment..."
                    className="flex-1 text-sm outline-none placeholder-gray-400"
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment(post.id)}
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    disabled={!commentInputs[post.id]?.trim()}
                    className={`text-sm font-semibold ${commentInputs[post.id]?.trim() ? 'text-blue-500 hover:text-blue-600' : 'text-blue-300'}`}
                  >
                    Post
                  </button>
                </div>
              )}

              {/* Timestamp */}
              <p className="text-xs text-gray-400 mt-2 uppercase">
                {formatDate(post.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PostList;
