import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import RecipeRatingWrapper from '@/components/RecipeRatingWrapper';
import BookmarkButton from '@/components/BookmarkButton';
import RecipeActions from '@/components/RecipeActions';
import CommentSection from '@/components/CommentSection';
import SimilarRecipes from '@/components/SimilarRecipes';

// We can keep this for ISR, fetching from DB
export async function generateStaticParams() {
  const recipes = db.getRecipes();
  return recipes.map((recipe) => ({
    slug: recipe.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = db.getRecipe(slug);

  if (!recipe) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl print:py-4">
      <div className="mb-6 text-sm breadcrumbs text-gray-500 print:hidden">
        <Link href="/" className="hover:text-orange-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${recipe.state.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-orange-600">{recipe.state}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{recipe.title}</span>
      </div>

      <header className="mb-8 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold font-serif text-gray-900 mb-4 leading-tight">{recipe.title}</h1>
        
        <div className="flex flex-wrap justify-center items-center gap-4 text-gray-600 text-sm md:text-base mb-4">
          <div className="flex items-center gap-1">
            <span className="text-orange-500">⏱️</span>
            <span>Prep: {recipe.prepTime}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1">
            <span className="text-orange-500">🔥</span>
            <span>Cook: {recipe.cookTime}</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1">
            <span className="text-orange-500">🍽️</span>
            <span>Serves: {recipe.servings}</span>
          </div>
        </div>

        <div className="flex justify-center items-center mb-6">
            <RecipeRatingWrapper 
              recipeId={recipe.slug} 
              initialRating={recipe.rating || 5} 
              initialReviewCount={recipe.reviewCount || 10} 
            />
        </div>
        
        {/* Tags Section */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Link href={`/${recipe.state.toLowerCase().replace(/\s+/g, '-')}`} className="text-xs text-orange-800 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full font-medium hover:bg-orange-100 transition-colors">
               📍 {recipe.state}
            </Link>
            <span className="text-xs text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
               🌍 {recipe.region}
            </span>
           {recipe.dietary.map(tag => (
                <span key={tag} className="text-xs text-green-800 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full font-medium">
                    🌿 {tag}
                </span>
            ))}
        </div>

        {/* Action Bar - Clean & Centered */}
        <div className="flex justify-center items-center gap-3 pb-8 border-b border-gray-100">
           <BookmarkButton slug={recipe.slug} size="lg" className="shadow-sm" />
           <RecipeActions title={recipe.title} />
        </div>
      </header>

      <div className="mb-12 rounded-xl overflow-hidden shadow-lg h-64 md:h-96 w-full relative print:h-64">
        <Image 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 800px"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-12 print:block">
        <div className="md:col-span-1 print:mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24 print:static print:border print:shadow-none">
            <h2 className="text-2xl font-bold font-serif text-gray-900 mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
              <span className="text-orange-500 text-2xl">🥘</span> Ingredients
            </h2>
            <ul className="space-y-1">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-baseline p-3 rounded-lg hover:bg-orange-50 transition-colors duration-200 group print:p-1">
                  <div className="w-5 h-5 rounded-full border-2 border-orange-200 mr-4 flex-shrink-0 flex items-center justify-center mt-1 group-hover:border-orange-400 transition-colors print:border-gray-400">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 print:hidden" />
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
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 border border-orange-200 flex items-center justify-center font-bold text-lg group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 print:bg-white print:border-gray-400 print:text-black">
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
      
      <div className="mt-16 border-t border-gray-100 pt-10 print:hidden">
         <SimilarRecipes currentRecipe={recipe} />
      </div>

      <div className="mt-16 print:hidden">
         <CommentSection slug={recipe.slug} />
      </div>
    </article>
  );
}
