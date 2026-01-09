import Link from 'next/link';
import {
  fetchPopularManga,
  getCoverImage,
  getLocalizedTitle,
} from '@/app/libs/mangadex';

export const dynamic = 'force-dynamic';

export default async function MangaHomePage() {
  const mangas = await fetchPopularManga();

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <h1 className="text-2xl font-bold mb-6">📚 Manga Popular</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {mangas.map((manga) => {
          const cover = manga.relationships?.find(
            (rel) => rel.type === 'cover_art'
          );

          const coverUrl = cover
            ? getCoverImage(manga.id, cover.attributes.fileName)
            : '/no-cover.png';

          return (
            <Link
              key={manga.id}
              href={`/manga/${manga.id}`}
              className="group"
            >
              <div className="bg-zinc-900 rounded-lg overflow-hidden">
                <img
                  src={coverUrl}
                  alt={getLocalizedTitle(manga.attributes.title)}
                  className="aspect-[2/3] w-full object-cover group-hover:scale-105 transition"
                />
              </div>

              <h2 className="mt-2 text-sm line-clamp-2">
                {getLocalizedTitle(manga.attributes.title)}
              </h2>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
