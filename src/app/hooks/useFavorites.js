'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export function useFavorites({ mediaId, title, image } = {}) {
  const router = useRouter()
  const { data: session } = useSession()

  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch semua favorites user
  const fetchFavorites = useCallback(async () => {
    if (!session?.user) {
      setFavorites([])
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/manga/favorites')
      const data = await res.json()
      setFavorites(data || [])
    } catch (err) {
      console.error('Fetch favorites error:', err)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  // Cek apakah manga ini sudah di-favorite
  const isFavorite = useMemo(() => {
    if (!mediaId) return false
    return favorites.some((f) => f.mangaId === mediaId)
  }, [favorites, mediaId])

  // Toggle favorite
  const toggleFavorite = useCallback(async () => {
    if (!session?.user) {
      router.push('/auth/login')
      return
    }

    if (!mediaId) return

    setLoading(true)

    try {
      if (isFavorite) {
        // DELETE
        await fetch('/api/manga/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mangaId: mediaId }),
        })

        setFavorites((prev) =>
          prev.filter((f) => f.mangaId !== mediaId)
        )
      } else {
        // POST
        const res = await fetch('/api/manga/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mangaId: mediaId,
            title,
            image,
          }),
        })

        const data = await res.json()
        setFavorites((prev) => [data, ...prev])
      }
    } catch (err) {
      console.error('Toggle favorite error:', err)
    } finally {
      setLoading(false)
    }
  }, [session, mediaId, title, image, isFavorite, router])

  return {
    favorites,
    isFavorite,
    loading,
    toggleFavorite,
    refresh: fetchFavorites,
  }
}
