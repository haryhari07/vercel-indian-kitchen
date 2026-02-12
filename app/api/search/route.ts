import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { states } from '@/data/recipes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim().toLowerCase();

  if (!q) {
    return NextResponse.json({ recipeMatches: [], stateMatches: [] });
  }

  const recipesData = await db.getRecipes();
  const allRecipes = Array.isArray(recipesData) ? recipesData : [];
  
  const recipeMatches = allRecipes.filter(
    r =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.state.toLowerCase().includes(q)
  ).slice(0, 5);

  const stateMatches = states.filter(
    s =>
      s.name.toLowerCase().includes(q) ||
      s.region.toLowerCase().includes(q)
  ).slice(0, 5);

  return NextResponse.json({ recipeMatches, stateMatches });
}
