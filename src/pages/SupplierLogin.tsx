// src/pages/SupplierLogin.tsx

import React from "react";
import LoginForm from "../components/LoginForm";

const SupplierLogin: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoginForm userType="supplier" />
    </div>
  );
};

export default SupplierLogin;
