import axios from 'axios'

const apiUrl = 'https://komiku-alpha.vercel.app'

/**
 * =========================
 * UTIL
 * =========================
 */

/**
 * "/detail-komik/solo-leveling-id" -> "solo-leveling-id"
 */
function extractSlug(apiDetailLink = '') {
  if (!apiDetailLink) return ''
  return apiDetailLink.split('/').pop()
}

/**
 * Ambil array data aman dari response
 */
function normalizeList(resData) {
  if (Array.isArray(resData)) return resData
  if (Array.isArray(resData?.data)) return resData.data
  return []
}

/**
 * =========================
 * REKOMENDASI
 * =========================
 * Output (buat MangaGrid):
 * {
 *   title,
 *   thumbnail,
 *   slug,
 *   detailUrl,
 *   originalLink
 * }
 */
export async function fetchPopularManga() {
  const res = await axios.get(`${apiUrl}/rekomendasi`)
  const list = normalizeList(res.data)

  return list.map(item => ({
    title: item.title,
    thumbnail: item.thumbnail,
    slug: extractSlug(item.apiDetailLink),
    detailUrl: item.apiDetailLink,
    originalLink: item.originalLink
  }))
}

export async function fetchLatestManga() {
  const res = await axios.get(`${apiUrl}/terbaru`)
  return res.data
}

/**
 * =========================
 * DETAIL MANGA
 * =========================
 * slug contoh: kimetsu-no-yaiba-indonesia
 */
export async function fetchMangaDetail(slug) {
  if (!slug) throw new Error('Slug is required')

  const res = await axios.get(`${apiUrl}/detail-komik/${slug}`)
  return res.data
}

/**
 * =========================
 * SEARCH MANGA
 * =========================
 * Output sama seperti rekomendasi
 */
export async function searchManga(query) {
  if (!query) return []

  const res = await axios.get(
    `${apiUrl}/search?query=${encodeURIComponent(query)}`
  )

  const list = normalizeList(res.data)

  return list.map(item => ({
    title: item.title,
    thumbnail: item.thumbnail,
    slug: extractSlug(item.apiDetailLink),
    detailUrl: item.apiDetailLink,
    originalLink: item.originalLink
  }))
}

/**
 * =========================
 * CHAPTER IMAGES
 * =========================
 * chapterSlug contoh: kimetsu-no-yaiba/1
 */
export async function fetchChapterImages(mangaSlug, chapterId) {
  const res = await fetch(
    `https://komiku-alpha.vercel.app/baca-chapter/${encodeURIComponent(mangaSlug)}/${encodeURIComponent(chapterId)}`,
    { cache: 'no-store' }
  )

  if (!res.ok) throw new Error('Failed to fetch chapter images')

  const data = await res.json()

  // ambil URL image saja
  const images = Array.isArray(data.images)
    ? data.images.map(img => img.src)
    : []

  const prev = data.navigation?.prevChapter?.chapter || null
  const next = data.navigation?.nextChapter?.chapter || null

  return { images, prev, next }
}
