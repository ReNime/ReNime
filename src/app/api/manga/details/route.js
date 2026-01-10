import { NextResponse } from 'next/server'

const API_BASE = 'https://komiku-alpha.vercel.app'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(`https://komiku-alpha.vercel.app/detail-komik/${slug}`, {
      signal: controller.signal,
      cache: 'no-store'
    })

    clearTimeout(timeoutId)

    if (!res.ok) throw new Error('API error ' + res.status)

    const data = await res.json()
    return NextResponse.json({
      title: data.title,
      alternativeTitle: data.alternativeTitle,
      description: data.description || data.sinopsis || '',
      thumbnail: data.thumbnail,
      slug: data.slug,
      genres: data.genres || [],
      chapters: data.chapters || [],
    })
  } catch (err) {
    console.error('[DETAIL API ERROR]', err)
    return NextResponse.json(
      { error: 'Failed to fetch manga detail', message: err.message },
      { status: 500 }
    )
  }
}
