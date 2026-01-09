import axios from "axios";
import { NextResponse } from "next/server";

const BASE_URL = "https://api.mangadex.org";

function hasCoverArt(manga) {
  return manga.relationships?.some((rel) => rel.type === "cover_art");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { message: "Query is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(`${BASE_URL}/manga`, {
      params: {
        title: query,
        includes: ["cover_art"],
        limit: 100,
        contentRating: ["safe", "suggestive", "erotica"],
      },
    });

    const results = response.data.data.filter(hasCoverArt);

    return NextResponse.json(results);
  } catch (error) {
    console.error("[API] /api/manga/search error:", error.message);

    return NextResponse.json(
      { message: "Failed to search manga" },
      { status: 500 }
    );
  }
}
