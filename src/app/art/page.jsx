'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

/* ===== Components ===== */
import Header from '@/app/components/Header'
import PaginationControls from '../components/Pagination'
import Navigation from '../components/Navigation'
import BreadcrumbNavigation from '../components/BreadcrumbNavigation'

/* ===== Icons ===== */
import {
  FiArrowLeft,
  FiSearch,
  FiFilter,
  FiShare2,
  FiDownload,
  FiExternalLink,
  FiX,
  FiChevronUp,
  FiChevronDown,
  FiLoader,
  FiHeart,
  FiGrid,
  FiList
} from 'react-icons/fi'

import {
  FaFire,
  FaStar,
  FaClock,
  FaRandom,
  FaHashtag,
  FaImage
} from 'react-icons/fa'

import { LuSparkles } from 'react-icons/lu'

export const dynamic = 'force-dynamic'

export default function FanartPage() {
  const router = useRouter()

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const [activeFilter, setActiveFilter] = useState('safe')
  const [activeSort, setActiveSort] = useState('score')

  const [favorites, setFavorites] = useState(new Set())
  const [selectedImage, setSelectedImage] = useState(null)

  const searchTimeoutRef = useRef(null)
  const autocompleteTimeoutRef = useRef(null)

  /* ================= Favorites ================= */
  useEffect(() => {
    const stored = localStorage.getItem('fanart_favorites')
    if (stored) setFavorites(new Set(JSON.parse(stored)))
  }, [])

  const toggleFavorite = (postId) => {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(postId) ? next.delete(postId) : next.add(postId)
      localStorage.setItem('fanart_favorites', JSON.stringify([...next]))
      return next
    })
  }

  /* ================= Autocomplete ================= */
  const fetchAutocomplete = useCallback(async (query) => {
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }

    setLoadingSuggestions(true)
    try {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.success) setSuggestions(data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSuggestions(false)
    }
  }, [])

  /* ================= Fetch Images ================= */
  const fetchImages = useCallback(
    async (pageNum, reset = false) => {
      reset ? setLoading(true) : setLoadingMore(true)

      try {
        const sortMap = {
          score: 'order:score',
          new: 'order:id',
          random: 'order:random'
        }

        let tags = sortMap[activeSort]
        if (searchQuery) tags = `${searchQuery} ${tags}`

        const params = new URLSearchParams({
          tags,
          rating: activeFilter,
          page: pageNum.toString(),
          limit: '20'
        })

        const res = await fetch(`/api/danbooru?${params}`)
        const data = await res.json()

        if (data.success) {
          setImages(prev => (reset ? data.data : [...prev, ...data.data]))
          setHasMore(data.hasMore)
          setPage(pageNum)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [searchQuery, activeFilter, activeSort]
  )

  useEffect(() => {
    fetchImages(1, true)
  }, [searchQuery, activeFilter, activeSort, fetchImages])

  /* ================= Search debounce ================= */
  useEffect(() => {
    clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput)
        router.push(searchInput ? `/art?tags=${searchInput}` : '/art')
      }
    }, 500)
  }, [searchInput, searchQuery, router])

  useEffect(() => {
    clearTimeout(autocompleteTimeoutRef.current)
    autocompleteTimeoutRef.current = setTimeout(() => {
      fetchAutocomplete(searchInput)
    }, 300)
  }, [searchInput, fetchAutocomplete])

  /* ================= Modal ================= */
  const ImageModal = ({ post }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelectedImage(null)}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
    >
      <Image
        src={`/api/image-proxy?url=${encodeURIComponent(post.file_url)}`}
        alt=""
        fill
        className="object-contain"
        unoptimized
      />
    </motion.div>
  )

  /* ================= Render ================= */
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />

      <div className="px-4 pt-4">
        <BreadcrumbNavigation />
      </div>

      <Navigation
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        activeSort={activeSort}
        setActiveSort={setActiveSort}
      />

      {loading && (
        <div className="flex justify-center items-center h-screen">
          <FiLoader className="animate-spin w-8 h-8" />
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {images.map(post => (
              <div
                key={post.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedImage(post)}
              >
                <Image
                  src={`/api/image-proxy?url=${encodeURIComponent(
                    post.preview_file_url
                  )}`}
                  alt=""
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

          <PaginationControls
            page={page}
            hasMore={hasMore}
            loading={loadingMore}
            onNext={() => fetchImages(page + 1)}
            onPrev={() => page > 1 && fetchImages(page - 1, true)}
          />
        </>
      )}

      <AnimatePresence>
        {selectedImage && <ImageModal post={selectedImage} />}
      </AnimatePresence>
    </main>
  )
}
