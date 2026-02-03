'use client'

import { useEffect, useState } from 'react'
import MangaCard from './MangaCard'

export default function MangaGrid({ mangaList }) {
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!Array.isArray(mangaList) || mangaList.length === 0) {
      setDetails([])
      setLoading(false)
      return
    }

    async function loadDetails() {
      setLoading(true)

      const promises = mangaList.map(async (manga) => {
        try {
          const slug = manga.slug || manga.mangaSlug

          if (!slug) return null

          const res = await fetch(`/api/manga/details?slug=${slug}`)
          if (!res.ok) return null

          const data = await res.json()

          return {
            slug,
            title: data.title || manga.title,
            thumbnail: data.thumbnail || manga.thumbnail
          }
        } catch (err) {
          console.error(err)
          return null
        }
      })

      const results = await Promise.all(promises)
      setDetails(results.filter(Boolean))
      setLoading(false)
    }

    loadDetails()
  }, [mangaList])

  if (loading) {
    return (
      <p className="text-zinc-400 animate-pulse">
        Loading manga details...
      </p>
    )
  }

  if (!details.length) {
    return <p className="text-zinc-400">No manga found</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {details.map((manga) => (
        <MangaCard
          key={manga.slug}
          slug={manga.slug}
          title={manga.title}
          thumbnail={manga.thumbnail}
        />
      ))}
    </div>
  )
}
