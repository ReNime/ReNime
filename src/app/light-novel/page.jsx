'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaFire, FaSearch, FaTags } from 'react-icons/fa'

import LightNovelNavbar from '@/app/components/LightNovelNavbar'
import LightNovelGrid from '@/app/components/LightNovelGrid'

export default function LightNovelPage() {
  const [lnList, setLnList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLightNovels() {
      try {
        const res = await fetch('/api/lightnovel', { cache: 'no-store' })
        const json = await res.json()
        setLnList(json.data || [])
      } catch (err) {
        console.error('[Light Novel Page]', err)
        setLnList([])
      } finally {
        setLoading(false)
      }
    }

    loadLightNovels()
  }, [])

  return (
    <main className="relative min-h-screen bg-theme-primary overflow-hidden">
      <LightNovelNavbar />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <h1 className="text-4xl font-black text-theme-primary">
            Light Novels
          </h1>

          <div className="flex gap-3">
            <Link
              href="/lightnovel/search"
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                bg-theme-secondary border border-theme
                text-theme-primary
                hover:bg-theme-tertiary transition"
            >
              <FaSearch />
              Search
            </Link>

            <Link
              href="/lightnovel/genres"
              className="flex items-center gap-2 px-4 py-2 rounded-xl
                bg-theme-secondary border border-theme
                text-theme-primary
                hover:bg-theme-tertiary transition"
            >
              <FaTags />
              Genres
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-theme-tertiary">
            Loading light novels...
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <FaFire className="text-[color:var(--accent-from)] text-2xl" />
              <h2 className="text-3xl font-black text-theme-primary">
                Rekomendasi Light Novels
              </h2>
            </div>

            <LightNovelGrid list={lnList} />
          </>
        )}
      </div>
    </main>
  )
}
