import React from 'react';
import Navigation from '@/app/components/Navigation';
import ResponsiveBreadcrumb from '@/app/components/ResponsiveBreadcrumb';
import Header from '@/app/components/Header';
import Link from 'next/link';
import Image from 'next/image';

async function getGenres() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/genres`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    
    if (!response.ok) {
      throw new Error('Gagal mengambil data genres');
    }
    
    const result = await response.json();
    return result.genres || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
}

async function getSampleAnimeForGenre(slug) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/genre/${slug}?page=1`, {
      next: { revalidate: 86400 }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const result = await response.json();
    return result.animes?.[0]?.poster || null;
  } catch (error) {
    return null;
  }
}

export default async function GenresPage() {
  const genres = await getGenres();

  // Fetch sample images for all genres
  const allGenres = await Promise.all(
    genres.map(async (genre) => {
      const image = await getSampleAnimeForGenre(genre.slug);
      return { ...genre, image };
    })
  );

  const breadcrumbs = [
    { title: 'Genres', href: '/genres' }
  ];

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        <ResponsiveBreadcrumb crumbs={breadcrumbs} />
        <Header title="Daftar Genre Anime" />

        {allGenres.length > 0 ? (
          <>
            <p className="text-theme-tertiary mb-6">
              Total <span className="font-semibold text-theme-secondary">{allGenres.length}</span> genre tersedia
            </p>

            {/* Genre Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {allGenres.map((genre) => (
                <Link
                  key={genre.slug}
                  href={`/genre/${genre.slug}`}
                  className="group relative rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105 h-32 md:h-40 border border-theme"
                  style={{ boxShadow: '0 4px 6px var(--shadow-theme)' }}
                >
                  {/* Background Image */}
                  {genre.image ? (
                    <>
                      <Image
                        src={genre.image}
                        alt={genre.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                      {/* Base Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
                      
                      {/* Hover Overlay with Theme Colors */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: 'linear-gradient(to top, var(--accent-from), var(--accent-via), transparent)'
                        }}
                      ></div>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-theme-tertiary transition-all duration-300">
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: 'linear-gradient(to bottom right, var(--accent-from), var(--accent-to))'
                        }}
                      ></div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center h-full p-4">
                    <h3 className="text-sm md:text-base font-bold text-white text-center drop-shadow-lg">
                      {genre.name}
                    </h3>
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-white mx-auto drop-shadow-lg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5l7 7-7 7" 
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Border Glow Effect on Hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"
                    style={{
                      boxShadow: '0 0 30px var(--shadow-theme)'
                    }}
                  ></div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="text-center">
              <div 
                className="w-16 h-16 border-4 border-theme rounded-full animate-spin mx-auto mb-4"
                style={{ borderTopColor: 'var(--accent-from)' }}
              ></div>
              <p className="text-theme-tertiary">Gagal memuat data genre.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
