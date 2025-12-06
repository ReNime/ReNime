'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchInput() {
  const router = useRouter();
  const searchRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = searchRef.current.value;

    if (keyword === "") {
      showNotification("Please type something to search", "warning");
      return;
    } else if (keyword.trim() === "") {
      showNotification("Please don't use only spaces", "warning");
      return;
    } else {
      router.push(`/search/${keyword.trim()}`);
    }
  };

  const showNotification = (message, type) => {
    // You can implement a toast notification here
    alert(message);
  };

  const clearSearch = () => {
    setInputValue('');
    searchRef.current.value = '';
    searchRef.current.focus();
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md my-8">
      <motion.div 
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Search Icon - Left side */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-theme-tertiary" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          ref={searchRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search anime title..."
          className={`
            w-full input-theme
            rounded-full py-3 pl-12 pr-24
            transition-all duration-300
            ${isFocused ? 'ring-2 ring-[var(--accent-from)] shadow-lg shadow-[var(--shadow-theme)]' : ''}
          `}
        />

        {/* Clear button - Shows when input has text */}
        <AnimatePresence>
          {inputValue && (
            <motion.button
              type="button"
              onClick={clearSearch}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-theme-tertiary transition-colors"
              aria-label="Clear"
            >
              <XMarkIcon className="h-5 w-5 text-theme-tertiary hover:text-theme-primary" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Submit Button - Right side */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-2 top-1/2 -translate-y-1/2 btn-theme-primary p-2 rounded-full transition-all shadow-lg"
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="h-6 w-6" />
        </motion.button>

        {/* Focus indicator - bottom border animation */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 gradient-theme rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Search suggestions (optional - can be enabled later) */}
      {/* <AnimatePresence>
        {isFocused && inputValue && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-theme-secondary border border-theme rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="text-xs text-theme-tertiary px-3 py-2">Recent Searches</div>
              // Add recent searches here
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </form>
  );
      }
