'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaHeartBroken } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

function Loading() {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </main>
  )
}

export default function MangaFavoritesPage() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadFavorites() {
      try {
        setLoading(true)
        const res = await fetch('/api/manga/favorites')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setFavorites(data || [])
      } catch (err) {
        console.error(err)
        setError('Gagal memuat manga favorites')
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  async function removeFavorite(mangaId) {
    try {
      await fetch('/api/manga/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mangaId }),
      })

      setFavorites((prev) =>
        prev.filter((f) => f.mangaId !== mangaId)
      )
    } catch (err) {
      console.error('Failed to remove favorite', err)
    }
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          ❤️ Manga Favorites
        </h1>

        {favorites.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <p className="mb-2">Belum ada manga favorit</p>
            <Link href="/manga" className="text-sky-400 underline">
              Jelajahi manga
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {favorites.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gray-900 rounded-xl overflow-hidden group"
                >
                  <Link href={`/manga/${item.mangaId}`}>
                    <div className="relative aspect-[3/4]">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition"
                      />
                    </div>
                  </Link>

                  <div className="p-3">
                    <p className="text-sm font-semibold truncate">
                      {item.title}
                    </p>

                    <button
                      onClick={() => removeFavorite(item.mangaId)}
                      className="mt-2 flex items-center gap-2 text-xs text-red-400 hover:text-red-300"
                    >
                      <FaHeartBroken />
                      Remove
                    </button>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        )}
      </section>
    </main>
  )
}
