import axios from "axios";
import { NextResponse } from "next/server";

const BASE_URL = "https://api.mangadex.org";

function hasCoverArt(manga) {
  return manga.relationships?.some((rel) => rel.type === "cover_art");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { includedTags } = body;

    if (
      !includedTags ||
      !Array.isArray(includedTags) ||
      includedTags.length === 0
    ) {
      return NextResponse.json(
        { message: "includedTags (genre IDs) are required" },
        { status: 400 }
      );
    }

    const response = await axios.get(`${BASE_URL}/manga`, {
      params: {
        includedTags,
        includedTagsMode: "AND",
        includes: ["cover_art"],
        limit: 40,
        contentRating: [
          "safe",
          "suggestive",
          "erotica",
          "pornographic",
        ],
      },
    });

    const filtered = (response.data.data || []).filter(hasCoverArt);

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("[API] /api/manga/filter error:", error.message);

    return NextResponse.json(
      { message: "Failed to filter manga" },
      { status: 500 }
    );
  }
}
