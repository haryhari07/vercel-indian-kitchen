import Image from 'next/image';
import { states, mealPlates } from '@/data/recipes';
import { db } from '@/lib/db';
import StateCard from '@/components/StateCard';
import RecipeCard from '@/components/RecipeCard';
import MealPlateCard from '@/components/MealPlateCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function Home() {
  const recipes = [...db.getRecipes()].reverse();
  return (
    <div className="space-y-16">
      <section className="bg-[var(--ak-bg-soft)]">
        <div className="container mx-auto px-4 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[var(--ak-border)] px-3 py-1 text-xs font-semibold text-[var(--ak-primary)] uppercase tracking-wide">
              Trusted Indian Home Cooking
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight">
              Cook Authentic
              <span className="text-[var(--ak-primary)]"> Indian Recipes</span>
              , State by State
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-xl">
              Simple, reliable recipes for everyday Indian meals. Explore traditional dishes from across India with clear instructions and familiar ingredients.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="btn btn-primary justify-center">
                Start Cooking Today
              </button>
              <a
                href="#states"
                className="btn border border-[var(--ak-border)] bg-white text-gray-800 justify-center"
              >
                Browse by State
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="badge">Step-by-step recipes</span>
              <span className="badge">Beginner-friendly</span>
              <span className="badge">Regional classics</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -left-4 h-20 w-20 rounded-full bg-[var(--ak-accent)]/60 blur-2xl" />
            <div className="absolute -bottom-8 -right-6 h-24 w-24 rounded-full bg-[var(--ak-primary)]/50 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4">
              <div className="card p-4 flex flex-col gap-3 h-full">
                <div className="relative h-28 rounded-lg overflow-hidden">
                  <Image
                    src="/assets/hero-dal.webp"
                    alt="Comforting Dal & Sabzis"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Comforting Dal & Sabzis</h3>
                <p className="text-xs text-gray-600">
                  Wholesome recipes for everyday Indian lunches and dinners.
                </p>
              </div>
              <div className="card p-4 flex flex-col gap-3 h-full">
                <div className="relative h-28 rounded-lg overflow-hidden">
                  <Image
                    src="/assets/hero-sweets.webp"
                    alt="Festive Sweets"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Festive Sweets</h3>
                <p className="text-xs text-gray-600">
                  Traditional desserts for Diwali, festivals, and special family days.
                </p>
              </div>
              <div className="card p-4 flex flex-col gap-3 col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Plan your next Indian meal</p>
                  <span className="text-xs text-[var(--ak-primary)] font-semibold">By State</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {states.map((state) => (
                    <span
                      key={state.slug}
                      className="px-3 py-1 rounded-full bg-[var(--ak-bg-soft)] text-gray-700"
                    >
                      {state.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Recipes Grid (Archana's Kitchen often highlights latest first) */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="section-title mb-2">Fresh From The Kitchen</h2>
                <p className="section-subtitle">
                    Our latest additions to help you cook something new today.
                </p>
            </div>
            <Link href="/recipes" className="text-[var(--ak-primary)] font-bold text-sm hover:underline hidden md:block">
                View All Recipes &rarr;
            </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipes.slice(0, 4).map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} priority={index < 2} />
            ))}
        </div>
        <div className="mt-6 text-center md:hidden">
            <Link href="/recipes" className="btn border border-[var(--ak-border)] bg-white w-full justify-center">
                View All Recipes
            </Link>
        </div>
      </section>

      {/* Meal Plates Section */}
      <section id="meal-plates" className="bg-orange-50/50 border-y border-[var(--ak-border)] py-16">
        <div className="container mx-auto px-4">
            <div className="text-center mb-10">
                <span className="text-[var(--ak-primary)] font-bold tracking-wider text-xs uppercase mb-2 block">Complete Meals</span>
                <h2 className="section-title mb-3">Wholesome Meal Plates</h2>
                <p className="section-subtitle">
                    Confused about what to cook? Try our curated meal combinations (Thalis) for a balanced diet.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {mealPlates.map(plate => (
                    <MealPlateCard key={plate.id} plate={plate} />
                ))}
            </div>
        </div>
      </section>

      <section id="states" className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="section-title mb-3">Cook by State</h2>
          <p className="section-subtitle">
            Discover iconic recipes from every corner of India. Start with a state you love or explore somewhere new.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {states.map((state, index) => (
            <StateCard key={state.slug} state={state} priority={index < 3} />
          ))}
        </div>
      </section>

      {/* Explore Categories / Footer CTA */}
      <section className="container mx-auto px-4 py-10">
          <div className="bg-[var(--ak-primary)] rounded-2xl p-8 md:p-16 text-center text-white relative overflow-hidden">
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold">Ready to start your culinary journey?</h2>
                  <p className="text-orange-100 text-lg">
                      Join our community of home cooks and explore thousands of traditional Indian recipes.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/signin" className="bg-white text-[var(--ak-primary)] px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition">
                          Join for Free
                      </Link>
                      <Link href="/search" className="bg-orange-700 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-800 transition">
                          Search Recipes
                      </Link>
                  </div>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>
      </section>
    </div>
  );
}
