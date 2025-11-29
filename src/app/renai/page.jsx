"use client";

import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaSpinner, FaTimes } from "react-icons/fa";
import { LuScanLine } from "react-icons/lu";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSession, signIn } from "next-auth/react";
import { searchAnimeByFile } from "@/app/libs/traceMoe";
import Head from "next/head";

export default function AichixiaPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session;

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      type: "text",
      content:
        "Hi I'm **Aichixia**, your AI assistant for anime, manga, manhwa, manhua, and light novels. You can chat or upload a screenshot via Scan button to identify an anime instantly!",
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
        const res = await fetch("/api/aichixia", {
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
    <>
      <Head>
        <title>Aichixia | AI Assistant</title>
        <meta
          name="description"
          content="Aichixia is your AI assistant for anime, manga, manhwa, and light novels. Chat or identify anime from screenshots!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center min-h-screen bg-slate-900 text-white relative overflow-hidden">
        <div className="w-full max-w-4xl flex flex-col h-screen px-4 relative z-10">
          <header className="p-4 border-b border-blue-500/20 flex items-center justify-between sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl rounded-b-2xl">
            <h1 className="text-xl font-bold text-blue-300">Aichixia</h1>
            <button
              onClick={() => setScanOpen(true)}
              disabled={scanCooldown > 0 || !isAuthenticated}
              className="px-3 py-2 bg-blue-500 rounded-xl disabled:opacity-50"
            >
              <LuScanLine />
              {scanCooldown > 0 && <span>{scanCooldown}s</span>}
            </button>
          </header>

          <section className="flex-1 overflow-y-auto py-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-xl max-w-xs break-words ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {msg.type === "text" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : msg.type === "image" && typeof msg.content === "string" ? (
                    <Image
                      src={msg.content}
                      alt="preview"
                      width={200}
                      height={200}
                      className="rounded-xl"
                    />
                  ) : msg.type === "scan" ? (
                    <pre>{JSON.stringify(msg.content, null, 2)}</pre>
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </section>

          <footer className="p-3 bg-slate-900/80 sticky bottom-0 flex gap-2">
            {!isAuthenticated ? (
              <button
                onClick={() => signIn()}
                className="flex-1 px-4 py-2 bg-blue-500 rounded-xl text-white font-bold"
              >
                Login to chat
              </button>
            ) : (
              <>
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
              </>
            )}
          </footer>
        </div>

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

                {session && pendingImage && (
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
    </>
  );
}
