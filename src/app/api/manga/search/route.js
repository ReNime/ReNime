import { NextResponse } from "next/server";

const KOMIKU_API_BASE = "https://komiku-alpha.vercel.app";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("q"); // pakai "q" supaya sama kayak query param

  if (!keyword) {
    return NextResponse.json(
      { status: false, message: "Keyword is required", data: [] },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `${KOMIKU_API_BASE}/search?q=${encodeURIComponent(keyword)}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch komiku search: ${res.status}`);
    }

    const komikuData = await res.json();

    // Map data supaya sesuai kebutuhan frontend
    const mapped = (komikuData.data || []).map((item) => ({
      title: item.title,
      altTitle: item.altTitle || "",
      slug: item.slug,
      href: item.href,
      thumbnail: item.thumbnail,
    }));

    return NextResponse.json({
      status: true,
      message: komikuData.message || "Search success",
      keyword,
      total: komikuData.total || 0,
      data: mapped,
    });
  } catch (error) {
    console.error("[API SEARCH ERROR]", error);

    return NextResponse.json(
      { status: false, message: "Failed to fetch search", data: [] },
      { status: 500 }
    );
  }
}
