'use client'

import { useEffect, useState } from 'react'
import { fetchPopularManga } from '@/app/libs/komiku'
import MangaGrid from '@/app/components/MangaGrid'
import SearchManga from '@/app/components/SearchManga'
import MangaNavbar from '@/app/components/MangaNavbar'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaFire,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner
} from 'react-icons/fa'

export default function MangaLandingPage() {
  const [popular, setPopular] = useState([])
  const [loading, setLoading] = useState(true)
  const [log, setLog] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    async function load() {
      try {
        //setLog({ type: 'loading', message: 'Loading manga list...' })
        const popularRes = await fetchPopularManga()
        setPopular(popularRes)
        console.log('POPULAR DATA:', popularRes)
        //setLog({ type: 'success', message: 'Popular manga loaded successfully!' })
        //setLog({ type: 'success', message: popularRes })
      } catch (err) {
        console.error('[Manga Landing] Error:', err)
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
    <main className="relative min-h-screen bg-black overflow-hidden">
      <MangaNavbar />
      {/* background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.08),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.06),transparent_50%),radial-gradient(circle_at_20%_80%,rgba(14,165,233,0.05),transparent_50%)] pointer-events-none" />

      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(14,165,233,0.06), transparent 40%)`
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
              className={`mb-8 px-6 py-4 rounded-xl flex items-center gap-3 backdrop-blur-xl border ${
                log.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : log.type === 'error'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
              }`}
            >
              {log.type === 'success' && <FaCheckCircle />}
              {log.type === 'error' && <FaTimesCircle />}
              {log.type === 'loading' && (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <FaSpinner />
                </motion.div>
              )}
              <span>{log.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      <SearchManga />
        {loading ? (
          <p className="text-gray-400">Loading manga...</p>
        ) : (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FaFire className="text-orange-500 text-2xl" />
              <h2 className="text-3xl font-black text-white">
                Rekomendasi
              </h2>
            </div>
            <MangaGrid mangaList={popular} />
          </section>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/manga/explore"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-3 rounded-xl font-bold text-black"
          >
            <FaSearch />
            Explore Library
          </Link>
        </div>
      </div>
    </main>
  )
              }
