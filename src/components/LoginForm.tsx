// src/components/LoginForm.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  userType: "applicant" | "supplier"; // Tipo de usuario (solicitante o proveedor)
}

const LoginForm: React.FC<LoginFormProps> = ({ userType }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const { access, refresh, user_type } = data;

        // Verificar si el tipo de usuario coincide
        if (user_type !== userType) {
          setError("Credenciales incorrectas");
        } else {
          // Guardar los tokens y el tipo de usuario en localStorage
          localStorage.setItem("access_token", access);
          localStorage.setItem("refresh_token", refresh);
          localStorage.setItem("user_type", user_type); // Guardar el tipo de usuario

          // Redirigir al dashboard adecuado
          if (userType === "applicant") {
            navigate("/applicant-dashboard");
          } else if (userType === "supplier") {
            navigate("/supplier-dashboard");
          }
        }
      } else {
        // Manejo de error si el servidor responde con error (400 Bad Request)
        setError(
          data.non_field_errors
            ? data.non_field_errors[0]
            : "Credenciales incorrectas"
        );
      }
    } catch (err) {
      setError("Error de red o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 border border-gray-300 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {userType === "applicant" ? "Login Solicitante" : "Login Proveedor"}
      </h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            className="w-full p-2 border border-gray-300 rounded mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className={`w-full bg-primary-base text-white py-2 px-4 rounded hover:bg-primary-blue transition duration-200 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
