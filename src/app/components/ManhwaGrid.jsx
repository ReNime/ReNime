'use client'

import ManhwaCard from './ManhwaCard'

export default function ManhwaGrid({ list = [] }) {
  if (!list.length) {
    return (
      <p className="text-zinc-400">
        No manhwa found
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {list.map((item) => (
        <ManhwaCard
          key={item.slug}
          slug={item.slug}
          title={item.title}
          image={item.image}
        />
      ))}
    </div>
  )
}
