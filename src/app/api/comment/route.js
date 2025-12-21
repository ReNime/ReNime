// app/api/comments/route.js

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      { error: 'Failed to fetch comments' }, 
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { content, episodeId, parentId } = await request.json();

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

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        episodeId,
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

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' }, 
      { status: 500 }
    );
  }
}

// DELETE - Delete a comment
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
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
      { error: 'Failed to delete comment' }, 
      { status: 500 }
    );
  }
}

// PATCH - Update a comment (optional feature)
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { commentId, content } = await request.json();

    if (!commentId || !content) {
      return NextResponse.json(
        { error: 'Comment ID and content required' }, 
        { status: 400 }
      );
    }

    if (content.trim().length < 1) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' }, 
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

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
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

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' }, 
      { status: 500 }
    );
  }
}
