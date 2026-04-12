import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  showValue = false,
  interactive = false,
  onChange,
  className = ''
}: StarRatingProps) {
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          const fillPercent = partial ? (rating - Math.floor(rating)) * 100 : filled ? 100 : 0;

          if (interactive) {
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleClick(i)}
                className="focus:outline-none hover:scale-110 transition-transform"
              >
                <Star
                  size={size}
                  className={filled ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                />
              </button>
            );
          }

          return (
            <div key={i} className="relative">
              <Star
                size={size}
                className="text-slate-200 fill-slate-200"
              />
              {fillPercent > 0 && (
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
                  <Star
                    size={size}
                    className="text-amber-400 fill-amber-400"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
