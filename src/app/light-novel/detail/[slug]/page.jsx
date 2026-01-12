'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FaHeart, FaShareAlt } from 'react-icons/fa'
import ShareModal from '@/app/components/ShareModal'
import { useFavorites } from '@/app/hooks/useFavorites'
import { motion, AnimatePresence } from 'framer-motion'

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </main>
  )
}

export default function LightNovelDetailPage() {
  const { slug } = useParams()
  const [ln, setLn] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const { isFavorite, toggleFavorite, loading: favLoading } =
    useFavorites({
      mediaId: slug,
      mediaType: 'light-novel'
    })

  useEffect(() => {
    if (!slug) return

    async function load() {
      try {
        setLoading(true)
        // Fetch detail dari Next.js API / RanobeDB
        const res = await fetch(`/api/lightnovel/details?slug=${encodeURIComponent(slug)}`)
        if (!res.ok) throw new Error('Failed to fetch detail')

        const json = await res.json()
        const book = json.book

        // Mapping sesuai sample RanobeDB
        const mappedLN = {
          id: book.id,
          title: book.title,
          romaji: book.romaji || book.romaji_orig || book.title_orig,
          description: book.description || book.description_ja || 'No description available.',
          cover: book.image ? `https://cdn.ranobedb.org/images/${book.image.filename}` : null,
          lang: book.lang,
          release_date: book.c_release_date,
          publishers: book.publishers?.map(p => p.name) || [],
          series: book.series?.books || [],
          tags: book.series?.tags || []
        }

        setLn(mappedLN)
      } catch (err) {
        console.error(err)
        setError('Failed to load light novel detail.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  if (loading) return <LoadingSkeleton />

  if (error || !ln) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Light novel not found'}</p>
          <Link href="/light-novel" className="text-sky-400 underline">
            Back to Light Novels
          </Link>
        </div>
      </main>
    )
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <main className="relative min-h-screen bg-gray-950 text-white">
      {/* Background blur */}
      <div className="absolute inset-0 opacity-5">
        <Image src={ln.cover} alt={ln.title} fill className="object-cover" />
      </div>

      <section className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-48 aspect-[3/4]">
            <Image src={ln.cover} alt={ln.title} fill className="rounded-xl object-cover" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{ln.title}</h1>

            {ln.romaji && (
              <p className="text-sm text-gray-400 mb-3">{ln.romaji}</p>
            )}

            {/* TAGS / GENRES */}
            <div className="flex flex-wrap gap-2 mb-4">
              {ln.tags?.map((g) => (
                <span
                  key={g}
                  className="text-xs bg-sky-500/10 text-sky-300 px-2 py-1 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  isFavorite
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-800 text-gray-300'
                }`}
              >
                <FaHeart />
                Favorite
              </button>

              <button
                onClick={() => setShowShare(true)}
                className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 flex items-center gap-2"
              >
                <FaShareAlt />
                Share
              </button>
            </div>

            {/* DESCRIPTION */}
            <p
              className={`text-sm text-gray-400 ${
                !showFullDesc && 'line-clamp-4'
              }`}
            >
              {ln.description}
            </p>

            {ln.description?.length > 200 && (
              <button
                onClick={() => setShowFullDesc((v) => !v)}
                className="text-sky-400 text-sm mt-2"
              >
                {showFullDesc ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>

        {/* DETAIL INFO */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Details</h2>
          <ul className="text-gray-300 text-sm flex flex-col gap-1">
            {ln.lang && (
              <li>
                <span className="font-semibold">Language:</span> {ln.lang.toUpperCase()}
              </li>
            )}
            {ln.release_date && (
              <li>
                <span className="font-semibold">Release Date:</span>{' '}
                {ln.release_date.toString().replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}
              </li>
            )}
            {ln.publishers.length > 0 && (
              <li>
                <span className="font-semibold">Publisher:</span> {ln.publishers.join(', ')}
              </li>
            )}
          </ul>
        </section>

        {/* SERIES / VOLUMES */}
        {ln.series.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Series / Volumes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {ln.series.map((vol) => (
                <Link
                  key={vol.id}
                  href={`/light-novel/detail/${vol.id}`}
                  className="group block transition-transform duration-300 hover:scale-105"
                >
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800">
                    <Image
                      src={vol.image ? `https://cdn.ranobedb.org/images/${vol.image.filename}` : '/default-cover.jpg'}
                      alt={vol.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-center text-white truncate">
                    {vol.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>

      <ShareModal
        open={showShare}
        setOpen={setShowShare}
        url={shareUrl}
        title={ln.title}
        thumbnail={ln.cover}
      />
    </main>
  )
}
