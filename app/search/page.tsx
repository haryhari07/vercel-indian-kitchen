
import { db } from '@/lib/db';
import { states } from '@/data/recipes';
import RecipeCard from '@/components/RecipeCard';
import StateCard from '@/components/StateCard';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q: rawQ } = await searchParams;
  const q = (rawQ || '').trim().toLowerCase();
  
  const recipesData = await db.getRecipes();
  const allRecipes = Array.isArray(recipesData) ? recipesData : [];

  const recipeMatches = q
    ? allRecipes.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q)
      )
    : [];

  const stateMatches = q
    ? states.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.region.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <div className="text-center">
        <h1 className="section-title mb-2">Search</h1>
        <p className="section-subtitle">
          Showing results for: <span className="text-gray-800 font-semibold">“{q}”</span>
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-serif font-bold text-gray-900">States</h2>
        {stateMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stateMatches.map(s => (
              <StateCard key={s.slug} state={s} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No states match your search.</p>
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-serif font-bold text-gray-900">Recipes</h2>
        {recipeMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recipeMatches.map(r => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recipes match your search.</p>
        )}
      </section>
    </div>
  );
}
