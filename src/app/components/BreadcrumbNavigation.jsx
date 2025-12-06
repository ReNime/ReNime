"use client"
import Link from 'next/link';
import { HomeIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import React from 'react';

/**
 * Responsive Breadcrumb Component
 * @param {object} props
 * @param {Array<{title: string, href: string}>} props.crumbs - Array of breadcrumb objects
 */
const BreadcrumbNavigation = ({ crumbs = [] }) => {
  return (
    <nav 
      className="flex items-center text-sm sm:text-base text-theme-tertiary mb-4 sm:mb-6" 
      aria-label="Breadcrumb"
    >
      <ol className="inline-flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 flex-wrap">
        
        {/* Home Link */}
        <li className="inline-flex items-center">
          <Link 
            href="/" 
            className="inline-flex items-center link-theme transition-all duration-200 group"
          >
            <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 transition-transform duration-200 group-hover:scale-110" />
            <span className="text-sm sm:text-base font-medium">Home</span>
          </Link>
        </li>

        {/* Dynamic Breadcrumb Items */}
        {crumbs.map((crumb, index) => {
          const isLastItem = index === crumbs.length - 1;
          
          return (
            <li key={index}>
              <div className="flex items-center">
                <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-theme-tertiary opacity-50" />
                
                {!isLastItem ? (
                  <Link
                    href={crumb.href}
                    className="ml-1.5 sm:ml-2 text-sm sm:text-base link-theme transition-colors duration-200"
                  >
                    {crumb.title}
                  </Link>
                ) : (
                  <span className="ml-1.5 sm:ml-2 text-sm sm:text-base font-semibold text-theme-primary">
                    {crumb.title}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default BreadcrumbNavigation;
