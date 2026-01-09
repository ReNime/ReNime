import MangaCard from './MangaCard'

export default function MangaGrid({ mangaList }) {
  if (!Array.isArray(mangaList) || mangaList.length === 0) {
    return <p className="text-zinc-400">⚠️ No manga to display.</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {mangaList.map((manga, index) => {
        if (!manga?.apiDetailLink) return null

        // ⬇️ ambil slug dari apiDetailLink
        const slug = manga.apiDetailLink.replace('/detail-komik/', '')

        return (
          <MangaCard
            key={slug || index}
            slug={slug}
            title={manga.title}
            thumbnail={manga.thumbnail}
          />
        )
      })}
    </div>
  )
}
