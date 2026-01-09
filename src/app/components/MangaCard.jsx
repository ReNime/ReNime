import Image from 'next/image'
import Link from 'next/link'
import { getCoverImage } from '@/app/libs/mangadex'

export default function MangaCard({ manga, chaptersCount }) {
  const fallbackCover = '/default-cover.jpg'

  const coverRel = manga.relationships?.find(
    (rel) => rel.type === 'cover_art'
  )

  const coverFileName = coverRel?.attributes?.fileName

  const imageUrl = coverFileName
    ? getCoverImage(manga.id, coverFileName)
    : fallbackCover

  const title =
    manga.attributes.title.en ??
    Object.values(manga.attributes.title)[0] ??
    'Untitled'

  return (
    <Link
      href={`/manga/${manga.id}`}
      className="group block transition-transform duration-300 hover:scale-105"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl shadow-xl bg-zinc-900 border border-zinc-800">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 20vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {chaptersCount !== undefined && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-xs rounded-full">
            📖 {chaptersCount} ch
          </div>
        )}
      </div>

      <h3 className="mt-2 text-sm font-semibold text-center text-zinc-100 truncate">
        {title}
      </h3>
    </Link>
  )
}
