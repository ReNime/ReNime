// app/components/CommentSection.jsx

"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ChatBubbleLeftIcon, TrashIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon as ChatBubbleLeftSolidIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

function CommentItem({ comment, onReply, onDelete, currentUserId, depth = 0 }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    await onReply(comment.id, replyContent);
    setReplyContent('');
    setShowReplyForm(false);
    setIsSubmitting(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3' : ''}`}>
      <div className="bg-theme-tertiary rounded-lg p-4 border border-theme">
        <div className="flex items-start gap-3">
          {comment.user.image ? (
            <img src={comment.user.image} alt={comment.user.name} className="w-10 h-10 rounded-full" />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                 style={{ background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))' }}>
              {comment.user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-theme-primary">{comment.user.name}</span>
              <span className="text-xs text-theme-tertiary">{formatDate(comment.createdAt)}</span>
            </div>
            
            <p className="text-theme-secondary mb-3 whitespace-pre-wrap">{comment.content}</p>
            
            <div className="flex items-center gap-3">
              {currentUserId && depth < 2 && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-sm flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--accent-from)' }}
                >
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                  Balas
                </button>
              )}
              
              {currentUserId === comment.userId && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-sm flex items-center gap-1 text-red-500 hover:opacity-80 transition-opacity"
                >
                  <TrashIcon className="h-4 w-4" />
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>

        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-3 ml-13">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Tulis balasan..."
              className="w-full bg-theme-secondary text-theme-primary border border-theme rounded-lg p-3 focus:outline-none focus:ring-2 resize-none"
              style={{ focusRing: 'var(--accent-from)' }}
              rows="2"
              disabled={isSubmitting}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={isSubmitting || !replyContent.trim()}
                className="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                style={{ background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))' }}
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                className="px-4 py-2 rounded-lg font-semibold bg-theme-tertiary text-theme-secondary hover:bg-theme-primary transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ episodeId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [episodeId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?episodeId=${episodeId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, episodeId }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    if (!session) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, episodeId, parentId }),
      });

      if (response.ok) {
        await fetchComments();
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Yakin ingin menghapus komentar ini?')) return;

    try {
      const response = await fetch(`/api/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="bg-theme-secondary border border-theme rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <ChatBubbleLeftSolidIcon className="h-6 w-6" style={{ color: 'var(--accent-from)' }} />
        <span className="gradient-theme-text">Komentar ({comments.length})</span>
      </h2>

      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis komentar..."
            className="w-full bg-theme-tertiary text-theme-primary border border-theme rounded-lg p-4 focus:outline-none focus:ring-2 resize-none"
            style={{ focusRing: 'var(--accent-from)' }}
            rows="3"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="mt-3 px-6 py-2.5 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: 'linear-gradient(to right, var(--accent-from), var(--accent-to))' }}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Komentar'}
          </button>
        </form>
      ) : (
        <div className="bg-theme-tertiary rounded-lg p-4 mb-6 border-l-4" style={{ borderColor: 'var(--accent-from)' }}>
          <p className="text-theme-secondary">
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent-from)' }}>
              Login
            </Link>
            {' '}untuk berkomentar
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-theme-tertiary rounded-lg p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-theme-primary"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-theme-primary rounded w-32"></div>
                  <div className="h-3 bg-theme-primary rounded w-full"></div>
                  <div className="h-3 bg-theme-primary rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <ChatBubbleLeftIcon className="h-16 w-16 mx-auto mb-3 text-theme-tertiary" />
          <p className="text-theme-tertiary">Belum ada komentar. Jadilah yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onDelete={handleDelete}
              currentUserId={session?.user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
