import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get("chapterId");

  if (!chapterId) {
    return NextResponse.json(
      { message: "Chapter ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `https://api.mangadex.org/at-home/server/${chapterId}`
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error(
      "[API] /api/manga/chapter-images error:",
      error.message
    );

    return NextResponse.json(
      { message: "Failed to fetch chapter images" },
      { status: 500 }
    );
  }
}
