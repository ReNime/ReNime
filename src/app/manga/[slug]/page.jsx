'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  fetchChapters,
  fetchMangaDetail,
  getCoverImage,
  getLocalizedTitle
} from '@/app/libs/mangadex'
import { fetchMangaCharacters } from '@/app/libs/anilist'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/app/hooks/useFavorites'
import { FaHeart, FaShareAlt } from 'react-icons/fa'
import ShareModal from '@/app/components/ShareModal'
import { motion, AnimatePresence } from 'framer-motion'

function LoadingSkeleton() {
  return (
    <main className="relative min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </main>
  )
}

export default function MangaDetailPage() {
  const params = useParams()
  const slug = params?.slug

  const [manga, setManga] = useState(null)
  const [chapters, setChapters] = useState([])
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const { isFavorite, toggleFavorite, loading: favLoading } = useFavorites({
  mediaId: manga?.id,
  mediaType: 'manga'
})

  useEffect(() => {
    if (!slug) return

    async function load() {
      try {
        setLoading(true)
        const id = Array.isArray(slug) ? slug[0] : slug

        const detail = await fetchMangaDetail(id)
        if (!detail?.id) throw new Error('Invalid manga')

        const chapterList = await fetchChapters(id)
        const sorted = [...chapterList].sort((a, b) => {
          const A = parseFloat(a.attributes.chapter || '0')
          const B = parseFloat(b.attributes.chapter || '0')
          return B - A
        })

        setManga(detail)
        setChapters(sorted)

        const title = getLocalizedTitle(detail.attributes?.title || {})
        let chars = []
try {
  const title = getLocalizedTitle(detail.attributes?.title || {})
  chars = await fetchMangaCharacters(title)
} catch (e) {
  console.warn('AniList characters not found')
}

setCharacters(chars || [])
      } catch (err) {
        console.error(err)
        setError('Failed to load manga detail.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  if (loading) return <LoadingSkeleton />

  if (error || !manga) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Manga not found'}</p>
          <Link href="/manga" className="text-sky-400 underline">
            Back to Manga
          </Link>
        </div>
      </main>
    )
  }

  const title = getLocalizedTitle(manga.attributes?.title || {})
  const description = manga.attributes?.description?.en || 'No description.'
  const coverRel = manga.relationships?.find(
  r => r.type === 'cover_art' && r.attributes?.fileName
)

const coverUrl = coverRel
  ? getCoverImage(manga.id, coverRel.attributes.fileName)
  : null
  const tags = manga.attributes.tags || []

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <main className="relative min-h-screen bg-gray-950 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        {coverUrl && (
  <Image
    src={coverUrl}
    alt="bg"
    fill
    className="object-cover blur-2xl"
    priority
  />
)}
      </div>

      <section className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-48 aspect-[3/4]">
            <Image src={coverUrl} alt={title} fill className="rounded-xl object-cover" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{title}</h1>

            <div className="flex flex-wrap gap-2 mb-3">
              {tags.slice(0, 6).map(tag => (
                <span
                  key={tag.id}
                  className="text-xs bg-sky-500/10 text-sky-300 px-2 py-1 rounded-full"
                >
                  {tag.attributes.name.en}
                </span>
              ))}
            </div>

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
                <FaHeart className={isFavorite ? 'text-red-400' : ''} />
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

            <p className={`text-sm text-gray-400 ${!showFullDesc && 'line-clamp-4'}`}>
              {description}
            </p>

            {description.length > 200 && (
              <button
                onClick={() => setShowFullDesc(v => !v)}
                className="text-sky-400 text-sm mt-2"
              >
                {showFullDesc ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>

        {/* Chapters */}
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-4">Chapters ({chapters.length})</h2>

          <AnimatePresence>
            {chapters.length > 0 ? (
              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {chapters.map(ch => (
                  <li key={ch.id}>
                    <Link
                      href={`/read/${ch.id}`}
                      className="block p-3 rounded-xl bg-gray-900 hover:bg-gray-800"
                    >
                      <span className="text-sky-400 text-sm font-semibold">
                        Ch. {ch.attributes.chapter || '?'}
                      </span>
                      <p className="text-sm text-gray-300 truncate">
                        {ch.attributes.title || 'Untitled'}
                      </p>
                    </Link>
                  </li>
                ))}
              </motion.ul>
            ) : (
              <p className="text-gray-500">No chapters found</p>
            )}
          </AnimatePresence>
        </section>

        {characters.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Characters</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {characters.map((char, i) => (
                <div key={i} className="text-center">
                  <img
                    src={char.node.image?.large}
                    alt={char.node.name.full}
                    className="w-14 h-14 mx-auto rounded-full object-cover"
                  />
                  <p className="text-xs mt-1 text-gray-300 line-clamp-2">
                    {char.node.name.full}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>

      <ShareModal
        open={showShare}
        setOpen={setShowShare}
        url={shareUrl}
        title={title}
        thumbnail={coverUrl}
      />
    </main>
  )
}
