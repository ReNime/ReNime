'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function MangaSearchInput({ basePath = '/manga/search' }) {
  const router = useRouter();
  const searchRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const keyword = searchRef.current.value.trim();

    if (!keyword) {
      alert("Please type something to search");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      // fetch ke API internal
      const res = await fetch(`/api/manga/search?q=${encodeURIComponent(keyword)}`);
      const data = await res.json();

      if (data.status && Array.isArray(data.data)) {
        setResults(data.data);
      } else {
        setResults([]);
      }

      // langsung redirect ke page search
      router.push(`${basePath}/${encodeURIComponent(keyword)}`);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setInputValue('');
    searchRef.current.value = '';
    setResults([]);
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
            className={`w-full input-theme rounded-full py-3 pl-12 pr-24 transition-all duration-300 ${
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
                className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-theme-tertiary transition-colors"
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

      {/* Search Suggestions / Dropdown */}
      <AnimatePresence>
        {isFocused && (results.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-theme-secondary border border-theme rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-2">
              {loading && <p className="text-theme-tertiary text-sm px-3 py-2 animate-pulse">Loading...</p>}
              {!loading && results.length === 0 && <p className="text-theme-tertiary text-sm px-3 py-2">No results found</p>}
              {!loading &&
                results.map((item) => (
                  <motion.div
                    key={item.slug}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push(`${basePath}/${item.slug}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-theme-tertiary/20 transition-all"
                  >
                    <div className="w-12 h-16 relative flex-shrink-0">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                      {item.altTitle && <p className="text-xs text-theme-tertiary truncate">{item.altTitle}</p>}
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
