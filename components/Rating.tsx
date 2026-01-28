
'use client';

import { useState } from 'react';

interface RatingProps {
  value: number;
  reviewCount?: number;
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function Rating({ 
  value, 
  reviewCount, 
  readOnly = false, 
  onChange,
  size = 'md' 
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const handleMouseEnter = (rating: number) => {
    if (!readOnly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null);
    }
  };

  const handleClick = (rating: number) => {
    if (!readOnly && onChange) {
      onChange(rating);
    }
  };

  const renderStar = (index: number) => {
    const ratingValue = index + 1;
    const isFilled = (hoverValue !== null ? hoverValue : value) >= ratingValue;
    const isHalf = !isFilled && (hoverValue !== null ? hoverValue : value) >= ratingValue - 0.5;

    return (
      <button
        key={index}
        type="button"
        className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none transition-transform ${!readOnly && 'hover:scale-110'}`}
        onClick={() => handleClick(ratingValue)}
        onMouseEnter={() => handleMouseEnter(ratingValue)}
        onMouseLeave={handleMouseLeave}
        disabled={readOnly}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={isFilled ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          className={`${starSize[size]} ${isFilled ? 'text-yellow-400' : 'text-gray-300'} ${!isFilled && isHalf ? 'fill-yellow-400' : ''}`}
        >
          {isHalf ? (
            <>
              <defs>
                <linearGradient id={`half-star-${index}`}>
                  <stop offset="50%" stopColor="currentColor" className="text-yellow-400" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                fill={`url(#half-star-${index})`}
                className="text-gray-300"
              />
            </>
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          )}
        </svg>
      </button>
    );
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[0, 1, 2, 3, 4].map(renderStar)}
      </div>
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
      )}
    </div>
  );
}
