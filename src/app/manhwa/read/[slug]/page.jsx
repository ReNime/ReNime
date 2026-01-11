'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import {
  MdArrowBack,
  MdFullscreen,
  MdFullscreenExit,
  MdArrowUpward,
  MdBlurOn,
  MdBlurOff,
} from 'react-icons/md'
import { motion } from 'framer-motion'

export default function ManhwaReadPage() {
  const router = useRouter()
  const { slug } = useParams()

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('scroll')
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [blurredPages, setBlurredPages] = useState(new Set())

  const [prevSlug, setPrevSlug] = useState(null)
  const [nextSlug, setNextSlug] = useState(null)

  /* ================= LOAD CHAPTER ================= */
  useEffect(() => {
    if (!slug) return

    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `https://weebs.caliph.dev/api/komiku/chapter/${slug}`
        )

        if (!res.ok) throw new Error('Failed to fetch chapter')

        const json = await res.json()
        const data = json.data

        setImages(data.images || [])
        setPrevSlug(data.prev_slug)
        setNextSlug(data.next_slug)
        setCurrentPage(0)
      } catch (err) {
        console.error(err)
        setError('Failed to load chapter')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [slug])

  /* ================= BLUR ================= */
  const toggleBlur = (i) => {
    setBlurredPages((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  /* ================= NAVIGATION ================= */
  const goChapter = (target) => {
    if (!target) return
    router.push(`/manhwa/read/${target}`)
    window.scrollTo({ top: 0 })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-400">
        {error}
      </div>
    )
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 flex justify-between items-center bg-neutral-900/80 backdrop-blur px-4 py-3 border-b border-neutral-800">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sky-400"
        >
          <MdArrowBack /> Back
        </button>

        <div className="flex gap-2">
          {['scroll', 'swipe'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-xs rounded ${
                mode === m ? 'bg-sky-500' : 'bg-neutral-800'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        {/* SCROLL MODE */}
        {mode === 'scroll' && (
          <div className="space-y-0">
            {images.map((src, i) => (
              <div key={i} className="relative">
                <img
                  src={src}
                  alt={`Page ${i + 1}`}
                  className={`w-full block ${
                    blurredPages.has(i) ? 'blur-xl' : ''
                  }`}
                />
                <button
                  onClick={() => toggleBlur(i)}
                  className="absolute top-4 right-4 bg-black/70 p-2 rounded"
                >
                  {blurredPages.has(i) ? <MdBlurOff /> : <MdBlurOn />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* SWIPE MODE */}
        {mode === 'swipe' && (
  <>
    {/* FIXED VIEWPORT + ZOOM */}
    <div className="relative w-full h-[85vh] overflow-hidden bg-black select-none flex items-center justify-center">
      <motion.img
        key={currentPage}
        src={images[currentPage]}
        alt={`Page ${currentPage + 1}`}
        drag
        dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
        dragElastic={0.1}
        whileTap={{ cursor: 'grabbing' }}
        initial={{ scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          setZoom((z) => (z === 1 ? 2 : 1))
        }}
        style={{
          scale: zoom,
        }}
        onDragEnd={(e, { offset, velocity }) => {
          if (zoom !== 1) return // ❗ kalau zoom aktif, jangan swipe halaman

          const swipe = Math.abs(offset.x) * velocity.x

          if (swipe < -10000 && currentPage < images.length - 1) {
            setCurrentPage((p) => p + 1)
          } else if (swipe > 10000 && currentPage > 0) {
            setCurrentPage((p) => p - 1)
          }
        }}
        className={`absolute max-w-full max-h-full object-contain ${
          blurredPages.has(currentPage) ? 'blur-xl' : ''
        }`}
      />

      {/* TOGGLE BLUR */}
      <button
        onClick={() => toggleBlur(currentPage)}
        className="absolute top-4 right-4 bg-black/70 p-2 rounded z-10"
      >
        {blurredPages.has(currentPage) ? <MdBlurOff /> : <MdBlurOn />}
      </button>
    </div>

    {/* PAGE CONTROLS */}
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
        disabled={currentPage === 0}
        className="px-4 py-2 bg-neutral-800 rounded disabled:opacity-40"
      >
        <FiChevronLeft />
      </button>

      <span className="text-sm text-neutral-400">
        {currentPage + 1} / {images.length}
      </span>

      <button
        onClick={() =>
          setCurrentPage((p) =>
            Math.min(p + 1, images.length - 1)
          )
        }
        disabled={currentPage === images.length - 1}
        className="px-4 py-2 bg-neutral-800 rounded disabled:opacity-40"
      >
        <FiChevronRight />
      </button>
    </div>
  </>
)}

        {/* CHAPTER NAV */}
        <div className="flex gap-4 mt-10">
          <button
            onClick={() => goChapter(prevSlug)}
            disabled={!prevSlug}
            className="w-full py-3 bg-neutral-800 rounded disabled:opacity-40"
          >
            ← Prev Chapter
          </button>

          <button
            onClick={() => goChapter(nextSlug)}
            disabled={!nextSlug}
            className="w-full py-3 bg-neutral-800 rounded disabled:opacity-40"
          >
            Next Chapter →
          </button>
        </div>
      </main>

      {/* FLOATING */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button
          onClick={toggleFullscreen}
          className="p-3 bg-neutral-800 rounded"
        >
          {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 bg-neutral-800 rounded"
        >
          <MdArrowUpward />
        </button>
      </div>
    </div>
  )
}
