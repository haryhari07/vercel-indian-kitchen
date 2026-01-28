'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import RecipeCard from '@/components/RecipeCard';
import { Recipe } from '@/data/types';

export default function SavedRecipesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/signin');
      } else {
        fetchSavedRecipes();
      }
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchSavedRecipes = async () => {
    try {
      const res = await fetch('/api/user/bookmarks');
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes);
      }
    } catch (error) {
      console.error('Failed to fetch saved recipes');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-500">Loading your saved recipes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">Saved Recipes</h1>
        <p className="text-gray-600">Your personal collection of favorite dishes.</p>
      </div>

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-orange-50 rounded-2xl border border-orange-100">
          <span className="text-4xl mb-4 block">📖</span>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No recipes saved yet</h3>
          <p className="text-gray-600 mb-6">Start exploring and bookmark recipes you want to try!</p>
          <Link href="/recipes" className="btn btn-primary">
            Explore Recipes
          </Link>
        </div>
      )}
    </div>
  );
}
