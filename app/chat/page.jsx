// Chat Page - Instagram DM Style
// Real-time global chat with all users

"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";

function ChatContent() {
  const { user } = useAuth();
  // State for messages
  const [messages, setMessages] = useState([]);
  // State for new message input
  const [newMessage, setNewMessage] = useState("");
  // State for loading
  const [loading, setLoading] = useState(true);
  // State for sending message
  const [sending, setSending] = useState(false);
  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Create query to get last 100 messages ordered by timestamp
    const q = query(
      collection(db, "chat"),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesArray = [];
      querySnapshot.forEach((doc) => {
        messagesArray.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setMessages(messagesArray);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);

    try {
      // Add message to Firestore "chat" collection
      await addDoc(collection(db, "chat"), {
        text: newMessage.trim(),
        userName: user.displayName,
        userId: user.uid,
        userPhoto: user.photoURL,
        timestamp: serverTimestamp()
      });

      // Clear input
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Format timestamp to time
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Chat Container */}
      <div className="flex-1 max-w-3xl w-full mx-auto flex flex-col bg-white border-x border-gray-200">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white sticky top-16 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-lg">🌍</span>
              </div>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Global Chat</h1>
              <p className="text-xs text-green-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                {messages.length} messages
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-900 hover:opacity-60">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </button>
            <button className="text-gray-900 hover:opacity-60">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </button>
            <button className="text-gray-900 hover:opacity-60">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[500px] max-h-[calc(100vh-220px)] bg-white">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full space-y-3">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
              <span className="text-gray-500 text-sm">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-24 h-24 rounded-full border-2 border-gray-900 flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-900" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-1">Your Messages</h3>
              <p className="text-gray-500 text-sm">Send a message to start the chat.</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.userId === user.uid;
              const showAvatar = index === 0 || messages[index - 1]?.userId !== message.userId;

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-end space-x-2 max-w-[70%] ${
                      isOwnMessage ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                  >
                    {/* User Avatar */}
                    {!isOwnMessage && (
                      <div className="w-7 h-7 flex-shrink-0">
                        {showAvatar && (
                          message.userPhoto ? (
                            <img
                              src={message.userPhoto}
                              alt={message.userName}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                              {message.userName?.charAt(0) || "?"}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className="group">
                      {!isOwnMessage && showAvatar && (
                        <p className="text-xs text-gray-500 mb-1 ml-1">{message.userName}</p>
                      )}
                      <div
                        className={`px-4 py-2 rounded-3xl ${
                          isOwnMessage
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm break-words">{message.text}</p>
                      </div>
                      <p className={`text-[10px] text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOwnMessage ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {/* Invisible element for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input - Instagram Style */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-gray-200 bg-white"
        >
          <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-2">
            {/* Emoji button */}
            <button type="button" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </button>
            
            {/* Input */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
              maxLength={1000}
              disabled={sending}
            />

            {/* Actions */}
            {newMessage.trim() ? (
              <button
                type="submit"
                disabled={sending}
                className="text-blue-500 font-semibold text-sm hover:text-blue-600"
              >
                {sending ? "..." : "Send"}
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button type="button" className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <button type="button" className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </button>
                <button type="button" className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// Wrap with AuthGuard for protection
export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatContent />
    </AuthGuard>
  );
}
