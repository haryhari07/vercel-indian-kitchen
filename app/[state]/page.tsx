import { notFound } from 'next/navigation';
import { states, recipes } from '@/data/recipes';
import RecipeCard from '@/components/RecipeCard';

export async function generateStaticParams() {
  return states.map((state) => ({
    state: state.slug,
  }));
}

interface PageProps {
  params: Promise<{ state: string }>;
}

export default async function StatePage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const state = states.find((s) => s.slug === stateSlug);

  if (!state) {
    notFound();
  }

  const stateRecipes = recipes.filter((recipe) => recipe.state === state.name);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">{state.name}</h1>
        <p className="text-orange-600 font-medium text-lg mb-4">{state.region}</p>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">{state.description}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold font-serif text-gray-800 mb-6 border-b pb-2">Recipes from {state.name}</h2>
        {stateRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stateRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-12">No recipes added for this state yet. Check back soon!</p>
        )}
      </div>
    </div>
  );
}
