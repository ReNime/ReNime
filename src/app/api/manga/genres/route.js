import axios from "axios";
import { NextResponse } from "next/server";

const BASE_URL = "https://api.mangadex.org";

export async function GET() {
  try {
    const response = await axios.get(`${BASE_URL}/manga/tag`);

    return NextResponse.json(response.data.data);
  } catch (error) {
    console.error("[API] Failed to fetch genres:", error.message);

    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 }
    );
  }
}
