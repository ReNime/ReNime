import { NextResponse } from 'next/server'

const Pixiv = require('pixiv-app-api')

let pixiv = null
let lastLogin = 0

async function getPixivClient() {
  const now = Date.now()

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

    const q = searchParams.get('q') || 'miku'
    const page = Number(searchParams.get('page') || 1)

    const client = await getPixivClient()

    const result = await client.searchIllust(q, {
      search_target: 'partial_match_for_tags',
      sort: 'date_desc'
    })

    const perPage = 20
    const start = (page - 1) * perPage
    const slice = result.illusts.slice(start, start + perPage)

    const data = slice.map(illust => ({
      id: illust.id,
      title: illust.title,
      preview_url:
        illust.image_urls.square_medium ||
        illust.image_urls.medium,
      original_url:
        illust.meta_single_page?.original_image_url ||
        illust.meta_pages?.[0]?.image_urls?.original
    }))

    return NextResponse.json({
      success: true,
      data,
      hasMore: start + perPage < result.illusts.length
    })
  } catch (err) {
    console.error('PIXIV REAL ERROR:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
