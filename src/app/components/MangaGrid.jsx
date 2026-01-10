import MangaCard from './MangaCard'

export default function MangaGrid({ mangaList }) {
  if (!Array.isArray(mangaList) || mangaList.length === 0) {
    return <p className="text-zinc-400">No manga found</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
      {mangaList.map((manga, i) => (
        <MangaCard
          key={manga.slug || i}
          slug={manga.slug}
          title={manga.title}
          thumbnail={manga.thumbnail}
          chaptersCount={manga.chaptersCount}
        />
      ))}
    </div>
  )
}
