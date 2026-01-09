import axios from "axios";
import { NextResponse } from "next/server";

const BASE_URL = "https://api.mangadex.org";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mangaId = searchParams.get("mangaId");

  if (!mangaId) {
    return NextResponse.json(
      { message: "Manga ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(`${BASE_URL}/chapter`, {
      params: {
        manga: mangaId,
        limit: 100,
        translatedLanguage: ["en", "id"],
        order: { chapter: "desc" },
      },
    });

    return NextResponse.json(response.data.data);
  } catch (error) {
    console.error("[API] /api/manga/chapters error:", error.message);

    return NextResponse.json(
      { message: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}
