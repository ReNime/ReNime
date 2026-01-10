import MangaCard from '@/app/components/MangaCard';
import SearchInput from '@/app/components/SearchInput';
import Navigation from '@/app/components/Navigation';
import BreadcrumbNavigation from '@/app/components/BreadcrumbNavigation';

async function searchManga(slug) {
  if (!slug) return [];

  try {
    const apiUrl = "https://komiku-alpha.vercel.app";
    const searchUrl = `${apiUrl}/search?q=${encodeURIComponent(slug)}`;

    const response = await fetch(searchUrl, { cache: 'no-store' });

    if (!response.ok) {
      console.error(`API error for slug "${slug}": Status ${response.status}`);
      return [];
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Gagal mengambil hasil pencarian:", error);
    return [];
  }
}

export default async function SearchPage({ params: ParamsPromise }) {
  const params = await ParamsPromise;
  const { slug } = params;
  const keyword = decodeURIComponent(slug);
  const searchResults = await searchManga(slug);

  const breadcrumbs = [
    { title: 'Search', href: '/manga/search' },
    { title: keyword, href: `/manga/search/${slug}` }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Navigation />
          {/* SearchInput versi manga */}
          <SearchInput basePath="/manga/search" />
          <h1 className="text-3xl md:text-4xl font-bold mt-4">
            {'Hasil Pencarian untuk: '}
            <span className="text-blue-500">{keyword}</span>
          </h1>
        </div>

        {searchResults && searchResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
            {searchResults.map((manga) => (
              <MangaCard
                key={manga.slug}
                slug={manga.slug}
                title={manga.title}
                thumbnail={manga.thumbnail}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-neutral-400">
              {'Yah, tidak ketemu...'}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
