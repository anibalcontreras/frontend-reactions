// src/pages/NotFound.tsx

import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-primary-base mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">
        Lo sentimos, no pudimos encontrar la página que estás buscando.
      </p>
      <button
        onClick={goHome}
        className="px-6 py-3 bg-primary-base text-white rounded hover:bg-primary-blue transition duration-200"
      >
        Volver al Inicio
      </button>
    </div>
  );
};

export default NotFound;
