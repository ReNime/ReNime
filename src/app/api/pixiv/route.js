import { getPixivAccessToken } from '@/app/libs/pixiv'

export const runtime = 'nodejs'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || 'anime'

    const token = await getPixivAccessToken()

    const url =
      'https://app-api.pixiv.net/v1/search/illust?' +
      new URLSearchParams({
        word: q,
        search_target: 'partial_match_for_tags',
        filter: 'for_android'
      })

    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'PixivAndroidApp/5.0.234 (Android)'
      }
    })

    const data = await r.json()

    return Response.json({
      success: true,
      illusts: data.illusts ?? []
    })
  } catch (e) {
    return Response.json(
      { success: false, error: e.message },
      { status: 500 }
    )
  }
}
