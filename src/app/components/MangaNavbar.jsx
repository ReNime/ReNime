"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { PiSparkleFill } from "react-icons/pi";
import { FaUser, FaSignOutAlt, FaSignInAlt, FaTachometerAlt, FaUserShield } from "react-icons/fa";

const MangaNavbar = ({ user }) => { 
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

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
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, [user?.email]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        const hamburgerButton = event.target.closest('[aria-label="Toggle menu"]');
        if (!hamburgerButton) {
          setIsOpen(false);
        }
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
    { href: "/", name: "Anime" },
    { href: "/populer", name: "Populer" },
    { href: "/movie", name: "Movie" },
    { href: "/genres", name: "Genre" },
    { href: "/schedule", name: "Schedule" },
  ];

  return (
    <nav className="w-full md:pt-10 pt-5 relative z-50">
      <div className="container mx-auto flex justify-center items-center px-4">
        {/* Menu Desktop */}
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
                  style={{ background: "linear-gradient(to right, var(--accent-from), var(--accent-to))" }}
                ></span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Side: Sparkle + Profile */}
        <div className="absolute right-4 top-5 md:right-10 md:top-6 flex items-center gap-3">
          {/* Sparkle Icon */}
          <Link 
            href="/renai" 
            className="text-theme-primary animate-pulse hover:scale-110 transition-transform duration-300 hover:drop-shadow-lg"
            style={{ filter: "drop-shadow(0 0 8px var(--accent-from))" }}
          >
            <PiSparkleFill size={28} />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-theme hover:scale-105 focus:outline-none transition-all duration-300"
              style={{ 
                boxShadow: isProfileOpen ? "0 0 0 3px var(--border-theme)" : "none",
                borderColor: isProfileOpen ? "var(--accent-from)" : "var(--border-theme)"
              }}
            >
              {user?.image ? (
                <Image 
                  src={user.image} 
                  alt="Profile" 
                  width={40} 
                  height={40} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-theme-tertiary flex items-center justify-center">
                  <FaUser className="text-theme-secondary text-lg" />
                </div>
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-theme-secondary backdrop-blur-xl border border-theme rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-theme bg-theme-tertiary/30">
                      <p className="text-sm font-semibold text-theme-primary truncate">{user.name || "User"}</p>
                      <p className="text-xs text-theme-tertiary truncate">{user.email || ""}</p>
                      {isAdmin && (
                        <span 
                          className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-xs rounded-full font-medium"
                          style={{ 
                            background: "linear-gradient(to right, var(--accent-from), var(--accent-to))",
                            color: "var(--text-primary)"
                          }}
                        >
                          <FaUserShield className="text-[10px]" />
                          Admin
                        </span>
                      )}
                    </div>

                    <Link 
                      href="/users/dashboard" 
                      className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover:bg-theme-tertiary transition-all duration-200"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaTachometerAlt className="text-lg" />
                      <span className="font-medium">Dashboard</span>
                    </Link>

                    {isAdmin && (
                      <Link 
                        href="/admin/dashboard" 
                        className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover:bg-theme-tertiary transition-all duration-200 border-t border-theme"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaUserShield className="text-lg" />
                        <span className="font-medium">Admin Dashboard</span>
                      </Link>
                    )}

                    <Link 
                      href="/api/auth/signout" 
                      className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 border-t border-theme"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaSignOutAlt className="text-lg" />
                      <span className="font-medium">Logout</span>
                    </Link>
                  </>
                ) : (
                  <Link 
                    href="/api/auth/signin" 
                    className="flex items-center gap-3 px-4 py-3 text-theme-secondary hover:bg-theme-tertiary transition-all duration-200"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FaSignInAlt className="text-lg" />
                    <span className="font-medium">Login</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden w-full">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            aria-label="Toggle menu"
            className="text-theme-primary focus:outline-none hover:scale-105 transition-transform duration-200"
          >
            <svg 
              className="w-10 h-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div 
        ref={mobileMenuRef}
        className={`md:hidden absolute top-full left-0 right-0 bg-theme-secondary border-b border-theme backdrop-blur-xl transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-screen shadow-2xl opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col p-4 space-y-1">
          {navLinks.map((link) => (
            <li key={link.href} className="w-full">
              <Link 
                href={link.href} 
                className="block py-3 px-4 text-theme-secondary hover:bg-theme-tertiary hover:text-theme-primary rounded-lg transition-all duration-200 font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default MangaNavbar;
