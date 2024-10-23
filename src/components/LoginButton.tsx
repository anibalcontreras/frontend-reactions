import React from "react";
import { Link } from "react-router-dom";

interface LoginButtonProps {
  text: string;
  to: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ text, to }) => {
  return (
    <Link
      to={to}
      className="bg-primary-base text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:bg-primary-hover transition duration-300 ease-in-out transform hover:scale-105"
    >
      {text}
    </Link>
  );
};

export default LoginButton;
