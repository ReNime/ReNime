import React from 'react';
import Navigation from '@/app/components/Navigation';
import ResponsiveBreadcrumb from '@/app/components/ResponsiveBreadcrumb';
import Header from '@/app/components/Header';
import Link from 'next/link';

async function getAllGenres() {
  try {
    const response = await fetch('https://komiku-alpha.vercel.app/genre-all', {
      next: { revalidate: 86400 } // Cache 24 jam
    });

    if (!response.ok) throw new Error('Gagal mengambil data genre');

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
}

export default async function GenresPage() {
  const allGenres = await getAllGenres();

  const breadcrumbs = [
    { title: 'Genres', href: '/manga/genres' }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        <ResponsiveBreadcrumb crumbs={breadcrumbs} />
        <Header title="Daftar Genre Manga" />

        {allGenres.length > 0 ? (
          <>
            <p className="text-neutral-400 mb-6">
              Total <span className="font-semibold text-blue-400">{allGenres.length}</span> genre tersedia
            </p>

            {/* Genre Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {allGenres.map((genre) => (
                <Link
                  key={genre.slug}
                  href={`/manga/genre/${genre.slug}`}
                  className="block bg-neutral-800 hover:bg-neutral-700 rounded-lg p-4 text-center font-semibold transition-all duration-300"
                  title={genre.titleAttr} // tooltip optional
                >
                  {genre.title} {/* e.g. "Comedy (2.611)" */}
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <div
                className="w-16 h-16 border-4 border-neutral-700 rounded-full animate-spin mx-auto mb-4"
                style={{ borderTopColor: 'var(--accent-from)' }}
              ></div>
              <p className="text-neutral-400">Gagal memuat data genre.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
