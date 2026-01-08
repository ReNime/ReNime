export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const tags = searchParams.get('tags') || ''
  const page = searchParams.get('page') || '1'
  const limit = searchParams.get('limit') || '20'
  const rating = searchParams.get('rating') || 'safe'

  const apiKey = process.env.DANBOORU_API_KEY
  const apiUser = process.env.DANBOORU_API_USER || ''

  if (!apiKey) {
    return Response.json(
      { success: false, error: 'API key not configured' },
      { status: 500 }
    )
  }

  try {
    const pageNum = parseInt(page, 10)
    const limitNum = Math.min(parseInt(limit, 10), 200)

    let finalTags = tags.trim()
      ? `${tags.trim()} rating:${rating}`
      : `rating:${rating}`

    const params = new URLSearchParams({
      tags: finalTags,
      page: pageNum.toString(),
      limit: limitNum.toString()
    })

    const url = `https://danbooru.donmai.us/posts.json?${params.toString()}`

    const response = await fetch(url, {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${apiUser}:${apiKey}`).toString('base64'),
        'User-Agent': 'Renime/1.0'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Danbooru API error:', response.status, errorText)
      throw new Error(`Danbooru API error: ${response.status}`)
    }

    const data = await response.json()

    const processedData = data
      .filter(post => {
        const hasImage =
          post.file_url || post.large_file_url || post.preview_file_url
        const validExt = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
          post.file_ext?.toLowerCase()
        )
        return hasImage && validExt
      })
      .map(post => {
        const imageUrl =
          post.large_file_url || post.file_url || post.preview_file_url
        const previewUrl =
          post.preview_file_url || post.large_file_url || post.file_url

        return {
          ...post,
          file_url: imageUrl,
          large_file_url: imageUrl,
          preview_file_url: previewUrl
        }
      })

    console.log(
      `Fetched ${processedData.length} posts for tags: "${finalTags}"`
    )

    return Response.json({
      success: true,
      data: processedData,
      page: pageNum,
      hasMore: processedData.length === limitNum
    })
  } catch (error) {
    console.error('Danbooru API error:', error)

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch from Danbooru'
      },
      { status: 500 }
    )
  }
}
