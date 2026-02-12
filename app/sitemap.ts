import { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { states } from '@/data/recipes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://indiankitchen.blog';
  
  // Static routes
  const routes = [
    '',
    '/recipes',
    '/search',
    '/genie',
    '/signin',
    '/saved',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  }));

  // Recipe routes
  const allRecipes = await db.getRecipes();
  const recipes = Array.isArray(allRecipes) ? allRecipes : [];
  const recipeRoutes = recipes.map((recipe) => ({
    url: `${baseUrl}/recipe/${recipe.slug}`,
    lastModified: new Date(), // Ideally this would be recipe.updatedAt if available
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // State routes
  const stateRoutes = states.map((state) => ({
    url: `${baseUrl}/${state.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  return [...routes, ...stateRoutes, ...recipeRoutes];
}
