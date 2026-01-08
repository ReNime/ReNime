'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import AgeGate from '@/app/components/AgeGate'

import {
  FiSearch,
  FiX,
  FiLoader,
  FiHeart
} from 'react-icons/fi'

import { LuSparkles } from 'react-icons/lu'

export const dynamic = 'force-dynamic'

export default function FanartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const [favorites, setFavorites] = useState(new Set())
  const [selectedImage, setSelectedImage] = useState(null)

  const loadMoreTriggerRef = useRef(null)

  const trendingTags = [
    'hatsune_miku',
    'genshin_impact',
    'wuthering_waves',
    'original',
    'fate/grand_order',
    'blue_archive',
    'touhou',
    'vtuber',
    'arknights'
  ]

  /* ================= Favorites ================= */
  useEffect(() => {
    const stored = localStorage.getItem('fanart_favorites')
    if (stored) setFavorites(new Set(JSON.parse(stored)))
  }, [])

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem('fanart_favorites', JSON.stringify([...next]))
      return next
    })
  }

  /* ================= Debounced Search ================= */
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput)
        if (searchInput) {
          router.replace(`/art?tags=${searchInput}`)
        } else {
          router.replace('/art')
        }
      }
    }, 500)

    return () => clearTimeout(t)
  }, [searchInput])

  /* ================= Fetch Pixiv Images ================= */
  const fetchImages = useCallback(async (pageNum, reset = false) => {
    reset ? setLoading(true) : setLoadingMore(true)

    try {
      const params = new URLSearchParams({
        q: searchQuery || 'anime',
        page: pageNum.toString()
      })

      const res = await fetch(
  `/api/pixiv?q=${encodeURIComponent(searchQuery || 'original')}&page=${pageNum}`
)
      const data = await res.json()

      if (data.success) {
        setImages(prev =>
          reset ? data.data : [...prev, ...data.data]
        )
        setHasMore(data.hasMore)
        setPage(pageNum)
      }
    } catch (e) {
      console.error('Pixiv fetch error:', e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [searchQuery])

  /* ================= Initial Load ================= */
  useEffect(() => {
    const tags = searchParams.get('tags')
    if (tags) {
      setSearchQuery(tags)
      setSearchInput(tags)
    }
    fetchImages(1, true)
  }, [])

  /* ================= Refetch on Search ================= */
  useEffect(() => {
    fetchImages(1, true)
  }, [searchQuery])

  /* ================= Infinite Scroll ================= */
  useEffect(() => {
    if (!loadMoreTriggerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchImages(page + 1)
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(loadMoreTriggerRef.current)
    return () => observer.disconnect()
  }, [page, hasMore, loadingMore, loading, fetchImages])

  /* ================= Render ================= */
  return (
    <main className="min-h-screen bg-black text-white pt-28 px-4">
      <AgeGate />

      {/* SEARCH + TRENDING */}
      <div className="max-w-5xl mx-auto mb-6 space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search on Pixiv (e.g. miku, genshin)"
            className="w-full pl-10 pr-10 py-3 bg-zinc-900 border border-white/10 rounded-xl outline-none focus:border-white/30"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('')
                setSearchQuery('')
                router.replace('/art')
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <FiX />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {trendingTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSearchInput(tag)
                setSearchQuery(tag)
                router.replace(`/art?tags=${tag}`)
              }}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap flex items-center gap-2 transition
                ${
                  searchQuery === tag
                    ? 'bg-white/20'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
            >
              <LuSparkles className="w-3 h-3" />
              {tag.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-[60vh]">
          <FiLoader className="animate-spin w-8 h-8" />
        </div>
      )}

      {!loading && images.length === 0 && (
        <div className="text-center text-gray-400">
          No results found
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(post => (
            <div
              key={post.id}
              className="relative group cursor-pointer aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-900"
              onClick={() => setSelectedImage(post)}
            >
              <Image
                src={`/api/image-proxy?url=${encodeURIComponent(post.preview_url)}`}
                alt={post.title || ''}
                fill
                className="object-cover rounded-xl"
                unoptimized
              />

              <button
                onClick={e => {
                  e.stopPropagation()
                  toggleFavorite(post.id)
                }}
                className="absolute top-2 right-2"
              >
                <FiHeart
                  className={
                    favorites.has(post.id)
                      ? 'text-red-500 fill-red-500'
                      : 'text-white'
                  }
                />
              </button>
            </div>
          ))}
        </div>
      )}

      <div ref={loadMoreTriggerRef} className="h-24 flex justify-center items-center">
        {loadingMore && <FiLoader className="animate-spin" />}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          >
            <Image
              src={`/api/image-proxy?url=${encodeURIComponent(selectedImage.original_url)}`}
              alt={selectedImage.title || ''}
              fill
              className="object-contain"
              unoptimized
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
