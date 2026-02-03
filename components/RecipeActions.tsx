
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function RecipeActions({ title }: { title: string }) {
  const [showCopied, setShowCopied] = useState(false);
  const pathname = usePathname();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = window.location.origin + pathname;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Recipe: ${title}`,
          text: `Check out this recipe for ${title}!`,
          url: url,
        });
        return;
      } catch (err) {
        // Fallback to copy clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex gap-2 print:hidden">
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 hover:text-orange-600 transition-colors shadow-sm"
        aria-label="Print recipe"
      >
        <span className="text-lg">🖨️</span>
        <span className="hidden sm:inline">Print</span>
      </button>

      <button
        onClick={handleShare}
        className="relative flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 hover:text-orange-600 transition-colors shadow-sm"
        aria-label="Share recipe"
      >
        <span className="text-lg">🔗</span>
        <span className="hidden sm:inline">Share</span>
        
        {showCopied && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-50">
            Link copied!
          </div>
        )}
      </button>
    </div>
  );
}
