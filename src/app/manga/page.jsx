'use client'

import { useEffect, useState } from 'react'
import { fetchLatestManga } from '@/app/libs/komiku' // ✅ ganti sini
import MangaGrid from '@/app/components/MangaGrid'
import SearchManga from '@/app/components/SearchManga'
import MangaNavbar from '@/app/components/MangaNavbar'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaFire,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa'

export default function MangaLandingPage() {
  const [popular, setPopular] = useState([]) // boleh tetap namanya, opsional ganti jadi latest
  const [loading, setLoading] = useState(true)
  const [log, setLog] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    async function load() {
      try {
        const latestRes = await fetchLatestManga() // ✅ ganti sini
        setPopular(latestRes)
      } catch (err) {
        setLog({
          type: 'error',
          message: `Failed to load: ${err?.message || 'Unknown error'}`
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <main className="relative min-h-screen bg-theme-primary overflow-hidden">
      <MangaNavbar />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, var(--shadow-theme), transparent 55%),
            radial-gradient(circle at 80% 20%, var(--border-theme), transparent 55%),
            radial-gradient(circle at 20% 80%, var(--border-theme), transparent 55%)
          `
        }}
      />

      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{
          background: `radial-gradient(
            600px circle at ${mousePosition.x}px ${mousePosition.y}px,
            var(--shadow-theme),
            transparent 40%
          )`
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0.2 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence>
          {log && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 px-6 py-4 rounded-xl flex items-center gap-3 backdrop-blur-xl border border-theme bg-theme-secondary text-theme-primary"
            >
              {log.type === 'success' && (
                <FaCheckCircle className="text-[color:var(--accent-from)]" />
              )}
              {log.type === 'error' && (
                <FaTimesCircle className="text-red-400" />
              )}
              {log.type === 'loading' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <FaSpinner />
                </motion.div>
              )}
              <span>{log.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <SearchManga />

        {loading ? (
          <p className="text-theme-tertiary">
            Loading manga...
          </p>
        ) : (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FaFire className="text-2xl text-[color:var(--accent-from)]" />
              <h2 className="text-3xl font-black text-theme-primary">
                Manga Terbaru
              </h2>
            </div>

            <MangaGrid mangaList={popular} />
          </section>
        )}
      </div>
    </main>
  )
}
