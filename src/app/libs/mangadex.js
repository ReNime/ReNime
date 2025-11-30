import axios from 'axios'

export function hasCoverArt(manga) {
  return manga.relationships?.some((rel) => rel.type === 'cover_art')
}

export async function fetchPopularManga() {
  const res = await axios.get('/api/manga/popular')
  return res.data
}

export async function fetchMangaDetail(id) {
  const res = await axios.get(`/api/manga/detail?id=${id}`)
  return res.data
}

export async function fetchChapters(mangaId) {
  const res = await axios.get(`/api/manga/chapters?mangaId=${mangaId}`)
  return res.data
}

export async function fetchChapterImages(chapterId) {
  try {
    const res = await axios.get(`/api/manga/chapter-images?chapterId=${chapterId}`)
    const { baseUrl, chapter } = res.data

    if (!baseUrl || !chapter?.hash) throw new Error('Invalid chapter response')

    const cleanBaseUrl = baseUrl.replace(/\\/g, '')

    const mangaRel = chapter?.relationships?.find((rel) => rel.type === 'manga')
    const mangaId = mangaRel?.id
    const currentChapter = chapter?.chapter || null

    let next = null
    let prev = null

    if (mangaId && currentChapter) {
      const listRes = await axios.get(
        `https://api.mangadex.org/chapter?manga=${mangaId}&order[chapter]=asc&limit=500`
      )

      const all = listRes.data?.data || []
      const index = all.findIndex((ch) => ch.id === chapterId)

      if (index > 0) prev = all[index - 1]?.id || null
      if (index < all.length - 1) next = all[index + 1]?.id || null
    }

    return {
      baseUrl: cleanBaseUrl,
      hash: chapter.hash,
      data: chapter.data || [],
      dataSaver: chapter.dataSaver || [],
      next,
      prev,
    }
  } catch (error) {
    console.error('fetchChapterImages error:', error)
    return null
  }
}

export async function searchManga(query) {
  const res = await axios.get(`/api/manga/search?query=${query}`)
  const results = res.data
  const lowered = query.toLowerCase().trim()

  return results.filter((manga) => {
    const titles = [
      ...Object.values(manga.attributes.title || {}),
      ...manga.attributes.altTitles.flatMap((alt) => Object.values(alt)),
    ]
    return titles.some(
      (title) => typeof title === 'string' && title.toLowerCase().includes(lowered)
    )
  })
}

export async function fetchGenres() {
  const res = await axios.get('/api/manga/genres')
  return res.data
}

export async function getMangaByFilter(params) {
  try {
    const res = await axios.post('/api/manga/filter', params)
    const results = res.data
    return results.filter((manga) => hasCoverArt(manga))
  } catch (error) {
    console.error('getMangaByFilter error:', error)
    return []
  }
}

export async function fetchMangaByGenre(tagId) {
  const res = await axios.get(`/api/manga/genre?id=${tagId}`)
  return res.data
}

export function getCoverImage(mangaId, fileName) {
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`
}

export function getLocalizedTitle(titleObj) {
  return (
    titleObj.en ||
    titleObj.ja ||
    titleObj['en-us'] ||
    Object.values(titleObj)[0] ||
    'Untitled'
  )
}

export function sortChapters(chapters) {
  return chapters.sort((a, b) => {
    const numA = parseFloat(a.attributes.chapter || '0')
    const numB = parseFloat(b.attributes.chapter || '0')
    return numB - numA
  })
}

export async function getMangaSection(type) {
  try {
    const res = await axios.get(`/api/manga/section?type=${type}`)
    const results = res.data
    return results.filter((manga) => hasCoverArt(manga))
  } catch (err) {
    console.error('getMangaSection error:', err)
    return []
  }
        }
