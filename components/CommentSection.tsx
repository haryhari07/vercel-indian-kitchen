
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  timestamp: string;
  user: {
    name: string;
  };
}

export default function CommentSection({ slug }: { slug: string }) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/recipe/${slug}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/recipe/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments([data.comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to post comment', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 print:hidden">
      <h2 className="text-2xl font-bold font-serif text-gray-900 mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
        <span className="text-orange-500 text-2xl">💬</span> Comments
      </h2>

      {/* Comment Form */}
      <div className="mb-10">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--ak-primary)] to-[var(--ak-accent)] text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-grow">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts, tips, or questions..."
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none min-h-[100px] text-gray-700 placeholder-gray-400 bg-gray-50 focus:bg-white"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-orange-50 rounded-xl p-6 text-center border border-orange-100">
            <p className="text-gray-700 mb-4">Join the conversation! Log in to share your cooking experience.</p>
            <Link href={`/signin?redirect=/recipe/${slug}`} className="btn btn-primary">
              Log in to Comment
            </Link>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">Loading comments...</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold flex-shrink-0 border border-gray-200">
                {comment.user.name[0].toUpperCase()}
              </div>
              <div className="flex-grow">
                <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 relative group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-gray-900 text-sm">{comment.user.name}</h4>
                    <span className="text-xs text-gray-400">{formatDate(comment.timestamp)}</span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 italic">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}
