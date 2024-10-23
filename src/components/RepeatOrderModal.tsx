import React from "react";
import BackButton from "./BackButton";

interface RepeatOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderDetails: {
    services: { service_name: string; quantity: number }[];
    recipient: string;
  };
}

const RepeatOrderModal: React.FC<RepeatOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderDetails,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Detalles del Pedido</h2>
        <p className="text-gray-700 mb-6">
          Revisar los detalles antes de confirmar.
        </p>

        <div className="mb-4">
          <h3 className="font-bold text-lg">Servicios:</h3>
          <ul className="list-disc list-inside">
            {orderDetails.services.map((service, index) => (
              <li key={index}>
                {service.quantity}x {service.service_name}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-lg">Destinatario:</h3>
          <p>{orderDetails.recipient}</p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            className="bg-gray-200 text-white py-2 px-4 rounded-lg hover:bg-primary-base"
            onClick={onClose} // Cerrar el modal
          >
            Cancelar
          </button>
          <button
            className="bg-primary-base text-white py-2 px-4 rounded-lg hover:bg-primary-blue"
            onClick={onConfirm} // Confirmar el pedido
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepeatOrderModal;
