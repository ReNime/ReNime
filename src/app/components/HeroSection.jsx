"use client"
import React, { useEffect, useState } from 'react'
import SearchInput from './SearchInput'
import Link from 'next/link'
import Image from 'next/image'

const HeroSection = () => {
  const [currentTheme, setCurrentTheme] = useState('dark')

  useEffect(() => {
    // Check initial theme
    const theme = document.documentElement.getAttribute('data-theme') || 'dark'
    setCurrentTheme(theme)

    // Create observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme') || 'dark'
          setCurrentTheme(newTheme)
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    return () => observer.disconnect()
  }, [])

  // Define images for each theme
  const heroImages = {
    dark: '/images/20251129_055905.jpg', // Your dark theme image
    light: '/images/20251208_002307.jpg' // Your light theme image (you need to add this)
  }

  return (
    <div className="flex items-center justify-center bg-theme-primary p-4">
      <div className="w-full max-w-5xl bg-theme-secondary lg:h-[500px] rounded-2xl overflow-hidden 
        grid grid-cols-1 lg:grid-cols-2 
        shadow-2xl border border-theme">
        
        {/* Text Content (lg:order-1) */}
        <div className="p-6 lg:p-12 flex flex-col justify-center relative 
          bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)]
          order-2 lg:order-1">
          
          <h1 className="text-2xl lg:text-4xl font-bold text-theme-primary mb-3 lg:mb-4 relative z-20 gradient-theme-text">
            ReNime
          </h1>
          
          <p className="text-theme-secondary mb-4 lg:mb-6 text-sm lg:text-base relative z-20">
            ReNime adalah situs anime gratis tanpa iklan untuk menonton anime gratis
          </p>
          
          <SearchInput />
          
          <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4 relative z-20 mt-4">
            <Link
              href="/animelist"
              className="btn-theme-primary px-6 py-2 lg:py-3 rounded-full flex items-center justify-center font-semibold hover:scale-105 transition-transform"
            >
              Anime A - Z
            </Link>
          </div>
        </div>

        {/* Image (lg:order-2) - Changes based on theme */}
<div className="relative h-[300px] lg:h-auto order-1 lg:order-2 flex items-center justify-center">
  
  {/* Optional gradient overlay */}
  <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[var(--bg-secondary)] to-transparent z-10"></div>

  {/* Centered Circular Image */}
  <div className="relative z-20 w-48 h-48 lg:w-72 lg:h-72 rounded-full overflow-hidden transition-all duration-500">
    <Image
      src={heroImages[currentTheme]}
      alt="Anime Character"
      fill
      className="object-cover"
      priority
      key={currentTheme}
    />
  </div>

</div>

        {/* Image (lg:order-2) - Changes based on theme */}
        {/*<div className="relative h-[300px] lg:h-auto order-1 lg:order-2">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[var(--bg-secondary)] to-transparent z-10"></div>
          */}
          {/* Image with smooth transition */}
        {/*<div className="absolute inset-0 w-full h-full transition-opacity duration-500">
            <Image
              width={500}
              height={500}
              src={heroImages[currentTheme]}
              alt="Anime Character"
              className="w-full h-full object-cover"
              priority={true}
              key={currentTheme} // Force re-render on theme change
            />
          </div>
        </div>*/}
      </div>
    </div>
  )
}

export default HeroSection
