import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// In-memory store for typing status (use Redis in production)
const typingStatus = new Map();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get('friendId');

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID required' }, { status: 400 });
    }

    // Check if friend is typing to current user
    const key = `${friendId}-${session.user.id}`;
    const typingData = typingStatus.get(key);

    // Check if typing status is still valid (within last 5 seconds)
    const isTyping = typingData && (Date.now() - typingData.timestamp < 5000);

    if (!isTyping && typingData) {
      typingStatus.delete(key);
    }

    return NextResponse.json({ isTyping });
  } catch (error) {
    console.error('Get typing status error:', error);
    return NextResponse.json({ error: 'Failed to get typing status' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { friendId, isTyping } = await request.json();

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID required' }, { status: 400 });
    }

    const key = `${session.user.id}-${friendId}`;

    if (isTyping) {
      // Set typing status with timestamp
      typingStatus.set(key, {
        userId: session.user.id,
        friendId,
        timestamp: Date.now()
      });
    } else {
      // Remove typing status
      typingStatus.delete(key);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update typing status error:', error);
    return NextResponse.json({ error: 'Failed to update typing status' }, { status: 500 });
  }
      }
