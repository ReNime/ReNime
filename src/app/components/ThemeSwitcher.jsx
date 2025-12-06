
"use client";

import { useTheme } from '@/app/context/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative p-3 rounded-2xl bg-gradient-to-br backdrop-blur-xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl theme-button"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.3 }}
        className="relative z-10"
      >
        {theme === 'dark' ? (
          <FaMoon className="text-lg theme-icon" />
        ) : (
          <FaSun className="text-lg theme-icon" />
        )}
      </motion.div>
    </motion.button>
  );
}
