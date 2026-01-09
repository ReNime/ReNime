'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchChapterImages } from '@/app/libs/mangadex'
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
  const { slug } = useParams()
  const chapterId = Array.isArray(slug) ? slug[0] : slug

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nextId, setNextId] = useState(null)
  const [prevId, setPrevId] = useState(null)
  const [mode, setMode] = useState('scroll')
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [blurredPages, setBlurredPages] = useState(new Set())

  useEffect(() => {
    if (!chapterId) return

    const loadImages = async () => {
      try {
        setLoading(true)
        const chapter = await fetchChapterImages(chapterId)

        if (!chapter?.hash || !chapter?.baseUrl) {
          throw new Error('Invalid chapter data')
        }

        const files = chapter.data?.length
          ? chapter.data
          : chapter.dataSaver

        const modeStr = chapter.data?.length ? 'data' : 'data-saver'

        const urls = files.map(
          (file) => `${chapter.baseUrl}/${modeStr}/${chapter.hash}/${file}`
        )

        setImages(urls)
        setNextId(chapter.next || null)
        setPrevId(chapter.prev || null)

        const blurSet = new Set()
        urls.forEach((_, i) => {
          if (Math.random() > 0.7) blurSet.add(i)
        })
        setBlurredPages(blurSet)
      } catch (e) {
        console.error(e)
        setError('Failed to load chapter.')
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [chapterId])

  const toggleBlur = (i) => {
    setBlurredPages((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const handleNav = (id) => {
    if (!id) return
    router.push(`/read/${id}`)
    setCurrentPage(0)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="sticky top-0 z-40 flex justify-between items-center bg-neutral-900/80 backdrop-blur px-4 py-3 border-b border-neutral-800">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sky-400"
        >
          <MdArrowBack /> Back
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setMode('scroll')}
            className={`px-3 py-1 text-xs rounded ${
              mode === 'scroll' ? 'bg-sky-500' : 'bg-neutral-800'
            }`}
          >
            Scroll
          </button>
          <button
            onClick={() => setMode('swipe')}
            className={`px-3 py-1 text-xs rounded ${
              mode === 'swipe' ? 'bg-sky-500' : 'bg-neutral-800'
            }`}
          >
            Swipe
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        {mode === 'scroll' && (
          <div className="space-y-6">
            {images.map((src, i) => (
              <div key={i} className="relative">
                <img
                  src={src}
                  className={`w-full rounded-lg transition ${
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
          <AnimatePresence mode="wait">
            <motion.img
              key={currentPage}
              src={images[currentPage]}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`mx-auto rounded-lg ${
                blurredPages.has(currentPage) ? 'blur-xl' : ''
              }`}
            />
          </AnimatePresence>
        )}

        <div className="flex gap-4 mt-10">
          <button
            onClick={() => handleNav(prevId)}
            disabled={!prevId}
            className="w-full py-3 bg-neutral-800 rounded disabled:opacity-40"
          >
            <FiChevronLeft /> Prev
          </button>
          <button
            onClick={() => handleNav(nextId)}
            disabled={!nextId}
            className="w-full py-3 bg-neutral-800 rounded disabled:opacity-40"
          >
            Next <FiChevronRight />
          </button>
        </div>
      </main>

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
