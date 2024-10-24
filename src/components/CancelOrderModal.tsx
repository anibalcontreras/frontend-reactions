import React from "react";
import { useNavigate } from "react-router-dom";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("user_type");

  if (!isOpen) return null;

  const handleCancel = () => {
    if (userType === "applicant") {
      navigate("/applicant-dashboard");
    } else if (userType === "supplier") {
      navigate("/supplier-dashboard");
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Confirmar Cancelación</h2>
        <p className="text-gray-700 mb-6">
          ¿Estás seguro de que deseas cancelar este pedido?
        </p>

        <div className="flex justify-end space-x-4">
          <button
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
