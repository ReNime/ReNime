import { NextResponse } from 'next/server'
import { AuthUserSession } from '@/app/libs/auth'
import prisma from '@/libs/prismadb'

/**
 * GET /api/manga/favorites
 * Ambil semua manga favorite user
 */
export async function GET() {
  const user = await AuthUserSession()

  if (!user?.id) {
    return NextResponse.json([], { status: 200 })
  }

  const favorites = await prisma.mangaFavorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(favorites)
}

/**
 * POST /api/manga/favorites
 * Tambah manga ke favorites
 */
export async function POST(req) {
  const user = await AuthUserSession()

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { mangaId, title, image } = await req.json()

  if (!mangaId || !title || !image) {
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    )
  }

  try {
    const fav = await prisma.mangaFavorite.create({
      data: {
        userId: user.id,
        mangaId,
        title,
        image
      }
    })

    return NextResponse.json(fav)
  } catch (err) {
    // Duplicate favorite
    if (err.code === 'P2002') {
      return NextResponse.json(
        { error: 'Already favorited' },
        { status: 409 }
      )
    }

    console.error(err)
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/manga/favorites
 * Hapus manga dari favorites
 */
export async function DELETE(req) {
  const user = await AuthUserSession()

  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { mangaId } = await req.json()

  if (!mangaId) {
    return NextResponse.json(
      { error: 'mangaId required' },
      { status: 400 }
    )
  }

  await prisma.mangaFavorite.delete({
    where: {
      userId_mangaId: {
        userId: user.id,
        mangaId
      }
    }
  })

  return NextResponse.json({ success: true })
}
