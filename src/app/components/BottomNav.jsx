"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaHome, FaCalendarAlt, FaCompass, FaBookOpen } from "react-icons/fa";
import { GiBookshelf } from "react-icons/gi";
import { MdMenuBook, MdMenuOpen } from "react-icons/md";
import { IoClose } from "react-icons/io5";

const navItems = [
  { href: "/home", label: "Home", icon: <FaHome size={22} /> },
  { href: "/upcoming", label: "Schedule", icon: <FaCalendarAlt size={22} /> },
  { href: "/explore", label: "Explore", icon: <FaCompass size={22} /> },
  { href: "/manga", label: "Manga", icon: <FaBookOpen size={22} /> },
  { href: "/manhwa", label: "Manhwa", icon: <MdMenuBook size={22} /> },
  { href: "/light-novel", label: "Novels", icon: <GiBookshelf size={22} /> },
];

export default function BottomNav() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const idx = navItems.findIndex(
      (item) =>
        router.pathname === item.href ||
        router.pathname.startsWith(item.href + "/")
    );
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [router.pathname]);

  const handleNavClick = (index, href) => {
    setActiveIndex(index);
    router.push(href);
  };

  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center z-50">
      <div className="bg-neutral-900/80 backdrop-blur-md border border-sky-500/10 rounded-3xl flex items-center justify-between px-4 py-3 max-w-md w-[94%]">
        {navItems.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(index, item.href)}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors ${
                isActive ? "text-sky-400" : "text-gray-400 hover:text-sky-300"
              }`}
            >
              {item.icon}
              <span className="text-xs">{isActive ? item.label : ""}</span>
            </button>
          );
        })}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-lg"
      >
        {open ? <IoClose size={20} /> : <MdMenuOpen size={20} />}
      </button>
    </div>
  );
}
