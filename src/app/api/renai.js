import { NextResponse } from "next/server";

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

    // Jika API mengembalikan list anime
    if (Array.isArray(data.anime)) {
      return NextResponse.json({
        type: "anime",
        anime: data.anime.map((a) => ({
          id: a.id ?? Math.random(),
          title: a.title ?? "Untitled",
          coverImage: a.coverImage ?? "/default.png",
          score: a.averageScore ?? 0,
          popularity: a.popularity ?? 0,
          url: a.url ?? "#",
        })),
      });
    }

    // fallback → teks dari AI
    return NextResponse.json(
      {
        type: "text",
        reply:
          data.reply ??
          "Huwaa~ something went wrong... can you try again, senpai? 😖💔",
      },
      { status: response.status }
    );
  } catch (err) {
    console.error("ReNai Proxy API error:", err);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err.message,
      },
      { status: 500 }
    );
  }
}

// Handle method lain
export function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}

export function PUT() {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}

export function DELETE() {
  return NextResponse.json(
    { error: "Method Not Allowed" },
    { status: 405 }
  );
}
