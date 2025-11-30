'use client';

import { useState, useEffect, useRef } from 'react';

import { motion } from 'framer-motion';

import { FaComments, FaArrowLeft } from 'react-icons/fa';

import Image from 'next/image';

import Link from 'next/link';

export default function ChatWindowClient({ friend, currentUser }) {

  const [messages, setMessages] = useState([]);

  const [newMessage, setNewMessage] = useState('');

  const [isTyping, setIsTyping] = useState(false);

  const [friendTyping, setFriendTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {

    loadMessages();

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  }, [friend.id]);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  }, [messages]);

  async function loadMessages() {

    try {

      const res = await fetch(`/api/chat/messages?friendId=${friend.id}`);

      const data = await res.json();

      setMessages(data.messages || []);

    } catch (error) {

      console.error('Error loading messages:', error);

    }

  }

  async function sendMessage() {

    if (!newMessage.trim()) return;

    const tempMessage = {

      id: Date.now(),

      senderId: currentUser.id,

      content: newMessage,

      createdAt: new Date(),

    };

    setMessages([...messages, tempMessage]);

    setNewMessage('');

    try {

      await fetch('/api/chat/send', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          receiverId: friend.id,

          content: newMessage,

        }),

      });

    } catch (error) {

      console.error('Error sending message:', error);

    }

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white p-4 sm:p-6 lg:p-8">

      <div className="max-w-4xl mx-auto">

        <div className="flex flex-col h-[calc(100vh-200px)] bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl">

          {/* Chat Header */}

          <div className="p-4 sm:p-6 border-b border-blue-500/20 flex items-center gap-3 sm:gap-4">

            <Link href="/friends">

              <button className="p-2 hover:bg-blue-500/10 rounded-xl transition-all">

                <FaArrowLeft className="text-blue-400" />

              </button>

            </Link>

            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/50">

              <Image src={friend.image || '/default-avatar.png'} alt={friend.name} fill className="object-cover" />

            </div>

            <div className="flex-1">

              <h3 className="font-bold text-white text-lg">{friend.name}</h3>

              <p className="text-xs text-green-400">● Online</p>

            </div>

          </div>

          {/* Messages */}

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

            {messages.map((msg) => (

              <motion.div

                key={msg.id}

                initial={{ opacity: 0, y: 10 }}

                animate={{ opacity: 1, y: 0 }}

                className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}

              >

                <div

                  className={`max-w-[75%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-lg ${

                    msg.senderId === currentUser.id

                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'

                      : 'bg-slate-800/80 text-slate-100 border border-blue-500/20'

                  }`}

                >

                  <p className="text-sm sm:text-base break-words">{msg.content}</p>

                  <p className="text-xs opacity-70 mt-1">

                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

                  </p>

                </div>

              </motion.div>

            ))}

            {/* Typing Indicator */}

            {friendTyping && (

              <motion.div

                initial={{ opacity: 0 }}

                animate={{ opacity: 1 }}

                className="flex gap-2 px-4 py-3 bg-slate-800/60 rounded-2xl w-fit"

              >

                <div className="flex gap-1">

                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>

                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>

                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>

                </div>

              </motion.div>

            )}

            <div ref={messagesEndRef} />

          </div>

          {/* Input */}

          <div className="p-4 sm:p-6 border-t border-blue-500/20">

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

                className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"

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