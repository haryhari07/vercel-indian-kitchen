
import { db } from '@/lib/db';
import RecipesList from '@/components/RecipesList';

export const dynamic = 'force-dynamic'; // Ensure we get fresh data

export default function RecipesPage() {
  // Get recipes and reverse to show newest first
  const recipes = [...db.getRecipes()].reverse();

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <div className="text-center">
        <h1 className="section-title mb-2">All Recipes</h1>
        <p className="section-subtitle">
          Browse our collection of authentic Indian recipes.
        </p>
      </div>

      <RecipesList initialRecipes={recipes} />
    </div>
  );
}
