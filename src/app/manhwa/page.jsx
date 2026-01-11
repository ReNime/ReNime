'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaFire, FaSearch, FaTags } from 'react-icons/fa'

import ManhwaNavbar from '@/app/components/ManhwaNavbar'
import ManhwaGrid from '@/app/components/ManhwaGrid'

export default function ManhwaPage() {
  const [manhwaList, setManhwaList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadManhwa() {
      try {
        const res = await fetch('/api/manhwa')
        const json = await res.json()
        setManhwaList(json.data || [])
      } catch (err) {
        console.error('[Manhwa Page]', err)
        setManhwaList([])
      } finally {
        setLoading(false)
      }
    }

    loadManhwa()
  }, [])

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <ManhwaNavbar />

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <h1 className="text-4xl font-black text-white">
            Manhwa
          </h1>

          <div className="flex gap-3">
            <Link
              href="/manhwa/search"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition"
            >
              <FaSearch />
              Search
            </Link>

            <Link
              href="/manhwa/genres"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 transition"
            >
              <FaTags />
              Genres
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-zinc-400">Loading manhwa...</p>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <FaFire className="text-orange-500 text-2xl" />
              <h2 className="text-3xl font-black text-white">
                Rekomendasi Manhwa
              </h2>
            </div>

            <ManhwaGrid manhwaList={manhwaList} />
          </>
        )}
      </div>
    </main>
  )
}
