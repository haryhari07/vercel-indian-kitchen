
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Recipe } from '@/lib/db';

export default function AdminRecipesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
      } else {
        fetchRecipes();
      }
    }
  }, [user, isLoading, router]);

  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes');
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes);
      }
    } catch (error) {
      console.error('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const res = await fetch(`/api/recipes/${slug}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setRecipes(recipes.filter(r => r.slug !== slug));
      } else {
        alert('Failed to delete recipe');
      }
    } catch (error) {
      console.error('Delete failed', error);
      alert('Delete failed');
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-500">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Recipe Management</h1>
          <p className="text-gray-500 mt-1">Manage, edit, and create recipes</p>
        </div>
        <Link 
          href="/admin/recipes/new"
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          + Add New Recipe
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Dietary</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {recipes.map((recipe) => (
                <tr key={recipe.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{recipe.title}</div>
                    <div className="text-xs text-gray-500">{recipe.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{recipe.state}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {recipe.dietary.map(d => (
                        <span key={d} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-100">
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    ⭐ {recipe.rating} ({recipe.reviewCount})
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <Link href={`/recipe/${recipe.slug}`} target="_blank" className="text-blue-600 hover:text-blue-900">
                        View
                      </Link>
                      <button 
                        onClick={() => handleDelete(recipe.slug)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
