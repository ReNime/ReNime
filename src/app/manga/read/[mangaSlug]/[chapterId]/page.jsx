'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchChapterImages } from '@/app/libs/komiku'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import {
  MdArrowBack,
  MdFullscreen,
  MdFullscreenExit,
  MdArrowUpward,
  MdBlurOn,
  MdBlurOff,
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReadPage() {
  const router = useRouter()
  const { mangaSlug, chapterId } = useParams()

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nextChapter, setNextChapter] = useState(null)
  const [prevChapter, setPrevChapter] = useState(null)
  const [mode, setMode] = useState('scroll')
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [blurredPages, setBlurredPages] = useState(new Set())

  /* ================= LOAD CHAPTER ================= */
  useEffect(() => {
    if (!mangaSlug || !chapterId) return

    const load = async () => {
      try {
        setLoading(true)
        const { images, prev, next } =
          await fetchChapterImages(mangaSlug, chapterId)

        setImages(images)
        setPrevChapter(prev)
        setNextChapter(next)
        setCurrentPage(0)
      } catch (err) {
        console.error(err)
        setError('Failed to load chapter')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [mangaSlug, chapterId])

  /* ================= BLUR ================= */
  const toggleBlur = (i) => {
    setBlurredPages((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  /* ================= SWIPE ================= */
  const swipeConfidenceThreshold = 10000

  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (direction) => {
    setCurrentPage((prev) => {
      const next = prev + direction
      if (next < 0 || next >= images.length) return prev
      return next
    })
  }

  /* ================= NAVIGATION ================= */
  const goChapter = (targetChapter) => {
    if (!targetChapter) return
    router.push(`/manga/read/${mangaSlug}/${targetChapter}`)
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

{mode === 'swipe' && (
  <>
    <div className="relative flex justify-center select-none">
      <motion.img
        key={currentPage}
        src={images[currentPage]}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = Math.abs(offset.x) * velocity.x

          if (swipe < -10000) {
            // swipe kiri → next page
            setCurrentPage((p) =>
              p < images.length - 1 ? p + 1 : p
            )
          } else if (swipe > 10000) {
            // swipe kanan → prev page
            setCurrentPage((p) => (p > 0 ? p - 1 : p))
          }
        }}
        className={`max-h-[85vh] rounded-lg ${
          blurredPages.has(currentPage) ? 'blur-xl' : ''
        }`}
      />

      {/* Toggle blur */}
      <button
        onClick={() => toggleBlur(currentPage)}
        className="absolute top-4 right-4 bg-black/70 p-2 rounded"
      >
        {blurredPages.has(currentPage) ? <MdBlurOff /> : <MdBlurOn />}
      </button>
    </div>

    {/* PAGE INDICATOR + BUTTON */}
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={() =>
          setCurrentPage((p) => (p > 0 ? p - 1 : p))
        }
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
            p < images.length - 1 ? p + 1 : p
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
            onClick={() => goChapter(prevChapter)}
            disabled={!prevChapter}
            className="w-full py-3 bg-neutral-800 rounded disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => goChapter(nextChapter)}
            disabled={!nextChapter}
            className="w-full py-3 bg-neutral-800 rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </main>

      {/* FLOATING BUTTONS */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button onClick={toggleFullscreen} className="p-3 bg-neutral-800 rounded">
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
