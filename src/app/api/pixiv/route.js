import PixivApi from 'pixiv-api-client'

export const runtime = 'nodejs'

const pixiv = new PixivApi()

let initialized = false

async function initPixiv() {
  if (initialized) return
  await pixiv.refreshLogin(process.env.PIXIV_REFRESH_TOKEN)
  initialized = true
}

export async function GET(req) {
  try {
    await initPixiv()

    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || 'original'
    const page = Number(searchParams.get('page') || 1)

    const res = await pixiv.searchIllust(q, {
      searchTarget: 'partial_match_for_tags',
      sort: 'date_desc',
      filter: 'for_ios',
      offset: (page - 1) * 30
    })

    const data = res.illusts.map(i => ({
      id: i.id,
      title: i.title,
      width: i.width,
      height: i.height,
      preview_file_url: i.image_urls.medium,
      file_url: i.meta_single_page?.original_image_url
        || i.meta_pages?.[0]?.image_urls.original
    }))

    return Response.json({
      success: true,
      data,
      hasMore: res.illusts.length === 30
    })
  } catch (e) {
    console.error(e)
    return Response.json({
      success: false,
      error: e.message
    }, { status: 500 })
  }
}
