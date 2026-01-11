import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      'https://weebs.caliph.dev/api/komiku/daftar/manhwa',
      {
        // biar selalu fresh
        cache: 'no-store'
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to fetch manhwa list'
        },
        { status: res.status }
      )
    }

    const json = await res.json()

    return NextResponse.json({
      success: true,
      data: json.data || []
    })
  } catch (error) {
    console.error('[API /manhwa]', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Internal Server Error'
      },
      { status: 500 }
    )
  }
}
