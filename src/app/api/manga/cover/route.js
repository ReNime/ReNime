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
    const response = await axios.get(`${BASE_URL}/manga/${mangaId}`, {
      params: { includes: ["cover_art"] },
    });

    const manga = response.data.data;
    const coverRel = manga.relationships?.find(
      (rel) => rel.type === "cover_art"
    );
    const coverFileName = coverRel?.attributes?.fileName;

    if (!coverFileName) {
      return NextResponse.json(
        { message: "Cover not found" },
        { status: 404 }
      );
    }

    const coverUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`;

    return NextResponse.json({ url: coverUrl });
  } catch (error) {
    console.error("[API] /api/manga/cover error:", error.message);

    return NextResponse.json(
      { message: "Failed to fetch cover" },
      { status: 500 }
    );
  }
}
