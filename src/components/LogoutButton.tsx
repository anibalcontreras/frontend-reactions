import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Eliminar el token de autenticación y cualquier otro dato del localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_type"); // Si tienes otros datos del usuario, puedes eliminarlos también

    // Redirigir al root ("/")
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
    >
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;
