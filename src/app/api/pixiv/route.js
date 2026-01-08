import { NextResponse } from 'next/server'
import Pixiv from 'pixiv-app-api'

let pixiv = null
let lastLogin = 0

async function getPixivClient() {
  const now = Date.now()

  // login ulang tiap 30 menit
  if (!pixiv || now - lastLogin > 30 * 60 * 1000) {
    pixiv = new Pixiv()
    await pixiv.login(
      process.env.PIXIV_USERNAME,
      process.env.PIXIV_PASSWORD
    )
    lastLogin = now
  }

  return pixiv
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const q = searchParams.get('q') || 'anime'
    const page = Number(searchParams.get('page') || 1)
    const sort = searchParams.get('sort') || 'popular'

    const client = await getPixivClient()

    const result = await client.searchIllust(q, {
      search_target: 'partial_match_for_tags',
      sort: sort === 'new' ? 'date_desc' : 'popular_desc'
    })

    const perPage = 20
    const start = (page - 1) * perPage
    const end = start + perPage

    const slice = result.illusts.slice(start, end)

    const data = slice.map(illust => ({
      id: illust.id,
      title: illust.title,
      user_name: illust.user?.name,
      preview_url:
        illust.image_urls?.square_medium ||
        illust.image_urls?.medium,
      original_url:
        illust.meta_single_page?.original_image_url ||
        illust.meta_pages?.[0]?.image_urls?.original
    }))

    return NextResponse.json({
      success: true,
      data,
      hasMore: end < result.illusts.length
    })
  } catch (err) {
    console.error('PIXIV API ERROR:', err)
    return NextResponse.json(
      { success: false, error: 'Pixiv fetch failed' },
      { status: 500 }
    )
  }
}
