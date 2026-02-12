import { notFound } from 'next/navigation';
import { states } from '@/data/recipes';
import { db } from '@/lib/db';
import RecipeCard from '@/components/RecipeCard';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return states.map((state) => ({
    state: state.slug,
  }));
}

interface PageProps {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = states.find((s) => s.slug === stateSlug);

  if (!state) {
    return {
      title: 'State Not Found',
    };
  }

  return {
    title: `${state.name} Recipes - Authentic Traditional Dishes`,
    description: `Explore authentic recipes from ${state.name}, ${state.region}. ${state.description.substring(0, 150)}...`,
    openGraph: {
      title: `${state.name} Recipes | Indian Kitchen`,
      description: state.description,
      images: [
        {
          url: state.imageUrl,
          width: 1200,
          height: 630,
          alt: `${state.name} Food`,
        },
      ],
    },
    alternates: {
      canonical: `/${state.slug}`,
    },
  };
}

export default async function StatePage({ params }: PageProps) {
  const { state: stateSlug } = await params;
  const state = states.find((s) => s.slug === stateSlug);

  if (!state) {
    notFound();
  }

  const allRecipes = (await db.getRecipes()) || [];
  // Filter by state name exactly as stored in DB
  const stateRecipes = Array.isArray(allRecipes) ? allRecipes.filter((recipe) => recipe.state === state.name) : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${state.name} Recipes`,
    description: state.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'}/${state.slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: state.name,
          item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'}/${state.slug}`,
        },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: stateRecipes.map((recipe, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'}/recipe/${recipe.slug}`,
        name: recipe.title,
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">{state.name}</h1>
        <p className="text-orange-600 font-medium text-lg mb-4">{state.region}</p>
        <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">{state.description}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold font-serif text-gray-800 mb-6 border-b pb-2">Recipes from {state.name}</h2>
        {stateRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stateRecipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} priority={index < 3} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-12">No recipes added for this state yet. Check back soon!</p>
        )}
      </div>
    </div>
  );
}
