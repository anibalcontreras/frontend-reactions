import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  component: React.FC;
  userTypes: Array<"applicant" | "supplier">; // Ahora acepta múltiples tipos de usuarios
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  userTypes,
}) => {
  // Obtener el token y el tipo de usuario desde el localStorage
  const token = localStorage.getItem("access_token");
  const storedUserType = localStorage.getItem("user_type");

  if (!token) {
    // Si no hay token, redirigir al login
    return <Navigate to="/login" />;
  }

  // Verificar si el tipo de usuario coincide con uno de los permitidos
  if (!userTypes.includes(storedUserType as "applicant" | "supplier")) {
    // Si el tipo de usuario no coincide, redirigir
    return <Navigate to="/not-found" />;
  }

  // Si el usuario está autenticado y tiene el tipo correcto, mostrar el componente
  return <Component />;
};

export default ProtectedRoute;
