import { getLocalizedTitle, getCoverImage } from '@/app/libs/mangadex'
import MangaCard from './MangaCard'

/**
 * @typedef {Object} MangaGridProps
 * @property {Array<any>} mangaList
 */


export default function MangaGrid({ mangaList }) {
  if (!mangaList || mangaList.length === 0) {
    return <p className="text-zinc-400">⚠️ No manga to display.</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {mangaList.map((manga) => {
        const title = getLocalizedTitle(manga.attributes.title)
        const cover = manga.relationships.find((rel) => rel.type === 'cover_art')
        const coverFileName = cover?.attributes?.fileName || ''

        if (!coverFileName) return null

        return (
          <MangaCard
            key={manga.id}
            id={manga.id}
            title={title}
            coverFileName={coverFileName}
          />
        )
      })}
    </div>
  )
}
