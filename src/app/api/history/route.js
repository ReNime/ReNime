import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/app/libs/prisma";

// =========================
// GET — Load Watch History
// =========================
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    const history = await prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { watchedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("GET_HISTORY_ERROR:", error);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}

// =========================
// POST — UPSERT History
// =========================
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { animeId, animeTitle, episode, coverImage } = body;

    if (!animeId || !episode) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // UPSERT — update if exists, create if not
    const watchHistory = await prisma.watchHistory.upsert({
      where: {
        userId_episode: {
          userId: user.id,
          episode: episode, // must match @@unique in schema
        },
      },
      update: {
        animeTitle,
        coverImage,
      },
      create: {
        userId: user.id,
        animeId,
        animeTitle,
        episode,
        coverImage,
      },
    });

    return NextResponse.json({ watchHistory });
  } catch (error) {
    console.error("POST_HISTORY_ERROR:", error);
    return NextResponse.json({ error: "Failed to add/update history" }, { status: 500 });
  }
}

// =========================
// DELETE — Remove 1 History
// =========================
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get("id");

    if (!historyId) {
      return new NextResponse("History ID required", { status: 400 });
    }

    await prisma.watchHistory.delete({
      where: {
        id: historyId,
        userId: user.id, // security: user only deletes own data
      },
    });

    return NextResponse.json({ message: "History deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE_HISTORY_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
