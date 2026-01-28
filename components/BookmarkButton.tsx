'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface BookmarkButtonProps {
  slug: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BookmarkButton({ slug, className = '', size = 'md' }: BookmarkButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkBookmark = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch(`/api/recipe/${slug}/bookmark`);
        if (res.ok) {
          const data = await res.json();
          setIsBookmarked(data.isBookmarked);
        }
      } catch (e) {
        console.error('Failed to check bookmark status');
      }
    };
    checkBookmark();
  }, [slug, isAuthenticated]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/recipe/${slug}/bookmark`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (e) {
      console.error('Failed to toggle bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={isLoading}
      className={`rounded-full transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 ${sizeClasses[size]} ${
        isBookmarked 
          ? 'bg-orange-500 text-white hover:bg-orange-600' 
          : 'bg-white text-gray-400 hover:text-orange-500 border border-gray-200 hover:border-orange-200'
      } ${className}`}
      aria-label={isBookmarked ? 'Remove from saved recipes' : 'Save recipe'}
      title={isBookmarked ? 'Remove from saved recipes' : 'Save recipe'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        className={iconSizes[size]}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </svg>
    </button>
  );
}
