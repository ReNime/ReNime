"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PiSparkleFill } from "react-icons/pi";

const MangaNavbar = () => { 
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
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

  const navLinks = [
    { href: "/", name: "Anime" },
    //{ href: "/populer", name: "Populer" },
    //{ href: "/movie", name: "Movie" },
    { href: "/manga/genres", name: "Genre" },
    { href: "/manhwa", name: "Manhwa" }, 
    //{ href: "/schedule", name: "Schedule" },
  ];

  return (
    <nav className="w-full md:pt-10 pt-5 relative z-50">
      <div className="container mx-auto flex justify-center items-center px-4">
        {/* Desktop Menu */}
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

        {/* Right Side - Sparkle */}
        <div className="absolute right-4 top-5 md:right-10 md:top-6 flex items-center gap-3">
          <Link 
            href="/renai" 
            className="text-theme-primary animate-pulse hover:scale-110 transition-transform duration-300 hover:drop-shadow-lg"
            style={{ filter: "drop-shadow(0 0 8px var(--accent-from))" }}
          >
            <PiSparkleFill size={28} />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="absolute left-4 inset-y-0 flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="w-10 h-10 flex items-center justify-center"
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
