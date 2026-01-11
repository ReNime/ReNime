import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      'https://weebs.caliph.dev/api/komiku/daftar/manhwa',
      { cache: 'no-store' }
    )

    if (!res.ok) throw new Error('Fetch failed')

    const json = await res.json()

    const data = (json.data || []).map(item => ({
      title: item.title,
      slug: item.slug,
      image: item.image,
      genre: item.genre,
      status: item.status,
      type: item.type
    }))

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[MANHWA API]', err)
    return NextResponse.json(
      { error: 'Failed to load manhwa' },
      { status: 500 }
    )
  }
}
