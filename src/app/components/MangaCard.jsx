import Image from 'next/image'
import Link from 'next/link'

export default function MangaCard({ slug, title, thumbnail }) {
  const fallbackCover = '/default-cover.jpg'

  return (
    <Link
      href={`/manga/details/${slug}`}
      className="group block transition-transform duration-300 hover:scale-105"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl shadow-xl bg-zinc-900 border border-zinc-800 group-hover:border-indigo-500/60 transition-all duration-300">
        <img
  src={thumbnail}
  alt={title}
  className="w-full h-full object-cover"
/>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      </div>

      <h3 className="mt-2 text-sm font-semibold text-center text-zinc-100 group-hover:text-indigo-400 truncate">
        {title}
      </h3>
    </Link>
  )
}
