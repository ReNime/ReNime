export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')

  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    return Response.json({ success: true, data: [] })
  }

  try {
    const params = new URLSearchParams({
      'search[query]': q.trim(),
      'search[type]': 'tag_query',
      limit: '10'
    })

    const url = `https://danbooru.donmai.us/autocomplete.json?${params.toString()}`

    console.log('Fetching autocomplete:', url)

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        'Danbooru autocomplete error:',
        response.status,
        errorText
      )
      throw new Error(`Danbooru autocomplete error: ${response.status}`)
    }

    const data = await response.json()

    console.log('Autocomplete response:', data)

    const sortedData = data
      .filter(item => item.type === 'tag' && item.post_count > 0)
      .sort((a, b) => b.post_count - a.post_count)
      .slice(0, 10)

    return Response.json({
      success: true,
      data: sortedData
    })
  } catch (error) {
    console.error('Autocomplete error:', error)

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch autocomplete'
      },
      { status: 500 }
    )
  }
}
