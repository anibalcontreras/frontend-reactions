// src/pages/Home.tsx

import React from "react";
import LoginButton from "../components/LoginButton";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-5">
      <h1 className="text-4xl font-bold text-gray-800 mb-10">Bienvenido</h1>
      <p className="text-lg text-gray-600 mb-6">
        Elige cómo deseas iniciar sesión
      </p>
      <div className="flex space-x-4">
        <LoginButton text="Login como Solicitante" to="/applicant-login" />
        <LoginButton text="Login como Proveedor" to="/supplier-login" />
      </div>
    </div>
  );
};

export default Home;
