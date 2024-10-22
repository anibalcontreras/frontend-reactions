// src/pages/SupplierDashboard.tsx

import React, { useEffect, useState } from "react";
import OrderDetailButton from "../components/OrderDetailButton";

interface Order {
  id: number;
  applicant_username: string;
  supplier_username: string;
  status: string;
  time_estimated: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  items: Array<{
    id: number;
    service_name: string;
    quantity: number;
    service: number;
  }>;
  total_price: number;
}

const statusMapping: { [key: string]: string } = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
};

const SupplierDashboard: React.FC = () => {
  const [inProgressOrders, setInProgressOrders] = useState<Order[]>([]);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch in-progress orders
  useEffect(() => {
    const fetchInProgressOrders = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          "http://localhost:8000/api/orders/in_progress_orders/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch in-progress orders");
        }

        const data = await response.json();
        setInProgressOrders(data);
      } catch (err) {
        setError("Error fetching in-progress orders");
        console.error("Error fetching in-progress orders:", err);
      }
    };

    fetchInProgressOrders();
  }, []);

  // Fetch canceled or completed orders
  useEffect(() => {
    const fetchPastOrders = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          "http://localhost:8000/api/orders/canceled_or_completed_orders/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch past orders");
        }

        const data = await response.json();
        setPastOrders(data);
      } catch (err) {
        setError("Error fetching past orders");
        console.error("Error fetching past orders:", err);
      }
    };

    fetchPastOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-6xl flex justify-between">
        {/* Órdenes en progreso a la izquierda */}
        <div className="w-1/2 pr-4">
          <h2 className="text-2xl font-bold mb-4">Órdenes Pendientes</h2>
          {error && <p className="text-red-500">{error}</p>}

          {inProgressOrders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {inProgressOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    Orden #{order.id} - Estado:{" "}
                    <span className="capitalize">
                      {statusMapping[order.status] || order.status}
                    </span>
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Tiempo estimado de llegada: {order.time_estimated} minutos
                  </p>
                  <p className="text-gray-600 mb-2">
                    Solicitante: {order.applicant_username}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Creado el: {new Date(order.created_at).toLocaleString()}
                  </p>

                  <h4 className="font-bold mb-2">Servicios solicitados:</h4>
                  <ul className="list-disc list-inside">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.service_name}
                      </li>
                    ))}
                  </ul>

                  {/* Botón para ver más detalles */}
                  <OrderDetailButton orderId={order.id} />
                </div>
              ))}
            </div>
          ) : (
            <p>No hay órdenes en progreso.</p>
          )}
        </div>

        {/* Órdenes pasadas a la derecha */}
        <div className="w-1/2 pl-4">
          <h2 className="text-2xl font-bold mb-4">Órdenes Pasadas</h2>
          {pastOrders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {pastOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    Orden #{order.id} - Estado:{" "}
                    <span className="capitalize">
                      {statusMapping[order.status] || order.status}
                    </span>
                  </h3>
                  <p className="text-gray-600 mb-2">
                    Solicitante: {order.applicant_username}
                  </p>
                  <p className="text-gray-600 mb-2">
                    Tiempo estimado de llegada: {order.time_estimated} minutos
                  </p>
                  <p className="text-gray-600 mb-4">
                    Creado el: {new Date(order.created_at).toLocaleString()}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Precio total: ${order.total_price}
                  </p>

                  <h4 className="font-bold mb-2">Servicios solicitados:</h4>
                  <ul className="list-disc list-inside">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.service_name}
                      </li>
                    ))}
                  </ul>

                  {/* Botón para ver más detalles */}
                  <OrderDetailButton orderId={order.id} />
                </div>
              ))}
            </div>
          ) : (
            <p>No hay órdenes pasadas.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
