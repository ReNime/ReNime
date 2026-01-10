import React from 'react'
import Link from 'next/link'
import Navigation from '@/app/components/Navigation'
import ResponsiveBreadcrumb from '@/app/components/ResponsiveBreadcrumb'
import Header from '@/app/components/Header'
import MangaCard from '@/app/components/MangaCard'

/**
 * Fetch manga list by genre slug
 * Example: https://komiku-alpha.vercel.app/genre/academy
 */
async function getMangaByGenre(slug) {
  try {
    const res = await fetch(
      `https://komiku-alpha.vercel.app/genre/${encodeURIComponent(slug)}`,
      { cache: 'no-store' }
    )

    if (!res.ok) throw new Error('Failed to fetch genre')

    const data = await res.json()
    // Komiku endpoint biasanya return something like { status: true, message: ..., data: [...] }
    return Array.isArray(data.data) ? data.data : []
  } catch (err) {
    console.error('Error fetch genre:', err)
    return []
  }
}

/**
 * (Optional) fetch all genres for sidebar or breadcrumb lookup
 */
async function getAllGenres() {
  try {
    const res = await fetch('https://komiku-alpha.vercel.app/genre-all', {
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Failed to fetch genres')
    const data = await res.json()
    return Array.isArray(data.data) ? data.data : []
  } catch (err) {
    console.error('Error fetch all genres:', err)
    return []
  }
}

export default async function GenrePage({ params }) {
  const { slug } = params

  // Fetch this genre's manga
  const mangaList = await getMangaByGenre(slug)

  // Optional: fetch all genres to get name for this slug
  const allGenres = await getAllGenres()
  const currentGenre = allGenres.find((g) => g.slug === slug)
  const genreName = currentGenre?.title || slug

  const breadcrumbs = [
    { title: 'Genres', href: '/manga/genres' },
    { title: genreName, href: `/manga/genre/${slug}` },
  ]

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <Navigation />
        <ResponsiveBreadcrumb crumbs={breadcrumbs} />
        <Header title={`Genre: ${genreName}`} />

        {mangaList.length > 0 ? (
          <>
            <p className="text-neutral-400 mb-6">
              Menampilkan {mangaList.length} manga untuk genre{' '}
              <span className="font-semibold text-blue-400">{genreName}</span>
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
              {mangaList.map((manga) => (
                <MangaCard
                  key={manga.slug}
                  slug={manga.slug}
                  title={manga.title}
                  thumbnail={manga.thumbnail}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-neutral-400">
            <p>Tidak ada manga ditemukan untuk genre ini.</p>
            <Link
              href="/manga/genres"
              className="mt-4 inline-block text-blue-400 underline"
            >
              Kembali ke daftar genre
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
