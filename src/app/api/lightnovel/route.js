import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://ranobedb.org/api/v0/books', {
      cache: 'no-store'
    })

    if (!res.ok) throw new Error('Fetch failed')

    const json = await res.json()

    const baseImageUrl = 'https://images.ranobedb.org/' // PUBLIC

    const data = (json.books || []).map(item => ({
      id: item.id,
      title: item.title,
      romaji: item.romaji || item.romaji_orig || null,
      cover: item.image ? `${baseImageUrl}${item.image.filename}` : null,
      release_date: item.c_release_date,
      lang: item.lang,
      spoiler: item.image?.spoiler || false,
      nsfw: item.image?.nsfw || false
    }))

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[LIGHT NOVEL API]', err)
    return NextResponse.json(
      { error: 'Failed to load light novels' },
      { status: 500 }
    )
  }
}
