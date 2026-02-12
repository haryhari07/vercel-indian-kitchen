
import { db } from '@/lib/db';
import RecipesList from '@/components/RecipesList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Recipes - Browse Authentic Indian Dishes',
  description: 'Explore our complete collection of traditional Indian recipes from every state.',
  alternates: {
    canonical: '/recipes',
  },
};

export const dynamic = 'force-dynamic'; // Ensure we get fresh data

export default async function RecipesPage() {
  // Get recipes and reverse to show newest first
  const allRecipes = await db.getRecipes();
  const recipes = Array.isArray(allRecipes) ? [...allRecipes].reverse() : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Authentic Indian Recipes',
    description: 'Browse our complete collection of traditional Indian recipes from every state.',
    url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'}/recipes`,
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
          name: 'All Recipes',
          item: `${process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'}/recipes`,
        },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: recipes.map((recipe, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog'}/recipe/${recipe.slug}`,
        name: recipe.title,
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
