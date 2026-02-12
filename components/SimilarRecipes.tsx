
import Link from 'next/link';
import Image from 'next/image';
import { db, Recipe } from '@/lib/db';
import RecipeCard from './RecipeCard';

export default async function SimilarRecipes({ currentRecipe }: { currentRecipe: Recipe }) {
  // Logic to find similar recipes:
  // 1. Same state
  // 2. Overlapping dietary tags
  // 3. Exclude current recipe
  
  const allRecipes = await db.getRecipes();
  const recipes = Array.isArray(allRecipes) ? allRecipes : [];

  const similar = recipes
    .filter(r => r.slug !== currentRecipe.slug)
    .map(r => {
      let score = 0;
      if (r.state === currentRecipe.state) score += 3;
      
      const commonTags = r.dietary.filter(tag => currentRecipe.dietary.includes(tag));
      score += commonTags.length;
      
      return { recipe: r, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.recipe);


  if (similar.length === 0) return null;

  return (
    <div className="mt-16 print:hidden">
      <h2 className="text-2xl font-bold font-serif text-gray-900 mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
        <span className="text-orange-500 text-2xl">🍽️</span> You Might Also Like
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {similar.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
