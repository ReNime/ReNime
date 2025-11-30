"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { PiSparkleFill } from 'react-icons/pi';
import { FaUser, FaSignOutAlt, FaSignInAlt, FaTachometerAlt } from 'react-icons/fa';

const Navbar = ({ user }) => { 
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/populer", name: "Populer" },
    { href: "/movie", name: "Movie" },
    { href: "/genres", name: "Genre" },
    { href: "/schedule", name: "Schedule" },
  ];

  return (
    <nav className="w-full md:pt-10 pt-5 relative z-50">
      <div className="container mx-auto flex justify-center items-center px-4">
        {/* === Menu Desktop === */}
        <ul className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link 
                href={link.href} 
                className="text-neutral-300 hover:text-blue-500 transition-colors duration-200 font-medium text-md"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* === Right Side: Sparkle + Profile === */}
        <div className="absolute right-4 top-5 md:right-10 md:top-6 flex items-center gap-3">
          {/* Sparkle Icon */}
          <Link href="/renai" className="text-white-500 animate-pulse hover:scale-110 transition-transform">
            <PiSparkleFill size={28} />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/50 hover:border-blue-500 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  <FaUser className="text-slate-400 text-lg" />
                </div>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-blue-500/20 rounded-xl shadow-2xl shadow-blue-500/10 overflow-hidden">
                {user ? (
                  <>
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-blue-500/20">
                      <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-neutral-400 truncate">{user.email || ''}</p>
                    </div>

                    {/* Profile Link */}
                    <Link 
                      href="/users/dashboard" 
                      className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaTachometerAlt className="text-lg" />
                      <span className="font-medium">Dashboard</span>
                    </Link>

                    {/* Logout Link */}
                    <Link 
                      href="/api/auth/signout" 
                      className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:bg-red-500/10 hover:text-red-400 transition-colors border-t border-blue-500/10"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaSignOutAlt className="text-lg" />
                      <span className="font-medium">Logout</span>
                    </Link>
                  </>
                ) : (
                  <>
                    {/* Login Link */}
                    <Link 
                      href="/api/auth/signin" 
                      className="flex items-center gap-3 px-4 py-3 text-neutral-300 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FaSignInAlt className="text-lg" />
                      <span className="font-medium">Login</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* === Tombol Hamburger Mobile === */}
        <div className="md:hidden w-full">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            aria-label="Toggle menu"
            className="text-white focus:outline-none"
          >
            <svg 
              className="w-10 h-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              >
              </path>
            </svg>
          </button>
        </div>
      </div>

      {/* === Menu Dropdown Mobile === */}
      <div className={`
        md:hidden absolute top-full left-0 right-0 bg-[#0F0F18] 
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'max-h-screen shadow-lg' : 'max-h-0'}
      `}>
        <ul className="flex flex-col p-4">
          {navLinks.map((link) => (
            <li key={link.href} className="w-full">
              <Link 
                href={link.href} 
                className="block py-3 px-2 text-neutral-200 hover:bg-blue-700 rounded-md transition-colors"
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

export default Navbar;
