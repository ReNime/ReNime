import { NextResponse } from 'next/server'

const API_BASE = 'https://komiku-alpha.vercel.app'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json(
      { error: 'slug query is required' },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(
      `${API_BASE}/detail-komik/${slug}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      throw new Error(`Failed to fetch detail: ${res.status}`)
    }

    const data = await res.json()

    // API PURE DATA (NO SLUG / NO TRANSFORM)
    return NextResponse.json({
      title: data.title,
      alternativeTitle: data.alternativeTitle,
      description: data.description || data.sinopsis || '',
      thumbnail: data.thumbnail,
      slug: data.slug,

      info: data.info || {},
      genres: data.genres || [],

      firstChapter: data.firstChapter || null,
      latestChapter: data.latestChapter || null,
      chapters: data.chapters || []
    })
  } catch (error) {
    console.error('[DETAIL API ERROR]', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch manga detail',
        message: error.message
      },
      { status: 500 }
    )
  }
}
