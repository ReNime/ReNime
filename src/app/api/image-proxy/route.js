export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return new Response(
      JSON.stringify({ error: 'URL parameter is required' }),
      { status: 400 }
    )
  }

  if (!url.includes('donmai.us')) {
    return new Response(
      JSON.stringify({ error: 'Invalid image source' }),
      { status: 400 }
    )
  }

  try {
    const imageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Aichiow/1.0',
        Referer: 'https://danbooru.donmai.us/'
      },
      cache: 'force-cache'
    })

    if (!imageResponse.ok) {
      console.error('Image fetch failed:', imageResponse.status, url)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch image' }),
        { status: imageResponse.status }
      )
    }

    const contentType =
      imageResponse.headers.get('content-type') || 'image/jpeg'

    const imageBuffer = await imageResponse.arrayBuffer()

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Image proxy error:', error)

    return new Response(
      JSON.stringify({ error: 'Failed to proxy image' }),
      { status: 500 }
    )
  }
}
