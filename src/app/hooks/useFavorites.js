'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

/**
 * @typedef {Object} Params
 * @property {string | number=} mediaId - ID dari media
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
      const res = await fetch('/api/favorites')
      if (!res.ok) throw new Error('Failed to fetch favorites')
      const data = await res.json()
      setFavorites(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching favorites:', err)
      setFavorites([])
    }

    setLoading(false)
  }, [session?.user?.email])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  const isFavorite = useMemo(() => {
    if (!mediaId || !mediaType) return false
    return favorites.some(
      (f) =>
        String(f.media_id) === String(mediaId) && f.media_type === mediaType
    )
  }, [favorites, mediaId, mediaType])

  const toggleFavorite = useCallback(async () => {
    if (!session?.user?.email) {
      router.push('/auth/login')
      return
    }

    if (!mediaId || !mediaType) {
      await fetchFavorites()
      return
    }

    const existing = favorites.find(
      (f) =>
        String(f.media_id) === String(mediaId) && f.media_type === mediaType
    )

    setLoading(true)
    try {
      if (existing) {
        // Hapus favorit
        const res = await fetch(`/api/favorites/${existing.id}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to remove favorite')
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
        if (!res.ok) throw new Error('Failed to add favorite')
        const data = await res.json()
        setFavorites((prev) => [data, ...prev])
      }
    } catch (err) {
      console.error('Error updating favorite:', err)
    } finally {
      setLoading(false)
    }
  }, [favorites, mediaId, mediaType, fetchFavorites, router, session?.user?.email])

  return {
    favorites,
    isFavorite,
    loading,
    toggleFavorite,
    refresh: fetchFavorites,
  }
}
