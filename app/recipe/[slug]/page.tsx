import { notFound } from 'next/navigation';
import { recipes } from '@/data/recipes';
import Link from 'next/link';
import Image from 'next/image';
import RecipeRatingWrapper from '@/components/RecipeRatingWrapper';
import BookmarkButton from '@/components/BookmarkButton';

export async function generateStaticParams() {
  return recipes.map((recipe) => ({
    slug: recipe.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = recipes.find((r) => r.slug === slug);

  if (!recipe) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6 text-sm breadcrumbs text-gray-500">
        <Link href="/" className="hover:text-orange-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${recipe.state.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-orange-600">{recipe.state}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{recipe.title}</span>
      </div>

      <header className="mb-8 text-center relative">
        <div className="absolute top-0 right-0 hidden md:block">
           <BookmarkButton slug={recipe.slug} size="lg" className="shadow-md" />
        </div>
        <div className="md:hidden absolute top-0 right-0">
           <BookmarkButton slug={recipe.slug} size="md" className="shadow-sm" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-gray-900 mb-4">{recipe.title}</h1>
        <div className="flex justify-center items-center gap-4 text-gray-600 text-sm md:text-base">
          <span>Prep: {recipe.prepTime}</span>
          <span>•</span>
          <span>Cook: {recipe.cookTime}</span>
          <span>•</span>
          <span>Serves: {recipe.servings}</span>
        </div>
        <div className="mt-4 flex justify-center gap-2">
           {recipe.dietary.map(tag => (
                <span key={tag} className="text-xs text-orange-800 bg-orange-100 px-3 py-1 rounded-full font-medium">{tag}</span>
            ))}
        </div>
        <div className="mt-6 flex justify-center items-center">
            <RecipeRatingWrapper 
              recipeId={recipe.slug} 
              initialRating={recipe.rating || 5} 
              initialReviewCount={recipe.reviewCount || 10} 
            />
        </div>
      </header>

      <div className="mb-12 rounded-xl overflow-hidden shadow-lg h-64 md:h-96 w-full relative">
        <Image 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-2xl font-bold font-serif text-gray-900 mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <span className="text-orange-500 text-2xl">🥘</span> Ingredients
            </h2>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-baseline p-3 rounded-lg hover:bg-orange-50 transition-colors duration-200 group">
                  <div className="w-5 h-5 rounded-full border-2 border-orange-200 mr-4 flex-shrink-0 flex items-center justify-center mt-1 group-hover:border-orange-400 transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="flex-grow text-base md:text-lg leading-snug">
                    <span className="font-bold text-gray-900 mr-2">{ing.quantity}</span>
                    <span className="text-gray-600 font-medium">{ing.item}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold font-serif text-gray-900 mb-8 flex items-center gap-3 border-b border-gray-100 pb-4">
             <span className="text-orange-500 text-2xl">👨‍🍳</span> Instructions
          </h2>
          <div className="space-y-6">
            {recipe.instructions.map((step, idx) => (
              <div key={idx} className="flex gap-6 group">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 border border-orange-200 flex items-center justify-center font-bold text-lg group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-grow pt-1">
                  <p className="text-gray-700 text-lg leading-relaxed group-hover:text-gray-900 transition-colors duration-200">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
