
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

    const { requestId } = await request.json();
    const userId = session.user.id;

    const friendRequest = await client.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!friendRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (friendRequest.receiverId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await client.friendRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject request error:', error);
    return NextResponse.json({ error: 'Failed to reject request' }, { status: 500 });
  }
}
