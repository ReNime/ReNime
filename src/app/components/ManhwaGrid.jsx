'use client'

import { useEffect, useState } from 'react'
import ManhwaCard from './ManhwaCard'

export default function ManhwaGrid({ manhwaList }) {
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!Array.isArray(manhwaList) || manhwaList.length === 0) {
      setDetails([])
      setLoading(false)
      return
    }

    async function loadDetails() {
      setLoading(true)

      const promises = manhwaList.map(async (manhwa) => {
        // API Caliph pakai `endpoint`
        const slug = manhwa.slug || manhwa.endpoint
        if (!slug) return null

        // kalau sudah ada thumb, gak perlu fetch detail
        if (manhwa.thumb || manhwa.thumbnail) {
          return {
            slug,
            title: manhwa.title,
            thumbnail: manhwa.thumb || manhwa.thumbnail
          }
        }

        try {
          const res = await fetch(
            `/api/manhwa/details?slug=${encodeURIComponent(slug)}`
          )

          if (!res.ok) return null

          const data = await res.json()

          return {
            slug,
            title: data.title,
            thumbnail: data.thumbnail
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
  }, [manhwaList])

  if (loading) {
    return (
      <p className="text-zinc-400 animate-pulse">
        Loading manhwa...
      </p>
    )
  }

  if (!details.length) {
    return <p className="text-zinc-400">No manhwa found</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {details.map((manhwa) => (
        <ManhwaCard
          key={manhwa.slug}
          slug={manhwa.slug}
          title={manhwa.title}
          thumbnail={manhwa.thumbnail}
        />
      ))}
    </div>
  )
}
