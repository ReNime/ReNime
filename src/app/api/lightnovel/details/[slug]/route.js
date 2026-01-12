// app/api/lightnovel/details/[slug]/route.js
import { NextResponse } from 'next/server'

export async function GET({ params }) {
  const { slug } = params // ambil slug dari URL path

  if (!slug) {
    return NextResponse.json(
      { success: false, error: 'slug (book id) required' },
      { status: 400 }
    )
  }

  try {
    const res = await fetch(`https://ranobedb.org/api/v0/book/${slug}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('API error ' + res.status)

    const json = await res.json()
    const book = json.book

    const mapped = {
      id: book.id,
      title: book.title,
      alternativeTitle: book.romaji || book.romaji_orig || book.title_orig || '',
      description: book.description || book.description_ja || '',
      thumbnail: book.image ? `https://images.ranobedb.org/${book.image.filename}` : null,
      slug: slug,
      genres: book.series?.tags || [],
      volumes: book.series?.books?.map(v => ({
        id: v.id,
        title: v.title,
        image: v.image ? `https://images.ranobedb.org/${v.image.filename}` : null
      })) || []
    }

    return NextResponse.json({ success: true, data: mapped })
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
