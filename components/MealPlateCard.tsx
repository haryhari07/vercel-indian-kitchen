'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MealPlate } from '../data/types';

interface MealPlateCardProps {
  plate: MealPlate;
}

export default function MealPlateCard({ plate }: MealPlateCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedItems = isExpanded ? plate.items : plate.items.slice(0, 3);
  const remainingCount = plate.items.length - 3;

  return (
    <div className="card group h-full flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
      <div className="h-56 relative overflow-hidden bg-gray-200 rounded-t-xl">
        <Image 
            src={plate.imageUrl} 
            alt={plate.title} 
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-3 right-3 bg-[var(--ak-primary)] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg tracking-wider uppercase">
          Meal Plate
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-xl font-bold font-serif text-gray-900 group-hover:text-[var(--ak-primary)] transition-colors mb-2">
            {plate.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{plate.description}</p>
        
        {/* Nutrition Info */}
        {plate.nutrition && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
            <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider mb-2">Nutrition per serving</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <span className="block text-xs font-bold text-gray-900">{plate.nutrition.calories}</span>
                <span className="block text-[10px] text-gray-500">Cals</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-900">{plate.nutrition.protein}</span>
                <span className="block text-[10px] text-gray-500">Prot</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-900">{plate.nutrition.carbs}</span>
                <span className="block text-[10px] text-gray-500">Carbs</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-gray-900">{plate.nutrition.fats}</span>
                <span className="block text-[10px] text-gray-500">Fats</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Includes</p>
            </div>
            <ul className="text-sm text-gray-700 space-y-2">
                {displayedItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--ak-primary)] flex-shrink-0"></span>
                        <span className="text-gray-800">{item}</span>
                    </li>
                ))}
            </ul>
            
            {plate.items.length > 3 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-xs font-semibold text-[var(--ak-primary)] hover:text-orange-700 flex items-center gap-1 transition-colors focus:outline-none"
                >
                  {isExpanded ? (
                    <>
                      <span>Show Less</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>+{remainingCount} more items</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
