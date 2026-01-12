"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/app/context/ThemeContext";
import "./globals.css";
import NextAuthProvider from "./components/NextAuthProvider";
import { useEffect, useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js");
    }

    // Tangkap event install
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {showInstall && (
          <div style={styles.installBox}>
            <span>📲 Tambahkan ReNime di Layar Utama</span>
            <button onClick={handleInstall}>Install</button>
          </div>
        )}

        <ThemeProvider>
          <NextAuthProvider>{children}</NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

const styles = {
  installBox: {
    position: "fixed",
    bottom: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#111",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 10,
    display: "flex",
    gap: 12,
    alignItems: "center",
    zIndex: 9999,
  },
};
