// app/api/comments/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust path if needed
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch comments for an episode
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');

    console.log('[GET Comments] EpisodeId:', episodeId);

    if (!episodeId) {
      return NextResponse.json(
        { error: 'Episode ID required' }, 
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        episodeId,
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('[GET Comments] Found comments:', comments.length);

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error('[GET Comments] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error.message }, 
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(request) {
  console.log('[POST Comment] Starting...');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('[POST Comment] Session:', session ? 'Found' : 'Not found');

    if (!session || !session.user) {
      console.log('[POST Comment] Unauthorized - No session');
      return NextResponse.json(
        { error: 'Unauthorized - Please login' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, episodeId, parentId } = body;

    console.log('[POST Comment] Data:', { content: content?.substring(0, 50), episodeId, parentId });

    if (!content || !episodeId) {
      console.log('[POST Comment] Missing required fields');
      return NextResponse.json(
        { error: 'Content and episode ID required' }, 
        { status: 400 }
      );
    }

    if (content.trim().length < 1) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' }, 
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment too long (max 1000 characters)' }, 
        { status: 400 }
      );
    }

    if (!session.user.id) {
      console.log('[POST Comment] No user ID in session');
      return NextResponse.json(
        { error: 'User ID not found in session' }, 
        { status: 400 }
      );
    }

    console.log('[POST Comment] Creating comment for user:', session.user.id);

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        episodeId: episodeId,
        userId: session.user.id,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    console.log('[POST Comment] Comment created:', comment.id);

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('[POST Comment] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment', details: error.message }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment
export async function DELETE(request) {
  console.log('[DELETE Comment] Starting...');
  
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    console.log('[DELETE Comment] CommentId:', commentId);

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID required' }, 
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' }, 
        { status: 404 }
      );
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' }, 
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    console.log('[DELETE Comment] Comment deleted:', commentId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE Comment] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment', details: error.message }, 
      { status: 500 }
    );
  }
}
