import { NextResponse } from 'next/server'
import { getAuthSession } from '@/src/libs/auth-libs'
import { prisma } from '@/src/libs/prisma'

/**
 * GET /api/manga/favorites
 * Ambil semua manga favorite user
 */
export async function GET() {
  const session = await getAuthSession()

  if (!session?.user?.id) {
    return NextResponse.json([], { status: 200 })
  }

  const favorites = await prisma.mangaFavorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(favorites)
}

/**
 * POST /api/manga/favorites
 * Tambah manga ke favorites
 */
export async function POST(req) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
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
        userId: session.user.id,
        mangaId,
        title,
        image
      }
    })

    return NextResponse.json(fav)
  } catch (err) {
    // Duplicate favorite (already exists)
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
  const session = await getAuthSession()
  if (!session?.user?.id) {
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
        userId: session.user.id,
        mangaId
      }
    }
  })

  return NextResponse.json({ success: true })
}
