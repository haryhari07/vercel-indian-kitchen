'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Recipe, State } from '@/data/types';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<{ recipeMatches: Recipe[], stateMatches: State[] }>({ recipeMatches: [], stateMatches: [] });

  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = query.trim();
      if (!q) {
        setResults({ recipeMatches: [], stateMatches: [] });
        return;
      }

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Search failed', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const NavItem = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href) && href !== '/search');
    
    return (
      <Link 
        href={href} 
        className={`relative px-1 py-2 text-sm font-medium transition-colors duration-200 group ${
          isActive ? 'text-[var(--ak-primary)]' : 'text-gray-700 hover:text-[var(--ak-primary)]'
        }`}
      >
        {children}
        <span className={`absolute bottom-0 left-0 h-0.5 bg-[var(--ak-primary)] transition-all duration-300 rounded-full ${
          isActive ? 'w-full' : 'w-0 group-hover:w-full'
        }`} />
      </Link>
    );
  };

  const userInitials = user?.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <header className="border-b border-[var(--ak-border)] bg-white/95 backdrop-blur sticky top-0 z-40 shadow-sm transition-all duration-300">
      <nav className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-2xl bg-[var(--ak-bg-soft)] border border-[var(--ak-border)] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Image
              src="/indian-kitchen-logo.svg"
              alt="Indian Kitchen logo"
              width={40}
              height={40}
              priority
            />
          </div>
          <div className="leading-tight">
            <span className="block text-xl font-bold font-serif text-gray-900 group-hover:text-[var(--ak-primary)] transition-colors">
              Indian Kitchen
            </span>
            <span className="text-xs text-gray-500">
              Everyday Indian Recipes, Simplified
            </span>
          </div>
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl relative mx-8">
          <form
            onSubmit={onSubmit}
            className="flex w-full rounded-full border border-[var(--ak-border)] bg-[var(--ak-bg-soft)] pl-4 pr-2 py-2 items-center gap-2 focus-within:ring-2 focus-within:ring-[var(--ak-primary)]/20 focus-within:border-[var(--ak-primary)] transition-all shadow-sm"
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
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
              aria-label="Search recipes"
            />
            <button type="submit" className="btn btn-primary text-sm h-8 px-4 py-0 rounded-full shadow-md hover:shadow-lg transform active:scale-95 transition-all">
              Search
            </button>
          </form>
          {open && query && (
            <div className="absolute z-50 top-14 left-0 right-0 bg-white border border-[var(--ak-border)] rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3">
                {results.stateMatches.length > 0 && (
                  <div className="mb-2">
                    <div className="px-2 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">States</div>
                    <ul className="max-h-40 overflow-auto">
                      {results.stateMatches.map(s => (
                        <li key={s.slug}>
                          <Link
                            href={`/${s.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[var(--ak-bg-soft)] rounded-lg group transition-colors"
                          >
                            <span className="text-sm text-gray-800 group-hover:text-[var(--ak-primary)] font-medium">{s.name}</span>
                            <span className="text-xs text-gray-500">{s.region}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.recipeMatches.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Recipes</div>
                    <ul className="max-h-60 overflow-auto">
                      {results.recipeMatches.map(r => (
                        <li key={r.id}>
                          <Link
                            href={`/recipe/${r.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between px-3 py-2 hover:bg-[var(--ak-bg-soft)] rounded-lg group transition-colors"
                          >
                            <span className="text-sm text-gray-800 group-hover:text-[var(--ak-primary)] font-medium">{r.title}</span>
                            <span className="text-xs text-gray-500">{r.state}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.recipeMatches.length === 0 && results.stateMatches.length === 0 && (
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm text-gray-500">No matches found for "{query}"</p>
                    <p className="text-xs text-gray-400 mt-1">Try searching for ingredients or states</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-6 text-sm">
          <Link href="/search" className="md:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-full" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M10 2a8 8 0 015.292 13.708l5 5a1 1 0 01-1.414 1.414l-5-5A8 8 0 1110 2zm0 2a6 6 0 100 12a6 6 0 000-12z"/>
            </svg>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <NavItem href="/#meal-plates">Meal Plates</NavItem>
            <NavItem href="/#states">States</NavItem>
            <NavItem href="/recipes">Recipes</NavItem>
            <NavItem href="/genie">Recipe Genie</NavItem>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ak-primary)]/20"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--ak-primary)] to-[var(--ak-accent)] text-white flex items-center justify-center font-bold shadow-sm">
                  {userInitials}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-gray-700 leading-none">{user.name?.split(' ')[0] || 'User'}</p>
                  <p className="text-[10px] text-gray-500 leading-none mt-1">My Account</p>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-[var(--ak-border)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                  <div className="p-4 bg-[var(--ak-bg-soft)] border-b border-[var(--ak-border)]">
                    <p className="font-semibold text-gray-900">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  
                  <div className="p-2">
                    {user.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--ak-primary)] rounded-lg transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <Link 
                      href="/saved" 
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--ak-primary)] rounded-lg transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      My Saved Recipes
                    </Link>
                  </div>
                  
                  <div className="p-2 border-t border-[var(--ak-border)]">
                    <button 
                      onClick={() => {
                        logout();
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="hidden md:inline-flex text-sm font-semibold text-gray-600 hover:text-[var(--ak-primary)] transition-colors"
              >
                Sign in
              </Link>
              <Link 
                href="/signin" 
                className="btn btn-primary text-sm px-5 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
