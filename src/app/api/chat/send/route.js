
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import client from '@/app/libs/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, content } = await request.json();
    const senderId = session.user.id;

    if (!receiverId || !content || !content.trim()) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Verify they are friends
    const friendship = await client.friendship.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId }
        ]
      }
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Not friends' }, { status: 403 });
    }

    const message = await client.message.create({
      data: {
        senderId,
        receiverId,
        content: content.trim(),
        read: false
      }
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
