'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FaHeart, FaShareAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'
import ShareModal from '@/app/components/ShareModal'
import { useFavorites } from '@/app/hooks/useFavorites'

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </main>
  )
}

export default function ManhwaDetailPage() {
  const { slug } = useParams()

  const [manhwa, setManhwa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showShare, setShowShare] = useState(false)

  const { isFavorite, toggleFavorite } = useFavorites({
    mediaId: slug,
    mediaType: 'manhwa'
  })

  useEffect(() => {
    if (!slug) return

    async function load() {
      try {
        setLoading(true)

        const res = await fetch(
          `https://weebs.caliph.dev/api/komiku/${slug}`,
          { cache: 'no-store' }
        )

        if (!res.ok) throw new Error('Fetch failed')

        const json = await res.json()
        setManhwa(json.data)
      } catch (err) {
        console.error(err)
        setError('Failed to load manhwa detail.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  if (loading) return <LoadingSkeleton />

  if (error || !manhwa) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-red-400">{error || 'Manhwa not found'}</p>
      </main>
    )
  }

  const shareUrl =
    typeof window !== 'undefined' ? window.location.href : ''

  return (
    <main className="relative min-h-screen bg-gray-950 text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src={manhwa.thumbnail}
          alt={manhwa.title}
          fill
          className="object-cover"
        />
      </div>

      <section className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-48 aspect-[3/4] shrink-0">
            <Image
              src={manhwa.thumbnail}
              alt={manhwa.title}
              fill
              className="rounded-xl object-cover"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">
              {manhwa.title}
            </h1>

            {manhwa.alt_title && (
              <p className="text-sm text-gray-400 mb-2">
                {manhwa.alt_title}
              </p>
            )}

            {/* META */}
            <div className="text-sm text-gray-400 mb-4 space-y-1">
              <p>Author: {manhwa.author}</p>
              <p>Status: {manhwa.status}</p>
              <p>Rating: {manhwa.age_rating}</p>
            </div>

            {/* GENRE */}
            <div className="flex flex-wrap gap-2 mb-4">
              {manhwa.genre.map((g) => (
                <span
                  key={g}
                  className="text-xs bg-sky-500/10 text-sky-300 px-2 py-1 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* ACTION */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={toggleFavorite}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  isFavorite
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-800 text-gray-300'
                }`}
              >
                <FaHeart /> Favorite
              </button>

              <button
                onClick={() => setShowShare(true)}
                className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 flex items-center gap-2"
              >
                <FaShareAlt /> Share
              </button>
            </div>

            {/* DESCRIPTION */}
            <p className="text-sm text-gray-400 whitespace-pre-line">
              {manhwa.description}
            </p>
          </div>
        </div>

        {/* CHAPTER LIST */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">
            Chapters ({manhwa.chapters.length})
          </h2>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {manhwa.chapters.map((ch) => {
              const chapterSlug = ch.detail_url.split('/').pop()

              return (
                <li key={chapterSlug}>
                  <Link
                    href={`/manhwa/read/${chapterSlug}`}
                    className="block p-3 rounded-xl bg-gray-900 hover:bg-gray-800"
                  >
                    <span className="text-sky-400 text-sm font-semibold">
                      Chapter {ch.chapter}
                    </span>
                    <p className="text-sm text-gray-300">
                      {ch.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ch.release} · {ch.views} views
                    </p>
                  </Link>
                </li>
              )
            })}
          </motion.ul>
        </section>
      </section>

      <ShareModal
        open={showShare}
        setOpen={setShowShare}
        url={shareUrl}
        title={manhwa.title}
        thumbnail={manhwa.thumbnail}
      />
    </main>
  )
}
