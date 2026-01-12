import { NextResponse } from 'next/server'

const API_BASE = 'https://ranobedb.org/api/v0/book'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug') // di RanobeDB ini id book

  if (!slug) {
    return NextResponse.json(
      { success: false, error: 'slug (book id) required' },
      { status: 400 }
    )
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    // clean slug / id
    const cleanSlug = slug.replace(/^\/+/, '')

    const res = await fetch(`${API_BASE}/${cleanSlug}`, {
      signal: controller.signal,
      cache: 'no-store'
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      throw new Error('API error ' + res.status)
    }

    const json = await res.json()
    const book = json.book

    const mapped = {
      title: book.title,
      alternativeTitle: book.romaji || book.romaji_orig || book.title_orig || '',
      description: book.description || book.description_ja || '',
      thumbnail: book.image
        ? `https://cdn.ranobedb.org/images/${book.image.filename}`
        : null,
      slug: cleanSlug,
      genres: book.series?.tags || [],
      volumes: book.series?.books || []
    }

    return NextResponse.json({
      success: true,
      data: mapped
    })
  } catch (err) {
    console.error('[LIGHT NOVEL DETAIL API ERROR]', err)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch light novel detail',
        message:
          err.name === 'AbortError'
            ? 'Request timeout'
            : err.message
      },
      { status: 500 }
    )
  }
}
