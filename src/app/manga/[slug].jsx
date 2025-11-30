'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { fetchChapters, fetchMangaDetail, getCoverImage, getLocalizedTitle } from '@/app/libs/mangadex'
import { fetchMangaCharacters } from '@/app/libs/anilist'
import Image from 'next/image'
import Link from 'next/link'
import { useFavorites } from '@/app/hooks/useFavorites'
import { Heart, Share2 } from 'lucide-react'
import ShareModal from '@/app/components/ShareModal'
import { motion, AnimatePresence } from 'framer-motion'

function LoadingSkeleton() {
  return (
    <main className="relative min-h-screen bg-gray-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-gray-950 to-gray-950" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-sky-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 px-3 sm:px-5 md:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        {/* Skeleton content here (omitted for brevity) */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:bottom-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 backdrop-blur-md rounded-full border border-sky-500/20">
            <div className="w-4 h-4 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
            <span className="text-xs sm:text-sm text-gray-400">Loading manga details...</span>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function MangaDetailPage() {
  const router = useRouter()
  const { slug } = router.query

  const [manga, setManga] = useState(null)
  const [chapters, setChapters] = useState([])
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [langFilter, setLangFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  const { isFavorite, toggleFavorite, loading: favLoading } = useFavorites({
    mediaId: manga?.id ? parseInt(manga.id, 36) : undefined,
    mediaType: 'manga',
  })

  useEffect(() => {
    if (!slug) return

    async function load() {
      try {
        setLoading(true)

        const id = Array.isArray(slug) ? slug[0] : slug || ''
        const detail = await fetchMangaDetail(id)
        if (!detail || !detail.id) throw new Error('Invalid manga detail')

        const chapterList = await fetchChapters(id)
        const sortedChapters = [...chapterList].sort((a, b) => {
          const numA = parseFloat(a.attributes.chapter || '0')
          const numB = parseFloat(b.attributes.chapter || '0')
          return numB - numA
        })

        setManga(detail)
        setChapters(sortedChapters)

        const title = getLocalizedTitle(detail.attributes?.title || {})
        const chars = await fetchMangaCharacters(title)
        setCharacters(chars || [])
      } catch (err) {
        console.error('[Detail Manga Error]', err)
        setError('Failed to load manga detail.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  const filteredChapters = chapters
    .filter(ch => {
      if (langFilter !== 'all' && ch.attributes.translatedLanguage !== langFilter) return false
      if (searchQuery) {
        const chNum = ch.attributes.chapter || ''
        const chTitle = ch.attributes.title || ''
        const query = searchQuery.toLowerCase()
        return chNum.includes(query) || chTitle.toLowerCase().includes(query)
      }
      return true
    })
    .sort((a, b) => {
      const numA = parseFloat(a.attributes.chapter || '0')
      const numB = parseFloat(b.attributes.chapter || '0')
      return sortOrder === 'asc' ? numA - numB : numB - numA
    })

  if (loading) return <LoadingSkeleton />

  if (error || !manga) {
    return (
      <main className="relative min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-gray-950 to-gray-950" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-900/80 rounded-2xl border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-400 text-sm sm:text-base mb-4">{error || 'Manga not found.'}</p>
          <Link href="/manga" className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 rounded-lg text-sky-400 text-sm transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Manga
          </Link>
        </motion.div>
      </main>
    )
  }

  const title = getLocalizedTitle(manga.attributes?.title || {})
  const description = manga.attributes?.description?.en || 'No description available.'
  const cover = manga.relationships.find(rel => rel.type === 'cover_art')
  const coverUrl = getCoverImage(manga.id, cover?.attributes?.fileName || '')
  const tags = manga.attributes.tags || []

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = title
  const shareThumbnail = coverUrl

  return (
    <main className="relative min-h-screen bg-gray-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-gray-950 to-gray-950" />
      <div className="absolute inset-0 -z-10 opacity-5">
        <Image src={coverUrl} alt="banner" fill className="object-cover blur-2xl" />
      </div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-sky-400/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Manga info, chapters, characters, share modal */}
        <ShareModal open={showShare} setOpen={setShowShare} url={shareUrl} title={shareTitle} thumbnail={shareThumbnail} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="max-w-6xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 pb-8">
          <Link href="/manga" className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 rounded-xl text-white text-sm sm:text-base font-semibold shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40 transition-all">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Manga
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
