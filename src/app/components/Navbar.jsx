"use client"; // <-- Tetap "use client" untuk hamburger

import Link from 'next/link';
import { useState } from 'react';
import { PiSparkleFill } from 'react-icons/pi'; // Tambah icon sparkle

// 1. Terima 'user' sebagai prop
const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 2. Buat daftar link dasar
  const navLinks = [
    { href: "/populer", name: "Populer" },
    { href: "/movie", name: "Movie" },
    { href: "/genres", name: "Genre" },
    { href: "/schedule", name: "Schedule" },
  ];

  // 3. Tambahkan link dinamis berdasarkan 'user'
  if (user) {
    navLinks.push({ href: "/users/dashboard", name: "Dashboard" });
    navLinks.push({ href: "/api/auth/signout", name: "Logout" });
  } else {
    navLinks.push({ href: "/api/auth/signin", name: "Login" });
  }

  return (
    <nav className="w-full md:pt-10 pt-5 relative z-50">
      <div className="container mx-auto flex justify-between items-center px-4">

        {/* === Logo / Sparkle Icon === */}
        <div className="absolute right-4 top-3 md:right-10 md:top-6 text-pink-500 animate-pulse">
          <PiSparkleFill size={26} />
        </div>

        {/* === Menu Desktop === */}
        <ul className="hidden md:flex items-center space-x-6 mx-auto">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-neutral-300 hover:text-pink-500 transition-colors duration-200 font-medium text-md"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* === Tombol Hamburger Mobile === */}
        <div className="md:hidden w-full flex justify-end">
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
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* === Menu Dropdown Mobile === */}
      <div
        className={`
          md:hidden absolute top-full left-0 right-0 bg-[#1A1A29]
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? "max-h-screen shadow-lg" : "max-h-0"}
        `}
      >
        <ul className="flex flex-col p-4">
          {navLinks.map((link) => (
            <li key={link.href} className="w-full">
              <Link
                href={link.href}
                className="block py-3 px-2 text-neutral-200 hover:bg-pink-700 rounded-md transition-colors"
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
};

export default Navbar;
