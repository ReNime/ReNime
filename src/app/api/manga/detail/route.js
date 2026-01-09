import axios from "axios";
import { NextResponse } from "next/server";

const BASE_URL = "https://api.mangadex.org";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { message: "Manga ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(`${BASE_URL}/manga/${id}`, {
      params: {
        includes: ["author", "artist", "cover_art"],
        "contentRating[]": [
          "safe",
          "suggestive",
          "erotica",
          "pornographic",
        ],
      },
    });

    const manga = response.data?.data;

    if (!manga || Object.keys(manga).length === 0) {
      return NextResponse.json(
        { message: "Manga not found or removed" },
        { status: 404 }
      );
    }

    return NextResponse.json(manga);
  } catch (error) {
    console.error("[API] /api/manga/detail error:", error.message);

    return NextResponse.json(
      { message: "Failed to fetch manga detail" },
      { status: 500 }
    );
  }
}
