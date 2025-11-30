
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import client from '@/app/libs/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const friendships = await client.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const friends = friendships.map(friendship => 
      friendship.user1Id === userId ? friendship.user2 : friendship.user1
    );

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('List friends error:', error);
    return NextResponse.json({ error: 'Failed to load friends' }, { status: 500 });
  }
}
