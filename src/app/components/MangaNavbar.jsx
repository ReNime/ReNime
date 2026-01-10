"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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
    { href: "/populer", name: "Populer" },
    { href: "/movie", name: "Movie" },
    { href: "/genres", name: "Genre" },
    { href: "/schedule", name: "Schedule" },
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
