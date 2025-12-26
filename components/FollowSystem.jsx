// Follow System - Instagram Style
// Handles follow requests, followers, and following

"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDoc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

// Hook to manage follow status
export const useFollowStatus = (targetUserId) => {
  const { user } = useAuth();
  const [followStatus, setFollowStatus] = useState("none"); // none, pending, following
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !targetUserId || user.uid === targetUserId) {
      setLoading(false);
      return;
    }

    // Check if already following
    const followingRef = doc(db, "follows", `${user.uid}_${targetUserId}`);
    
    const unsubscribe = onSnapshot(followingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFollowStatus(data.status); // "pending" or "following"
      } else {
        setFollowStatus("none");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, targetUserId]);

  return { followStatus, loading };
};

// Hook to get followers/following counts
export const useFollowCounts = (userId) => {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Get followers count (people who follow this user)
    const followersQuery = query(
      collection(db, "follows"),
      where("targetUserId", "==", userId),
      where("status", "==", "following")
    );

    const unsubFollowers = onSnapshot(followersQuery, (snapshot) => {
      setFollowers(snapshot.size);
    });

    // Get following count (people this user follows)
    const followingQuery = query(
      collection(db, "follows"),
      where("followerId", "==", userId),
      where("status", "==", "following")
    );

    const unsubFollowing = onSnapshot(followingQuery, (snapshot) => {
      setFollowing(snapshot.size);
    });

    return () => {
      unsubFollowers();
      unsubFollowing();
    };
  }, [userId]);

  return { followers, following };
};

// Hook to get pending follow requests
export const useFollowRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const requestsQuery = query(
      collection(db, "follows"),
      where("targetUserId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requestsData = [];
      snapshot.forEach((doc) => {
        requestsData.push({ id: doc.id, ...doc.data() });
      });
      setRequests(requestsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { requests, loading };
};

// Follow Button Component
export const FollowButton = ({ targetUserId, targetUserName, targetUserPhoto, size = "normal" }) => {
  const { user } = useAuth();
  const { followStatus, loading } = useFollowStatus(targetUserId);
  const [actionLoading, setActionLoading] = useState(false);

  // Don't show button for own profile
  if (!user || user.uid === targetUserId) return null;

  const handleFollow = async () => {
    setActionLoading(true);
    try {
      const followDocId = `${user.uid}_${targetUserId}`;
      const followRef = doc(db, "follows", followDocId);

      await setDoc(followRef, {
        followerId: user.uid,
        followerName: user.displayName,
        followerPhoto: user.photoURL,
        targetUserId: targetUserId,
        targetUserName: targetUserName,
        targetUserPhoto: targetUserPhoto,
        status: "pending",
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending follow request:", error);
      alert("Failed to send follow request");
    }
    setActionLoading(false);
  };

  const handleUnfollow = async () => {
    if (!confirm("Are you sure you want to unfollow?")) return;
    
    setActionLoading(true);
    try {
      const followDocId = `${user.uid}_${targetUserId}`;
      await deleteDoc(doc(db, "follows", followDocId));
    } catch (error) {
      console.error("Error unfollowing:", error);
      alert("Failed to unfollow");
    }
    setActionLoading(false);
  };

  const handleCancelRequest = async () => {
    setActionLoading(true);
    try {
      const followDocId = `${user.uid}_${targetUserId}`;
      await deleteDoc(doc(db, "follows", followDocId));
    } catch (error) {
      console.error("Error canceling request:", error);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <button disabled className={`${size === "small" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"} bg-gray-100 text-gray-400 rounded-lg`}>
        ...
      </button>
    );
  }

  const buttonClasses = size === "small" 
    ? "px-3 py-1 text-xs font-semibold rounded-lg transition-all"
    : "px-4 py-1.5 text-sm font-semibold rounded-lg transition-all";

  if (followStatus === "following") {
    return (
      <button
        onClick={handleUnfollow}
        disabled={actionLoading}
        className={`${buttonClasses} bg-gray-100 text-gray-900 hover:bg-gray-200`}
      >
        {actionLoading ? "..." : "Following"}
      </button>
    );
  }

  if (followStatus === "pending") {
    return (
      <button
        onClick={handleCancelRequest}
        disabled={actionLoading}
        className={`${buttonClasses} bg-gray-100 text-gray-900 hover:bg-gray-200`}
      >
        {actionLoading ? "..." : "Requested"}
      </button>
    );
  }

  return (
    <button
      onClick={handleFollow}
      disabled={actionLoading}
      className={`${buttonClasses} bg-blue-500 text-white hover:bg-blue-600`}
    >
      {actionLoading ? "..." : "Follow"}
    </button>
  );
};

// Follow Requests Panel Component
export const FollowRequestsPanel = () => {
  const { user } = useAuth();
  const { requests, loading } = useFollowRequests();
  const [processingId, setProcessingId] = useState(null);

  const handleAccept = async (request) => {
    setProcessingId(request.id);
    try {
      const followRef = doc(db, "follows", request.id);
      await setDoc(followRef, {
        ...request,
        status: "following",
        acceptedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept request");
    }
    setProcessingId(null);
  };

  const handleReject = async (request) => {
    setProcessingId(request.id);
    try {
      await deleteDoc(doc(db, "follows", request.id));
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
    setProcessingId(null);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Loading requests...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No pending follow requests
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {requests.map((request) => (
        <div key={request.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              {request.followerPhoto ? (
                <img src={request.followerPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 font-semibold">
                  {request.followerName?.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">{request.followerName}</p>
              <p className="text-xs text-gray-500">wants to follow you</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleAccept(request)}
              disabled={processingId === request.id}
              className="px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600"
            >
              {processingId === request.id ? "..." : "Confirm"}
            </button>
            <button
              onClick={() => handleReject(request)}
              disabled={processingId === request.id}
              className="px-4 py-1.5 bg-gray-100 text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-200"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FollowButton;
