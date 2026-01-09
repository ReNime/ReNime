import axios from "axios";
import { NextResponse } from "next/server";

// Ambil file cover
function getCoverFileName(manga) {
  const cover = manga.relationships?.find(
    (rel) => rel.type === "cover_art"
  );
  return cover?.attributes?.fileName || null;
}

// Ambil judul lokal
function getTitle(manga) {
  const titles = manga.attributes?.title || {};
  return titles.en || Object.values(titles)[0] || "Untitled";
}

// Validasi cover_art
function hasCoverArt(manga) {
  return manga.relationships?.some((rel) => rel.type === "cover_art");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let url =
    "https://api.mangadex.org/manga?limit=12&includes[]=cover_art&contentRating[]=safe";

  if (type === "ongoing" || type === "completed") {
    url += `&status[]=${type}&order[followedCount]=desc`;
  } else if (type === "top_rated") {
    url += "&order[rating]=desc";
  } else if (type === "latest") {
    url += "&order[latestUploadedChapter]=desc";
  }

  try {
    const response = await axios.get(url);
    const mangas = response.data.data || [];

    const formatted = mangas
      .filter(hasCoverArt)
      .map((manga) => ({
        id: manga.id,
        title: getTitle(manga),
        coverFileName: getCoverFileName(manga),
        status: manga.attributes.status,
      }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("[API] /api/manga/section error:", err.message);

    return NextResponse.json(
      { error: "Failed to fetch manga section" },
      { status: 500 }
    );
  }
}
