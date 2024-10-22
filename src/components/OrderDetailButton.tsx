// src/components/OrderDetailButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface OrderDetailButtonProps {
  orderId: number;
}

const OrderDetailButton: React.FC<OrderDetailButtonProps> = ({ orderId }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/orders/${orderId}`)}
      className="bg-primary-base text-white px-4 py-2 rounded hover:bg-primary-blue mt-4"
    >
      Ver Detalles
    </button>
  );
};

export default OrderDetailButton;
