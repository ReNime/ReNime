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

export default function MangaDetailPage() {
  const { slug } = useParams()

  const [manga, setManga] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const { isFavorite, toggleFavorite, loading: favLoading } =
    useFavorites({
      mediaId: slug,
      mediaType: 'manga'
    })

  useEffect(() => {
  if (!slug) return;

  async function load() {
    try {
      setLoading(true);
      const res = await fetch(`https://komiku-alpha.vercel.app/detail-komik/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch detail');
      const data = await res.json();
      setManga(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load manga detail.');
    } finally {
      setLoading(false);
    }
  }

  load();
}, [slug]);


  if (loading) return <LoadingSkeleton />

  if (error || !manga) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {error || 'Manga not found'}
          </p>
          <Link href="/manga" className="text-sky-400 underline">
            Back to Manga
          </Link>
        </div>
      </main>
    )
  }

  const shareUrl =
    typeof window !== 'undefined' ? window.location.href : ''

  return (
    <main className="relative min-h-screen bg-gray-950 text-white">
      {/* Background blur */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src={manga.thumbnail}
          alt={manga.title}
          fill
          className="object-cover"
        />
      </div>

      <section className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-48 aspect-[3/4]">
            <Image
              src={manga.thumbnail}
              alt={manga.title}
              fill
              className="rounded-xl object-cover"
            />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {manga.title}
            </h1>

            {manga.alternativeTitle && (
              <p className="text-sm text-gray-400 mb-3">
                {manga.alternativeTitle}
              </p>
            )}

            {/* GENRES */}
            <div className="flex flex-wrap gap-2 mb-4">
              {manga.genres.map((g) => (
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
              {manga.description}
            </p>

            {manga.description?.length > 200 && (
              <button
                onClick={() => setShowFullDesc(v => !v)}
                className="text-sky-400 text-sm mt-2"
              >
                {showFullDesc ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>

        {/* CHAPTER LIST */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">
            Chapters ({manga.chapters.length})
          </h2>

          <AnimatePresence>
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2"
            >
              {manga.chapters.map((ch) => {
                const chapterSlug = ch.apiLink.replace(
                  '/baca-chapter/',
                  ''
                )

                return (
                  <li key={ch.chapterNumber}>
                    <Link
                      href={`/manga/read/${chapterSlug}`}
                      className="block p-3 rounded-xl bg-gray-900 hover:bg-gray-800"
                    >
                      <span className="text-sky-400 text-sm font-semibold">
                        Ch. {ch.chapterNumber}
                      </span>
                      <p className="text-sm text-gray-300 truncate">
                        {ch.title}
                      </p>
                    </Link>
                  </li>
                )
              })}
            </motion.ul>
          </AnimatePresence>
        </section>
      </section>

      <ShareModal
        open={showShare}
        setOpen={setShowShare}
        url={shareUrl}
        title={manga.title}
        thumbnail={manga.thumbnail}
      />
    </main>
  )
}
