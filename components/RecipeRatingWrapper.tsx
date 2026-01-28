
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Rating from './Rating';
import Link from 'next/link';

interface RecipeRatingWrapperProps {
  recipeId: string; // This is actually the slug
  initialRating: number;
  initialReviewCount: number;
}

export default function RecipeRatingWrapper({ recipeId, initialRating, initialReviewCount }: RecipeRatingWrapperProps) {
  const { isAuthenticated, user } = useAuth();
  const [rating, setRating] = useState(initialRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load fresh data from API
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/recipe/${recipeId}/rate`);
        if (res.ok) {
          const data = await res.json();
          if (data.userRating) setUserRating(data.userRating);
          if (data.averageRating) setRating(data.averageRating);
          if (data.reviewCount !== undefined) setReviewCount(data.reviewCount);
        }
      } catch (e) {
        console.error('Failed to fetch rating data');
      }
    };
    fetchData();
  }, [recipeId, isAuthenticated]); // Refetch when auth state changes

  const handleRatingChange = async (newRating: number) => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/recipe/${recipeId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserRating(newRating);
        if (data.averageRating) setRating(data.averageRating);
        if (data.reviewCount !== undefined) setReviewCount(data.reviewCount);
      }
    } catch (e) {
      console.error('Failed to submit rating');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-orange-50 rounded-xl border border-orange-100">
      <h3 className="text-sm font-semibold text-gray-700">Rate this Recipe</h3>
      <Rating 
        value={userRating || rating} 
        reviewCount={reviewCount} 
        readOnly={!isAuthenticated || isLoading} 
        onChange={handleRatingChange}
        size="lg"
      />
      {userRating && (
        <p className="text-xs text-green-600 font-medium">
          Your rating: {userRating}/5 (Click to change)
        </p>
      )}
      {!isAuthenticated && (
        <p className="text-xs text-gray-500">
          <Link href="/signin" className="text-orange-600 hover:underline">Sign in</Link> to rate
        </p>
      )}
    </div>
  );
}
