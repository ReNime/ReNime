"use client";

import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaSpinner, FaTimes } from "react-icons/fa";
import { LuScanLine } from "react-icons/lu";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession, signIn } from "next-auth/react";
import { searchAnimeByFile } from "@/app/libs/traceMoe";

export default function ReNimePage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      type: "text",
      content:
        "Hi I'm **RENAI**, your AI assistant for anime, manga, manhwa, manhua, and light novels. Chat or upload a screenshot via Scan button to identify an anime instantly!",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [scanCooldown, setScanCooldown] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (scanCooldown > 0) {
      const timer = setTimeout(() => setScanCooldown(scanCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [scanCooldown]);

  const sendMessage = async () => {
    if (!input.trim() && !pendingImage) return;

    let newMessages = [...messages];

    if (pendingImage) {
      setScanCooldown(30);
      setScanOpen(false);

      newMessages.push({
        role: "user",
        type: "image",
        content: pendingImage,
      });
      newMessages.push({
        role: "user",
        type: "text",
        content: "What is this anime?",
      });
    }

    if (input.trim()) {
      newMessages.push({ role: "user", type: "text", content: input });
    }

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      if (pendingImage) {
        const res = await fetch(pendingImage);
        const blob = await res.blob();
        const file = new File([blob], "upload.jpg", { type: "image/jpeg" });
        const scanRes = await searchAnimeByFile(file);

        setMessages((prev) => [
          ...prev,
          { role: "assistant", type: "scan", content: scanRes },
        ]);
      } else {
        const res = await fetch("/api/renai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input,
            history: messages.map((m) => ({
              role: m.role,
              content:
                typeof m.content === "string" ? m.content : JSON.stringify(m.content),
            })),
          }),
        });

        const data = await res.json();

        if (data.type === "anime" && Array.isArray(data.data)) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", type: "anime", content: data.data },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", type: "text", content: data.reply || "⚠️ No valid response." },
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "text",
          content: "❌ Error while connecting to ReNai.",
        },
      ]);
    } finally {
      setLoading(false);
      setPendingImage(null);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="flex flex-col h-screen p-4 bg-slate-900 text-white">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-xs break-words ${
                msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
              }`}
            >
              {msg.type === "text" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              ) : msg.type === "image" && typeof msg.content === "string" ? (
                <Image src={msg.content} alt="preview" width={200} height={200} />
              ) : msg.type === "scan" ? (
                <pre>{JSON.stringify(msg.content, null, 2)}</pre>
              ) : null}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!isAuthenticated ? (
        <button
          onClick={() => signIn()}
          className="w-full px-4 py-2 bg-blue-500 rounded-xl font-bold"
        >
          Login to chat
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask me anything about anime..."
            className="flex-1 px-4 py-2 rounded-xl bg-slate-800/50 border border-blue-500/20 text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 rounded-xl text-white"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
          <button
            onClick={() => setScanOpen(!scanOpen)}
            className="px-4 py-2 bg-purple-500 rounded-xl text-white"
          >
            <LuScanLine />
          </button>
        </div>
      )}

      <AnimatePresence>
        {scanOpen && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setScanOpen(false)}
          >
            <motion.div
              className="bg-slate-900 p-6 rounded-xl w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              {!isAuthenticated ? (
                <button
                  onClick={() => signIn()}
                  className="px-4 py-2 bg-blue-500 rounded-xl text-white"
                >
                  Login to Scan
                </button>
              ) : (
                <label className="px-4 py-2 bg-green-500 rounded-xl text-white cursor-pointer flex items-center gap-2">
                  <LuScanLine />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              )}

              {pendingImage && (
                <div className="mt-4 relative w-56 h-56 mx-auto">
                  <Image
                    src={pendingImage}
                    alt="preview"
                    fill
                    className="object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setPendingImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <FaTimes />
                  </button>
                </div>
              )}

              {isAuthenticated && pendingImage && (
                <button
                  onClick={sendMessage}
                  className="mt-4 px-4 py-2 bg-blue-500 rounded-xl text-white w-full"
                >
                  Scan Now
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
