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
    const friendId = searchParams.get('friendId');
    const sinceId = searchParams.get('since'); // For polling: get messages after this ID

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID required' }, { status: 400 });
    }

    const userId = session.user.id;

    // Build the query conditions
    const whereCondition = {
      OR: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId }
      ]
    };

    // If polling for new messages, only get messages after the last known ID
    if (sinceId) {
      whereCondition.id = {
        gt: sinceId
      };
    }

    const messages = await client.message.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'asc'
      },
      take: sinceId ? 50 : 100 // Limit: 50 for polling, 100 for initial load
    });

    // Mark messages as read (only unread messages from friend)
    if (!sinceId || messages.length > 0) {
      await client.message.updateMany({
        where: {
          senderId: friendId,
          receiverId: userId,
          read: false
        },
        data: {
          read: true
        }
      });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}
