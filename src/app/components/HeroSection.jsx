"use client"

import React, { useEffect, useState } from "react"
import SearchInput from "./SearchInput"
import Link from "next/link"
import Image from "next/image"

const HeroSection = () => {
  const [currentTheme, setCurrentTheme] = useState("dark")

  useEffect(() => {
    const theme =
      document.documentElement.getAttribute("data-theme") || "dark"
    setCurrentTheme(theme)

    const observer = new MutationObserver(() => {
      const newTheme =
        document.documentElement.getAttribute("data-theme") || "dark"
      setCurrentTheme(newTheme)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })

    return () => observer.disconnect()
  }, [])

  const heroImages = {
    dark: "/images/20251129_055905.jpg",
    light: "/images/20251208_002307.jpg",
  }

  return (
    <div className="flex items-center justify-center bg-theme-primary p-4">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl bg-theme-secondary shadow-2xl lg:grid-cols-2 lg:h-[500px]">

        {/* TEXT */}
        <div className="order-2 flex flex-col justify-center p-6 lg:order-1 lg:p-12">
          <h1 className="mb-3 text-2xl font-bold gradient-theme-text lg:mb-4 lg:text-4xl">
            ReNime
          </h1>

          <p className="mb-4 text-sm text-theme-secondary lg:mb-6 lg:text-base">
            ReNime adalah situs anime gratis tanpa iklan untuk menonton anime gratis
          </p>

          <SearchInput />

          <div className="mt-4 flex flex-col space-y-3 lg:flex-row lg:space-x-4 lg:space-y-0">
            <Link
              href="/animelist"
              className="btn-theme-primary flex items-center justify-center rounded-full px-6 py-2 font-semibold transition-transform hover:scale-105 lg:py-3"
            >
              Anime A - Z
            </Link>
          </div>
        </div>

        {/* IMAGE */}
        <div className="order-1 flex items-center justify-center lg:order-2">
          <div className="h-48 w-48 overflow-hidden rounded-full lg:h-72 lg:w-72">
            <Image
              src={heroImages[currentTheme]}
              alt="Anime Character"
              width={288}
              height={288}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>

      </div>
    </div>
  )
}

export default HeroSection
