"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

/**
 * Komponen untuk tombol navigasi "Next" dan "Previous"
 * @param {object} props
 * @param {number} props.currentPage - Halaman saat ini
 * @param {boolean} props.hasNextPage - Apakah ada halaman selanjutnya
 */
const PaginationControls = ({ currentPage, hasNextPage }) => {
  const pathname = usePathname(); 
  
  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;
  
  const baseStyle = "px-6 py-2.5 rounded-full font-semibold transition-all duration-300 border border-theme";
  
  return (
    <div className="flex justify-center items-center gap-6 my-12">
      {/* Previous Button */}
      <Link
        href={`${pathname}?page=${prevPage}`}
        className={`
          ${baseStyle} 
          ${currentPage <= 1 
            ? 'bg-theme-tertiary text-theme-tertiary cursor-not-allowed opacity-50' 
            : 'text-theme-primary hover:scale-105 hover:shadow-lg'
          }
        `}
        style={currentPage > 1 ? {
          background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))',
          boxShadow: '0 0 20px var(--shadow-theme)'
        } : {}}
        aria-disabled={currentPage <= 1}
        tabIndex={currentPage <= 1 ? -1 : undefined}
        onClick={(e) => { if (currentPage <= 1) e.preventDefault(); }}
      >
        « Previous
      </Link>

      {/* Current Page Display */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg text-theme-primary">
          Halaman
        </span>
        <span 
          className="font-bold text-xl px-3 py-1 rounded-lg text-theme-primary"
          style={{
            background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))',
            boxShadow: '0 0 15px var(--shadow-theme)'
          }}
        >
          {currentPage}
        </span>
      </div>

      {/* Next Button */}
      <Link
        href={`${pathname}?page=${nextPage}`}
        className={`
          ${baseStyle} 
          ${!hasNextPage 
            ? 'bg-theme-tertiary text-theme-tertiary cursor-not-allowed opacity-50' 
            : 'text-theme-primary hover:scale-105 hover:shadow-lg'
          }
        `}
        style={hasNextPage ? {
          background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))',
          boxShadow: '0 0 20px var(--shadow-theme)'
        } : {}}
        aria-disabled={!hasNextPage}
        tabIndex={!hasNextPage ? -1 : undefined}
        onClick={(e) => { if (!hasNextPage) e.preventDefault(); }}
      >
        Next »
      </Link>
    </div>
  );
}

export default PaginationControls;
