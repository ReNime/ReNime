"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiSparkleFill } from "react-icons/pi";
import {
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaTachometerAlt,
  FaUserShield,
} from "react-icons/fa";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  /* ================= ADMIN CHECK ================= */
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/check");
        const data = await res.json();
        setIsAdmin(data.isAdmin === true);
      } catch {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user?.email]);

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }

      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        const btn = e.target.closest('[aria-label="Toggle menu"]');
        if (!btn) setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isProfileOpen) setIsOpen(false);
  }, [isProfileOpen]);

  useEffect(() => {
    if (isOpen) setIsProfileOpen(false);
  }, [isOpen]);

  const navLinks = [
    { href: "/manga", name: "Manga" },
    { href: "/populer", name: "Populer" },
    { href: "/movie", name: "Movie" },
    { href: "/genres", name: "Genre" },
    { href: "/schedule", name: "Schedule" },
  ];

  return (
    <nav className="w-full md:pt-10 pt-5 relative z-50">
      <div className="container mx-auto flex justify-center items-center px-4">
        {/* ================= DESKTOP MENU ================= */}
        <ul className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="link-theme text-md font-medium relative group"
              >
                {link.name}
                <span
                  className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                  style={{
                    background:
                      "linear-gradient(to right, var(--accent-from), var(--accent-to))",
                  }}
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* ================= RIGHT SIDE ================= */}
        <div className="absolute right-4 top-5 md:right-10 md:top-6 flex items-center gap-3">
          <ThemeSwitcher />

          <Link
            href="/renai"
            className="text-theme-primary animate-pulse hover:scale-110 transition-transform"
            style={{ filter: "drop-shadow(0 0 8px var(--accent-from))" }}
          >
            <PiSparkleFill size={28} />
          </Link>

          {/* ================= PROFILE ================= */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-theme hover:scale-105 transition"
              style={{
                borderColor: isProfileOpen
                  ? "var(--accent-from)"
                  : "var(--border-theme)",
              }}
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-theme-tertiary flex items-center justify-center">
                  <FaUser className="text-theme-secondary" />
                </div>
              )}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-theme-secondary border border-theme rounded-xl shadow-2xl overflow-hidden"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-theme">
                        <p className="text-sm font-semibold">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs text-theme-tertiary truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-flex gap-1 mt-2 px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-[var(--accent-from)] to-[var(--accent-to)]">
                            <FaUserShield />
                            Admin
                          </span>
                        )}
                      </div>

                      <Link
                        href="/users/dashboard"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-theme-tertiary"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaTachometerAlt /> Dashboard
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-theme-tertiary border-t border-theme"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FaUserShield /> Admin
                        </Link>
                      )}

                      <Link
                        href="/api/auth/signout"
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 border-t border-theme"
                      >
                        <FaSignOutAlt /> Logout
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/api/auth/signin"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-theme-tertiary"
                    >
                      <FaSignInAlt /> Login
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ================= HAMBURGER ================= */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center"
        >
          <motion.span
            className="absolute w-8 h-[2px] bg-current"
            animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : -6 }}
          />
          <motion.span
            className="absolute w-8 h-[2px] bg-current"
            animate={{ opacity: isOpen ? 0 : 1 }}
          />
          <motion.span
            className="absolute w-8 h-[2px] bg-current"
            animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 6 }}
          />
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden absolute top-full left-0 right-0 bg-theme-secondary border-b border-theme shadow-2xl"
          >
            <ul className="flex flex-col p-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="block py-3 px-4 rounded-lg hover:bg-theme-tertiary"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
