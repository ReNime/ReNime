"use client";

import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaSpinner, FaTimes } from "react-icons/fa";
import { LuScanLine } from "react-icons/lu";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { signIn, useSession } from "next-auth/react";
import { searchAnimeByFile } from "@/lib/traceMoe";
import Head from "next/head";

interface AnimeData {
  id: number;
  title: string;
  coverImage: string;
  score: number;
  popularity: number;
  url: string;
}

interface Message {
  role: "user" | "assistant";
  type?: "text" | "anime" | "scan" | "image";
  content: string | AnimeData[] | any[];
}

export default function AichixiaPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      type: "text",
      content:
        "Hi I'm **RENAI**, your AI assistant for anime, manga, manhwa, manhua, and light novels. You can chat or upload a screenshot via Scan button to identify an anime instantly!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [scanCooldown, setScanCooldown] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (scanCooldown > 0) {
      const timer = setTimeout(() => setScanCooldown((s) => Math.max(0, s - 1)), 1000);
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
        const res = await fetch("/api/aichiow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: input,
            history: messages.map((m) => ({
              role: m.role,
              content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
            })),
          }),
        });
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", type: "anime", content: data.data },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              type: "text",
              content: data.reply || "⚠️ No valid response.",
            },
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
          content: "❌ Error while connecting to Aichixia.",
        },
      ]);
    } finally {
      setLoading(false);
      setPendingImage(null);
    }
  };

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Head>
        <title>ReNai | AI Assistant</title>
        <meta
          name="description"
          content="ReNai is your AI assistant for anime, manga, manhwa, and light novels. Chat or identify anime from screenshots!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="..."> {/* tetap gunakan className yang ada di file asli; truncated here for brevity */}
        {/* header omitted — tetap sama */}
        <footer className="..."> {/* footer */}
          {!isAuthenticated ? (
            <button
              onClick={() => signIn()} // NextAuth will redirect to sign-in page (or provider)
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:shadow-2xl hover:shadow-blue-500/40 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
            >
              <FaPaperPlane />
              <span>Login to access ReNai</span>
            </button>
          ) : (
            <div className="flex gap-2 sm:gap-3 items-center">
              <input
                type="text"
                placeholder="Ask me anything about anime..."
                className="flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl bg-slate-800/50 border border-blue-500/20 placeholder-blue-300/40 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all backdrop-blur-xl text-sm sm:text-base"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="relative group p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-white text-lg relative z-10" />
                ) : (
                  <FaPaperPlane className="text-white text-lg relative z-10" />
                )}
              </button>
            </div>
          )}
        </footer>

        {/* scan modal remains same, but change login Link to signIn() */}
        <AnimatePresence>
          {scanOpen && (
            <motion.div /* outer modal */>
              {/* inner modal */}
              {!isAuthenticated ? (
                <button onClick={() => signIn()} className="...">
                  <LuScanLine className="text-xl" />
                  <span>Login to Scan</span>
                </button>
              ) : (
                <label className="...">
                  <LuScanLine className="text-xl" />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              )}
              {/* rest unchanged */}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
