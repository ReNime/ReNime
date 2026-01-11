import { NextResponse } from 'next/server'

const API_BASE = 'https://weebs.caliph.dev/api/komiku'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json(
      { success: false, error: 'slug required' },
      { status: 400 }
    )
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    // slug aman (hapus slash depan kalau ada)
    const cleanSlug = slug.replace(/^\/+/, '')

    const res = await fetch(
      `${API_BASE}/${cleanSlug}`,
      {
        signal: controller.signal,
        cache: 'no-store'
      }
    )

    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error('API error ' + res.status)
    }

    const data = await res.json()

    return NextResponse.json({
      success: true,
      data: {
        title: data.title,
        alternativeTitle: data.alternative || '',
        description: data.description || data.sinopsis || '',
        thumbnail: data.thumbnail,
        slug: cleanSlug,
        genres: data.genres || [],
        chapters: data.chapter || data.chapters || []
      }
    })
  } catch (err) {
    console.error('[MANHWA DETAIL API ERROR]', err)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch manhwa detail',
        message:
          err.name === 'AbortError'
            ? 'Request timeout'
            : err.message
      },
      { status: 500 }
    )
  }
}
