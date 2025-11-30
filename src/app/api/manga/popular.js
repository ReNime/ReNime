// File: pages/api/manga/popular.js

import axios from 'axios';

const BASE_URL = 'https://api.mangadex.org';

// Utility untuk filter hanya manga yang punya cover_art
function hasCoverArt(manga) {
  return manga.relationships?.some(rel => rel.type === 'cover_art');
}

export default async function handler(req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/manga`, {
      params: {
        limit: 40,
        order: { followedCount: 'desc' },
        contentRating: ['safe', 'suggestive'],
        includes: ['cover_art'],
        hasAvailableChapters: true,
      },
    });

    const data = response.data.data.filter(hasCoverArt);
    res.status(200).json(data);
  } catch (error) {
    console.error('[API] /api/manga/popular error:', error.message);
    res.status(500).json({ message: 'Failed to fetch popular manga' });
  }
}
