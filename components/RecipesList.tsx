
'use client';

import { useState } from 'react';
import RecipeCard from '@/components/RecipeCard';
import { Recipe } from '@/lib/db';
import { states } from '@/data/recipes';

interface RecipesListProps {
  initialRecipes: Recipe[];
}

export default function RecipesList({ initialRecipes }: RecipesListProps) {
  const [filterState, setFilterState] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterDietary, setFilterDietary] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const regions = Array.from(new Set(states.map(s => s.region))).sort();
  const dietaryOptions = ['Vegetarian', 'Non-Vegetarian', 'Gluten-Free', 'Vegan'];

  const filteredRecipes = initialRecipes.filter(recipe => {
    const matchesState = filterState === 'All' || recipe.state === filterState;
    const matchesRegion = filterRegion === 'All' || recipe.region === filterRegion;
    const matchesDietary = filterDietary === 'All' || (recipe.dietary && recipe.dietary.includes(filterDietary));
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.region.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesState && matchesRegion && matchesDietary && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search recipes..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <option value="All">All States</option>
              {states.map(s => (
                <option key={s.slug} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
            >
              <option value="All">All Regions</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Dietary Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dietary</label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              value={filterDietary}
              onChange={(e) => setFilterDietary(e.target.value)}
            >
              <option value="All">All Preferences</option>
              {dietaryOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} priority={false} />
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No recipes found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
