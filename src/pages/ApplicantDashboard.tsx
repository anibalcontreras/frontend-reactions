import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ApplicantDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [noCurrentOrders, setNoCurrentOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch current orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          "http://localhost:8000/api/orders/current_orders/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch current orders");
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError("Error fetching current orders");
        console.error("Error fetching current orders:", err);
      }
    };

    fetchOrders();
  }, []);

  // Fetch no current orders
  useEffect(() => {
    const fetchNoCurrentOrders = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          "http://localhost:8000/api/orders/no_current_orders/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch no current orders");
        }

        const data = await response.json();
        setNoCurrentOrders(data);
      } catch (err) {
        setError("Error fetching no current orders");
        console.error("Error fetching no current orders:", err);
      }
    };

    fetchNoCurrentOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* Botón para solicitar un nuevo servicio */}
      <div className="mb-12">
        <button
          className="bg-primary-base text-white py-4 px-6 rounded-lg text-lg font-bold hover:bg-primary-blue transition duration-200"
          onClick={() => navigate("/new-service")}
        >
          Solicitar Nuevo Servicio
        </button>
      </div>

      <div className="w-full max-w-6xl flex justify-between">
        {/* Órdenes en camino a la izquierda */}
        <div className="w-1/2 pr-4">
          <h2 className="text-2xl font-bold mb-4">Órdenes en Camino</h2>
          {error && <p className="text-red-500">{error}</p>}

          {orders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
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
                    Proveedor: {order.supplier_username}
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
            <p>No hay órdenes vigentes.</p>
          )}
        </div>

        {/* Órdenes pasadas a la derecha */}
        <div className="w-1/2 pl-4">
          <h2 className="text-2xl font-bold mb-4">Órdenes pasadas</h2>
          {noCurrentOrders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {noCurrentOrders.map((order) => (
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
                    Proveedor: {order.supplier_username}
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
            <p>
              Este es tu primer pedido! Si llegas a 5, el precio total va por
              nuestra cuenta!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
