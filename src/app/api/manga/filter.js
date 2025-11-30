// File: pages/api/manga/filter.js

import axios from 'axios';

const BASE_URL = 'https://api.mangadex.org';

function hasCoverArt(manga) {
  return manga.relationships?.some(rel => rel.type === 'cover_art');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { includedTags } = req.body;

  if (!includedTags || !Array.isArray(includedTags) || includedTags.length === 0) {
    return res.status(400).json({ message: 'includedTags (genre IDs) are required' });
  }

  try {
    const response = await axios.get(`${BASE_URL}/manga`, {
      params: {
        includedTags,
        includedTagsMode: 'AND',
        includes: ['cover_art'],
        limit: 40,
        contentRating: ['safe', 'suggestive', 'erotica', 'pornographic'], // opsional: semua
      },
    });

    const filtered = response.data.data.filter(hasCoverArt);
    res.status(200).json(filtered);
  } catch (error) {
    console.error('[API] /api/manga/filter error:', error.message);
    res.status(500).json({ message: 'Failed to filter manga' });
  }
}
