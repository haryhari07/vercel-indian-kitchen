'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { recipes, states } from '@/data/recipes';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { recipeMatches: [], stateMatches: [] };
    const recipeMatches = recipes.filter(
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
    return { recipeMatches, stateMatches };
  }, [query]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="border-b border-[var(--ak-border)] bg-white/95 backdrop-blur">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[var(--ak-bg-soft)] border border-[var(--ak-border)] flex items-center justify-center overflow-hidden">
            <Image
              src="/indian-kitchen-logo.svg"
              alt="Indian Kitchen logo"
              width={40}
              height={40}
              priority
            />
          </div>
          <div className="leading-tight">
            <span className="block text-xl font-bold font-serif text-gray-900">
              Indian Kitchen
            </span>
            <span className="text-xs text-gray-500">
              Everyday Indian Recipes, Simplified
            </span>
          </div>
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl relative">
          <form
            onSubmit={onSubmit}
            className="flex w-full rounded-full border border-[var(--ak-border)] bg-[var(--ak-bg-soft)] pl-4 pr-2 py-2 items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-400">
              <path fill="currentColor" d="M10 2a8 8 0 015.292 13.708l5 5a1 1 0 01-1.414 1.414l-5-5A8 8 0 1110 2zm0 2a6 6 0 100 12a6 6 0 000-12z"/>
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setOpen(true)}
              placeholder="Search recipes, states, ingredients..."
              className="flex-1 bg-transparent outline-none text-sm text-gray-800"
              aria-label="Search recipes"
            />
            <button type="submit" className="btn btn-primary text-sm h-8 px-4">
              Search
            </button>
          </form>
          {open && query && (
            <div className="absolute z-50 top-12 left-0 right-0 bg-white border border-[var(--ak-border)] rounded-xl shadow-lg">
              <div className="p-3">
                {results.stateMatches.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500">States</div>
                    <ul className="max-h-40 overflow-auto">
                      {results.stateMatches.map(s => (
                        <li key={s.slug}>
                          <Link
                            href={`/${s.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[var(--ak-bg-soft)] rounded-md"
                          >
                            <span className="text-sm text-gray-800">{s.name}</span>
                            <span className="text-xs text-gray-500">{s.region}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.recipeMatches.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500">Recipes</div>
                    <ul className="max-h-60 overflow-auto">
                      {results.recipeMatches.map(r => (
                        <li key={r.id}>
                          <Link
                            href={`/recipe/${r.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[var(--ak-bg-soft)] rounded-md"
                          >
                            <span className="text-sm text-gray-800">{r.title}</span>
                            <span className="text-xs text-gray-500">{r.state}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.recipeMatches.length === 0 && results.stateMatches.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-gray-500">No matches found</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-sm">
          <Link href="/search" className="md:hidden text-gray-700 p-2" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M10 2a8 8 0 015.292 13.708l5 5a1 1 0 01-1.414 1.414l-5-5A8 8 0 1110 2zm0 2a6 6 0 100 12a6 6 0 000-12z"/>
            </svg>
          </Link>
          <Link href="/#meal-plates" className="hidden md:inline-flex text-gray-700 hover:text-[var(--ak-primary)] font-medium">
            Meal Plates
          </Link>
          <Link href="/#states" className="text-gray-700 hover:text-[var(--ak-primary)] font-medium">
            States
          </Link>
          <Link href="/search" className="hidden md:inline-flex text-gray-700 hover:text-[var(--ak-primary)] font-medium">
            Recipes
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'admin' && (
                <Link href="/admin" className="hidden md:inline-flex text-gray-700 hover:text-[var(--ak-primary)] font-medium">
                  Admin
                </Link>
              )}
              <span className="text-sm font-medium text-gray-900 hidden md:block">
                {user.name || user.email.split('@')[0]}
              </span>
              <Link 
                href="/saved" 
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors duration-200 border border-transparent hover:border-orange-100" 
                title="View Saved Recipes"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm">Saved</span>
              </Link>
              <button 
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="btn btn-primary text-sm bg-gray-800 hover:bg-gray-900 text-white h-8 px-4"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden md:inline-flex text-gray-600 hover:text-[var(--ak-primary)]"
              >
                Sign in
              </Link>
              <Link href="/signin" className="btn btn-primary text-sm">
                Join Now
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
