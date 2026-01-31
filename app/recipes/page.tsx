import RecipeCard from '@/components/RecipeCard';
import { recipes } from '@/data/recipes';

export default function RecipesPage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <div className="text-center">
        <h1 className="section-title mb-2">All Recipes</h1>
        <p className="section-subtitle">
          Browse our collection of authentic Indian recipes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {recipes.map((recipe, index) => (
          <RecipeCard key={recipe.id} recipe={recipe} priority={index < 4} />
        ))}
      </div>
    </div>
  );
}
