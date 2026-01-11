import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('s')

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Missing search query (?s=)' },
        { status: 400 }
      )
    }

    const res = await fetch(
      `https://weebs.caliph.dev/api/komiku?s=${encodeURIComponent(query)}`,
      { cache: 'no-store' }
    )

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: 'Failed to search manhwa' },
        { status: res.status }
      )
    }

    const json = await res.json()

    return NextResponse.json({
      success: true,
      data: json.data || []
    })
  } catch (error) {
    console.error('[API /manhwa/search]', error)

    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
