'use client'

import LightNovelCard from './LightNovelCard'

export default function LightNovelGrid({ list }) {
  if (!Array.isArray(list) || list.length === 0) {
    return <p className="text-zinc-400">No light novels found</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {list.map((ln) => (
        <LightNovelCard
          key={ln.id}
          slug={ln.slug}
          title={ln.title}
          cover={ln.cover}
        />
      ))}
    </div>
  )
}
