import React, { useState } from "react";

interface StarRatingProps {
  onRatingSubmit: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ onRatingSubmit }) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    onRatingSubmit(rating); // Llama a la función para enviar la calificación
  };

  const handleMouseEnter = (rating: number) => {
    setHoverRating(rating); // Muestra las estrellas hasta la que el mouse está sobre
  };

  const handleMouseLeave = () => {
    setHoverRating(null); // Deja de mostrar el hover cuando el mouse sale de las estrellas
  };

  return (
    <div className="flex justify-center mt-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRatingClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          className={`text-3xl focus:outline-none ${
            (hoverRating && star <= hoverRating) ||
            (!hoverRating && star <= selectedRating)
              ? "text-yellow-500"
              : "text-gray-400"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

export default StarRating;
