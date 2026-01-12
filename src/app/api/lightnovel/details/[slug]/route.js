import { NextResponse } from 'next/server'

export async function GET(_req, { params }) {
  const { slug } = params // slug = book id

  if (!slug) {
    return NextResponse.json(
      { success: false, error: 'book id required' },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(
      `https://ranobedb.org/api/v0/book/${slug}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      throw new Error(`RanobeDB error ${res.status}`)
    }

    const json = await res.json()
    const book = json?.book

    if (!book) {
      throw new Error('Book not found in response')
    }

    const imageBase = 'https://images.ranobedb.org/'

    const data = {
      id: book.id,
      title: book.title ?? 'Unknown title',
      romaji:
        book.romaji ||
        book.romaji_orig ||
        book.title_orig ||
        null,

      description:
        book.description ||
        book.description_ja ||
        'No description available.',

      cover: book.image?.filename
        ? `${imageBase}${book.image.filename}`
        : '/default-cover.jpg',

      lang: book.lang ?? null,
      release_date: book.c_release_date ?? null,

      publishers:
        Array.isArray(book.publishers)
          ? book.publishers.map(p => p.name).filter(Boolean)
          : [],

      tags:
        Array.isArray(book.series?.tags)
          ? book.series.tags
          : [],

      volumes:
        Array.isArray(book.series?.books)
          ? book.series.books.map(v => ({
              id: v.id,
              title: v.title,
              cover: v.image?.filename
                ? `${imageBase}${v.image.filename}`
                : '/default-cover.jpg'
            }))
          : []
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (err) {
    console.error('[LIGHT NOVEL DETAIL API ERROR]', err)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch light novel detail',
        message: err.message
      },
      { status: 500 }
    )
  }
}
