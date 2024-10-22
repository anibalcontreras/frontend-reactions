import React from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  className?: string; // Hacer que className sea opcional
}

const BackButton: React.FC<BackButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  return (
    <button
      className={`bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-primary-base hover:text-white transition duration-200 ${className}`}
      onClick={() => navigate(-1)} // Navega a la página anterior
    >
      Atrás
    </button>
  );
};

export default BackButton;
