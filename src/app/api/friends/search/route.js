
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

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] });
    }

    const currentUserId = session.user.id;

    // Search users by name or email
    const users = await client.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: currentUserId // Exclude current user
            }
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      },
      take: 20
    });

    // Check if friend request already sent or if already friends
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        // Check if already friends
        const friendship = await client.friendship.findFirst({
          where: {
            OR: [
              { user1Id: currentUserId, user2Id: user.id },
              { user1Id: user.id, user2Id: currentUserId }
            ]
          }
        });

        // Check if request already sent
        const requestSent = await client.friendRequest.findFirst({
          where: {
            senderId: currentUserId,
            receiverId: user.id,
            status: 'pending'
          }
        });

        return {
          ...user,
          isFriend: !!friendship,
          requestSent: !!requestSent
        };
      })
    );

    return NextResponse.json({ users: usersWithStatus });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}
