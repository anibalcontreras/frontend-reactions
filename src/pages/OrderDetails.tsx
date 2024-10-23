import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import CancelOrderModal from "../components/CancelOrderModal";

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const userType = localStorage.getItem("user_type");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          `http://localhost:8000/api/orders/${id}/`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch order details");

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError("Error fetching order details");
      }
    };

    fetchOrderDetails();
  }, [id]);

  if (!order) {
    return <div>No se encontraron detalles del pedido.</div>;
  }

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "Fecha no disponible";

  const handleCancelOrder = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `http://localhost:8000/api/orders/${id}/cancel_order/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to cancel order");

      if (userType === "applicant") {
        navigate("/applicant-dashboard");
      } else if (userType === "supplier") {
        navigate("/supplier-dashboard");
      }
    } catch (err) {
      setError("Error canceling order");
    }
  };

  // Manejar completado de orden (solo para suppliers)
  const handleCompleteOrder = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `http://localhost:8000/api/orders/${id}/complete_order/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to complete order");
      navigate("/supplier-dashboard");
    } catch (err) {
      setError("Error completing order");
    }
  };

  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      {order ? (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">
            Detalles de la Orden #{order.id}
          </h2>
          <p className="text-gray-600 mb-2">
            Proveedor: {order.supplier_username}
          </p>
          <p className="text-gray-600 mb-2">Fecha: {formattedDate}</p>
          <p className="text-gray-600 mb-4">
            Precio total: ${order.total_price}
          </p>

          <h3 className="font-bold mb-2">Servicios solicitados:</h3>
          <ul className="list-disc list-inside">
            {order.items.map((item: any) => (
              <li key={item.id}>
                {item.quantity}x {item.service_name}
              </li>
            ))}
          </ul>

          {order.status === "in_progress" && (
            <button
              className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Cancelar Orden
            </button>
          )}

          {userType === "supplier" && order.status === "in_progress" && (
            <button
              className="bg-primary-base text-white py-2 px-4 rounded-lg hover:bg-primary-hover mt-4 ml-4"
              onClick={handleCompleteOrder}
            >
              Completar Orden
            </button>
          )}
        </div>
      ) : (
        <p>Cargando detalles de la orden...</p>
      )}

      <CancelOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleCancelOrder}
      />

      <BackButton className="mt-8" />
    </div>
  );
};

export default OrderDetails;
