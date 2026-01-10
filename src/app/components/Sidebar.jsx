"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import {
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaTachometerAlt,
  FaUserShield,
  FaEnvelope
} from "react-icons/fa";
import { PiSparkleFill } from "react-icons/pi";
import ThemeSwitcher from "@/app/components/ThemeSwitcher";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.email) return setIsAdmin(false);
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

  const navLinks = [
    { href: "/manga", name: "Manga" },
    { href: "/populer", name: "Populer" },
    { href: "/movie", name: "Movie" },
    { href: "/genres", name: "Genre" },
    { href: "/schedule", name: "Schedule" },
    { href: "/contact", name: "Contact", icon: <FaEnvelope /> },
  ];

  return (
    <>
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 h-screen w-64 bg-theme-secondary border-r border-theme backdrop-blur-xl z-50 flex flex-col">

        {/* Logo / Top */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme">
          <Link href="/" className="flex items-center gap-2 text-theme-primary font-bold text-lg">
            <PiSparkleFill className="text-xl" />
            RENAI
          </Link>
          <ThemeSwitcher />
        </div>

        {/* Menu */}
        <ul className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary transition-all"
              >
                {link.icon}
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Profile */}
        <div ref={profileRef} className="px-4 py-3 border-t border-theme">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 w-full"
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt="Profile"
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-theme-tertiary flex items-center justify-center">
                <FaUser />
              </div>
            )}
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-theme-primary truncate">
                {user?.name || "Guest"}
              </p>
              <p className="text-xs text-theme-tertiary truncate">
                {user?.email || ""}
              </p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="mt-3 rounded-lg overflow-hidden border border-theme">
              {user ? (
                <>
                  <Link
                    href="/users/dashboard"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-theme-tertiary"
                  >
                    <FaTachometerAlt /> Dashboard
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center gap-3 px-4 py-2 hover:bg-theme-tertiary"
                    >
                      <FaUserShield /> Admin
                    </Link>
                  )}

                  <Link
                    href="/api/auth/signout"
                    className="flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-500/10"
                  >
                    <FaSignOutAlt /> Logout
                  </Link>
                </>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-theme-tertiary"
                >
                  <FaSignInAlt /> Login
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="px-4 py-3 text-xs text-center text-theme-tertiary border-t border-theme">
          © {new Date().getFullYear()} Nathan<br />
          All rights reserved.
        </div>
      </nav>

      {/* Content Spacer */}
      <div className="md:ml-64" />
    </>
  );
};

export default Navbar;
