import axios from "axios";
import { NextResponse } from "next/server";

const BASE_URL = "https://api.mangadex.org";

// Utility untuk filter hanya manga yang punya cover_art
function hasCoverArt(manga) {
  return manga.relationships?.some(rel => rel.type === "cover_art");
}

export async function GET() {
  try {
    const response = await axios.get(`${BASE_URL}/manga`, {
      params: {
        limit: 40,
        order: { followedCount: "desc" },
        contentRating: ["safe", "suggestive"],
        includes: ["cover_art"],
        hasAvailableChapters: true
      }
    });

    const data = response.data.data.filter(hasCoverArt);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] /api/manga/popular error:", error.message);

    return NextResponse.json(
      { message: "Failed to fetch popular manga" },
      { status: 500 }
    );
  }
}
