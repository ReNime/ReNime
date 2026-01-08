let accessToken = null
let expiredAt = 0

export async function getPixivAccessToken() {
  if (accessToken && Date.now() < expiredAt) {
    return accessToken
  }

  const body = new URLSearchParams({
    client_id: 'MOBrS0vK8lJ7w',
    client_secret: 'kZ9t3t5x8pGx',
    grant_type: 'refresh_token',
    refresh_token: process.env.PIXIV_REFRESH_TOKEN
  })

  const res = await fetch(
    'https://oauth.secure.pixiv.net/auth/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'PixivAndroidApp/5.0.234 (Android)'
      },
      body
    }
  )

  if (!res.ok) {
    const t = await res.text()
    throw new Error(t)
  }

  const json = await res.json()
  accessToken = json.access_token
  expiredAt = Date.now() + (json.expires_in - 60) * 1000

  return accessToken
}
