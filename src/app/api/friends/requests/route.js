
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

    const requests = await client.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'pending'
      },
      include: {
        sender: {
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

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json({ error: 'Failed to load requests' }, { status: 500 });
  }
}
