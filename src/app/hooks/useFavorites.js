'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

/**
 * @typedef {Object} Params
 * @property {number=} mediaId - ID dari media
 * @property {'anime' | 'manga' | 'manhwa' | 'light_novel'=} mediaType - Tipe media
 */

export function useFavorites({ mediaId, mediaType } = {}) {
  const router = useRouter()
  const { data: session } = useSession()

  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchFavorites = useCallback(async () => {
    setLoading(true)

    if (!session?.user?.email) {
      setFavorites([])
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/favorites') // endpoint Next.js untuk fetch favorites
      const data = await res.json()
      setFavorites(data || [])
    } catch (err) {
      console.error('Error fetching favorites:', err)
    }

    setLoading(false)
  }, [session])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const isFavorite = useMemo(() => {
    if (!mediaId || !mediaType) return false
    return favorites.some(
      (f) => f.media_id === mediaId && f.media_type === mediaType
    )
  }, [favorites, mediaId, mediaType])

  const toggleFavorite = useCallback(async () => {
    setLoading(true)

    if (!session?.user?.email) {
      setLoading(false)
      router.push('/auth/login')
      return
    }

    if (!mediaId || !mediaType) {
      await fetchFavorites()
      setLoading(false)
      return
    }

    const existing = favorites.find(
      (f) => f.media_id === mediaId && f.media_type === mediaType
    )

    try {
      if (existing) {
        // Hapus favorit
        await fetch(`/api/favorites/${existing.id}`, {
          method: 'DELETE',
        })
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id))
      } else {
        // Tambah favorit
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            media_id: mediaId,
            media_type: mediaType,
            added_at: new Date().toISOString(),
          }),
        })
        const data = await res.json()
        setFavorites((prev) => [data, ...prev])
      }
    } catch (err) {
      console.error('Error updating favorite:', err)
    }

    setLoading(false)
  }, [favorites, mediaId, mediaType, fetchFavorites, router, session])

  return {
    favorites,
    isFavorite,
    loading,
    toggleFavorite,
    refresh: fetchFavorites,
  }
}
