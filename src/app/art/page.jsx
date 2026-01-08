import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Head from 'next/head'
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
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [showActions, setShowActions] = useState(null)
  const [imageLoaded, setImageLoaded] = useState({})
  const [viewMode, setViewMode] = useState('feed')
  const [favorites, setFavorites] = useState(new Set())
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const observerRef = useRef(null)
  const loadMoreObserverRef = useRef(null)
  const searchTimeoutRef = useRef(null)
  const autocompleteTimeoutRef = useRef(null)
  const containerRef = useRef(null)
  const loadMoreTriggerRef = useRef(null)

  const trendingTags = [
    'hatsune_miku',
    'genshin_impact',
    'original',
    'fate/grand_order',
    'blue_archive',
    'touhou',
    'vtuber',
    'arknights'
  ]

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

  const fetchImages = useCallback(async (pageNum, reset = false) => {
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
        limit: viewMode === 'grid' ? '30' : '20'
      })

      const res = await fetch(`/api/danbooru?${params}`)
      const data = await res.json()

      if (data.success) {
        setImages(prev => reset ? data.data : [...prev, ...data.data])
        setHasMore(data.hasMore)
        setPage(pageNum)
        if (reset) setCurrentIndex(0)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [searchQuery, activeFilter, activeSort, viewMode])

  useEffect(() => {
    fetchImages(1, true)
  }, [searchQuery, activeFilter, activeSort, viewMode])

  useEffect(() => {
    clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput)
        router.push(
          searchInput ? `/fanart?tags=${searchInput}` : '/fanart',
          undefined,
          { shallow: true }
        )
      }
    }, 500)
  }, [searchInput])

  useEffect(() => {
    clearTimeout(autocompleteTimeoutRef.current)
    autocompleteTimeoutRef.current = setTimeout(() => {
      fetchAutocomplete(searchInput)
    }, 300)
  }, [searchInput, fetchAutocomplete])

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

  return (
    <>
      <Head>
        <title>Fanart Gallery - Aichiow</title>
      </Head>

      <main className="min-h-screen bg-black text-white">
        {loading && (
          <div className="flex justify-center items-center h-screen">
            <FiLoader className="animate-spin w-8 h-8" />
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {images.map(post => (
              <div
                key={post.id}
                className="relative group cursor-pointer"
                onClick={() => setSelectedImage(post)}
              >
                <Image
                  src={`/api/image-proxy?url=${encodeURIComponent(post.preview_file_url)}`}
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
        )}

        <AnimatePresence>
          {selectedImage && <ImageModal post={selectedImage} />}
        </AnimatePresence>
      </main>
    </>
  )
}
