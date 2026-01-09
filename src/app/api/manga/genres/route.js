// File: pages/api/manga/genres.js

import axios from 'axios';

const BASE_URL = 'https://api.mangadex.org';

export default async function handler(req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/manga/tag`);
    res.status(200).json(response.data.data);
  } catch (error) {
    console.error('[API] Failed to fetch genres:', error.message);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
}
