import { NextResponse } from "next/server";
import util from "node:util";

export async function POST(req) {
  try {
    const body = await req.json();

    const targetUrl = "https://re-nai.vercel.app/api/chat";

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data && Array.isArray(data.anime)) {
      const animeList = data.anime.map((a) => ({
        id: a.id ?? Math.random(),
        title: a.title ?? "Untitled",
        coverImage: a.coverImage ?? "/default.png",
        score: a.averageScore ?? 0,
        popularity: a.popularity ?? 0,
        url: a.url ?? "#",
      }));

      return NextResponse.json({ type: "anime", data: animeList });
    }

    return NextResponse.json(
      {
        type: "text",
        reply: util.inspect(response, { depth: null }) 
       // reply: data?.reply ?? "Huwaa~ something went wrong... can you try again, senpai? 😖💔",
      },
      { status: response.status || 200 }
    );
  } catch (err) {
    console.error("ReNai API error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(err) },
      { status: 500 }
    );
  }
}


bantu cek in bg
