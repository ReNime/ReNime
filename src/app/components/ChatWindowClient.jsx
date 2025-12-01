'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaArrowLeft } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function ChatWindowClient({ friend, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastMessageIdRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingCheckIntervalRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
    startPolling();
    startTypingCheck();

    return () => {
      stopPolling();
      stopTypingCheck();
    };
  }, [friend.id]);

  // Start polling for new messages every 0.7 seconds
  function startPolling() {
    stopPolling(); // Clear any existing interval
    pollingIntervalRef.current = setInterval(() => {
      checkNewMessages();
    }, 700); // Poll every 0.7 seconds
  }

  function stopPolling() {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }

  // Start checking for friend typing status
  function startTypingCheck() {
    stopTypingCheck();
    typingCheckIntervalRef.current = setInterval(() => {
      checkFriendTyping();
    }, 500); // Check every 0.5 seconds
  }

  function stopTypingCheck() {
    if (typingCheckIntervalRef.current) {
      clearInterval(typingCheckIntervalRef.current);
      typingCheckIntervalRef.current = null;
    }
  }

  async function loadMessages() {
    try {
      const res = await fetch(`/api/chat/messages?friendId=${friend.id}`);
      const data = await res.json();
      const loadedMessages = data.messages || [];
      setMessages(loadedMessages);
      
      // Store the last message ID
      if (loadedMessages.length > 0) {
        lastMessageIdRef.current = loadedMessages[loadedMessages.length - 1].id;
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async function checkNewMessages() {
    try {
      const res = await fetch(`/api/chat/messages?friendId=${friend.id}&since=${lastMessageIdRef.current || ''}`);
      const data = await res.json();
      const newMessages = data.messages || [];

      if (newMessages.length > 0) {
        setMessages(prev => {
          // Avoid duplicates by filtering out messages we already have
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNew = newMessages.filter(m => !existingIds.has(m.id));
          
          if (uniqueNew.length > 0) {
            lastMessageIdRef.current = newMessages[newMessages.length - 1].id;
            return [...prev, ...uniqueNew];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error checking new messages:', error);
    }
  }

  async function checkFriendTyping() {
    try {
      const res = await fetch(`/api/chat/typing?friendId=${friend.id}`);
      const data = await res.json();
      setFriendTyping(data.isTyping || false);
    } catch (error) {
      console.error('Error checking typing status:', error);
    }
  }

  async function updateTypingStatus(typing) {
    try {
      await fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendId: friend.id,
          isTyping: typing
        })
      });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim()) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      senderId: currentUser.id,
      content: newMessage,
      createdAt: new Date(),
      temp: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: friend.id,
          content: newMessage,
        }),
      });

      const data = await res.json();
      
      // Replace temp message with real message
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id ? data.message : msg
      ));

      // Update last message ID
      if (data.message) {
        lastMessageIdRef.current = data.message.id;
      }

      // Check for new messages immediately after sending
      setTimeout(checkNewMessages, 500);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  }

  // Handle typing indicator
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (newMessage.trim()) {
      // User is typing
      if (!isTyping) {
        setIsTyping(true);
        updateTypingStatus(true);
      }

      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        updateTypingStatus(false);
      }, 3000);
    } else {
      // User stopped typing
      if (isTyping) {
        setIsTyping(false);
        updateTypingStatus(false);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white overflow-hidden">
      <div className="flex h-screen">
        {/* Left Sidebar - Friends List */}
        <div className="w-80 bg-slate-900/60 backdrop-blur-xl border-r border-blue-500/20 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-blue-500/20 flex items-center justify-between">
            <Link href="/friends">
              <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                <FaArrowLeft />
                <span className="font-semibold">Back to Friends</span>
              </button>
            </Link>
          </div>

          {/* Current Chat User */}
          <div className="p-4 bg-blue-500/10 border-b border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/50">
                <Image src={friend.image || '/default-avatar.png'} alt={friend.name} fill className="object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{friend.name}</h3>
                <p className="text-xs text-green-400">● Online</p>
              </div>
            </div>
          </div>

          {/* Friend Info */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-slate-800/40 rounded-xl p-4 border border-blue-500/10">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">About</h4>
              <p className="text-xs text-slate-400">{friend.email}</p>
            </div>

            <div className="bg-slate-800/40 rounded-xl p-4 border border-blue-500/10">
              <h4 className="text-sm font-semibold text-blue-300 mb-2">Shared Activity</h4>
              <p className="text-xs text-slate-400">Friends since {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Right Side - Chat Messages */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 sm:p-6 border-b border-blue-500/20 bg-slate-900/40 backdrop-blur-xl flex items-center gap-3 sm:gap-4">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/50">
              <Image src={friend.image || '/default-avatar.png'} alt={friend.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white text-lg">{friend.name}</h3>
              <p className="text-xs text-green-400">● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-lg ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-sm'
                          : 'bg-slate-800/90 text-slate-100 border border-slate-700/50 rounded-bl-sm'
                      } ${msg.temp ? 'opacity-70' : 'opacity-100'}`}
                    >
                      <p className="text-sm sm:text-base break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-blue-100/70' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {friendTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex justify-start"
                >
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/90 border border-slate-700/50 rounded-2xl rounded-bl-sm shadow-lg">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-xs text-slate-400 ml-1">{friend.name} is typing...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 sm:p-6 border-t border-blue-500/20 bg-slate-900/40 backdrop-blur-xl">
            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 px-4 py-3 bg-slate-800/50 border border-blue-500/20 rounded-xl text-white placeholder-blue-300/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-sm sm:text-base"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaComments className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
        }
