// app/api/comments/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; // Adjust path if needed
import prisma from '@/app/libs/prisma'; // Use your prisma instance

// GET - Fetch comments for an episode
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get('episodeId');

    if (!episodeId) {
      return NextResponse.json(
        { error: 'Episode ID required' }, 
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        episodeId,
        parentId: null, // Only get top-level comments
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

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: error.message }, 
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    console.log('Session:', session); // Debug log

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, episodeId, parentId } = body;

    console.log('Request body:', { content, episodeId, parentId }); // Debug log

    if (!content || !episodeId) {
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

    // Optional: Add max length validation
    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment too long (max 1000 characters)' }, 
        { status: 400 }
      );
    }

    // Make sure we have user ID
    if (!session.user.id) {
      return NextResponse.json(
        { error: 'User ID not found in session' }, 
        { status: 400 }
      );
    }

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

    console.log('Comment created:', comment); // Debug log

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment', details: error.message }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment
export async function DELETE(request) {
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

    // Check if user owns the comment
    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' }, 
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment', details: error.message }, 
      { status: 500 }
    );
  }
      }
