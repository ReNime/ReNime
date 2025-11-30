// File: pages/api/manga/search.js
import axios from 'axios';

const BASE_URL = 'https://api.mangadex.org';

function hasCoverArt(manga) {
  return manga.relationships?.some(rel => rel.type === 'cover_art');
}

export default async function handler(req, res) {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const response = await axios.get(`${BASE_URL}/manga`, {
      params: {
        title: query,
        includes: ['cover_art'],
        limit: 100, // Ambil lebih banyak
        contentRating: ['safe', 'suggestive', 'erotica'],
      },
    });

    const results = response.data.data.filter(hasCoverArt);
    res.status(200).json(results);
  } catch (error) {
    console.error('[API] /api/manga/search error:', error.message);
    res.status(500).json({ message: 'Failed to search manga' });
  }
}
