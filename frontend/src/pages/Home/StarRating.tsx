import React from "react";

interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, index) => (
        <svg
          key={`full-${index}`}
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.26 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}

      {/* Half Star */}
      {hasHalfStar && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.26V2z" />
        </svg>
      )}

      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <svg
          key={`empty-${index}`}
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-gray-300"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.26 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
};

export default StarRating;
