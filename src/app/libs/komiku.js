import axios from 'axios'

const apiUrl = 'https://komiku-alpha.vercel.app'

/**
 * =========================
 * REKOMENDASI
 * =========================
 * Normalized output (buat MangaGrid):
 * {
 *   title,
 *   cover,
 *   slug,
 *   detailUrl
 * }
 */
export async function fetchPopularManga() {
  const res = await axios.get(`${apiUrl}/rekomendasi`)

  return res.data.map(item => ({
    title: item.title,
    cover: item.thumbnail,
    slug: extractSlug(item.apiDetailLink),
    detailUrl: item.apiDetailLink,
    originalLink: item.originalLink
  }))
}

/**
 * =========================
 * DETAIL MANGA
 * =========================
 * slug contoh: solo-leveling-id
 */
export async function fetchMangaDetail(slug) {
  const res = await axios.get(
    `${apiUrl}/detail-komik/${slug}`
  )
  return res.data
}

/**
 * =========================
 * SEARCH
 * =========================
 */
export async function searchManga(query) {
  const res = await axios.get(
    `${apiUrl}/search?query=${encodeURIComponent(query)}`
  )

  return res.data.map(item => ({
    title: item.title,
    cover: item.thumbnail,
    slug: extractSlug(item.apiDetailLink),
    detailUrl: item.apiDetailLink
  }))
}

/**
 * =========================
 * CHAPTER IMAGES
 * =========================
 */
export async function fetchChapterImages(chapterSlug) {
  const res = await axios.get(
    `${apiUrl}/chapter/${chapterSlug}`
  )
  return res.data
}

/**
 * =========================
 * UTIL
 * =========================
 */
function extractSlug(apiDetailLink = '') {
  // "/detail-komik/solo-leveling-id" -> "solo-leveling-id"
  return apiDetailLink.split('/').pop()
}
