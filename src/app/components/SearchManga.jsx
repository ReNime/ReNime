'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export default function MangaSearchInput({ basePath = '/manga/search' }) {
  const router = useRouter();
  const searchRef = useRef();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = searchRef.current.value.trim();
    if (!keyword) {
      alert("Please type something to search");
      return;
    }
    // langsung push ke page /manga/search/[slug]
    router.push(`${basePath}/${encodeURIComponent(keyword)}`);
  };

  const clearSearch = () => {
    setInputValue('');
    searchRef.current.value = '';
    searchRef.current.focus();
  };

  return (
    <div className="relative w-full max-w-md my-8">
      <form onSubmit={handleSearch}>
        <motion.div className="relative">
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-theme-tertiary" />
          </div>

          {/* Input Field */}
          <input
            type="text"
            ref={searchRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder="Search manga title..."
            className={`w-full input-theme rounded-full py-3 pl-12 pr-12 transition-all duration-300 ${
              isFocused ? 'ring-2 ring-[var(--accent-from)] shadow-lg shadow-[var(--shadow-theme)]' : ''
            }`}
          />

          {/* Clear Button */}
          <AnimatePresence>
            {inputValue && (
              <motion.button
                type="button"
                onClick={clearSearch}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-theme-tertiary transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-theme-tertiary hover:text-theme-primary" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-theme-primary p-2 rounded-full transition-all shadow-lg"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}
