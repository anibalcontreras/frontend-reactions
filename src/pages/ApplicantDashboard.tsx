import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderDetailButton from "../components/OrderDetailButton";
import RepeatOrderModal from "../components/RepeatOrderModal";
import LogoutButton from "../components/LogoutButton";
import axios from "axios";

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

interface Recipient {
  id: number;
  username: string;
}

interface User {
  id: number;
  username: string;
  user_type: string;
  budget: number;
  order_count: number;
  rating: number | null;
  rating_count: number;
}

const statusMapping: { [key: string]: string } = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completada",
  cancelled: "Cancelada",
};

// Función para decodificar el token JWT
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const ApplicantDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [noCurrentOrders, setNoCurrentOrders] = useState<Order[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Decodifica el token para obtener el user_id
        const decodedToken = decodeToken(token);
        if (!decodedToken || !decodedToken.user_id) {
          throw new Error("Invalid token or user_id not found");
        }

        const userId = decodedToken.user_id;

        // Hacer la solicitud con el user_id extraído del token
        const response = await axios.get(
          `http://localhost:8000/api/users/${userId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setError("Error fetching user details");
      }
    };

    fetchUserDetails();
  }, []);

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

  useEffect(() => {
    const fetchCompletedOrders = async () => {
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
          throw new Error("Failed to fetch completed orders");
        }

        const data = await response.json();
        if (data.length > 0) {
          setCompletedOrders(data[data.length - 1]);
          setNoCurrentOrders(data); // Guardar todas las órdenes pasadas
        }
      } catch (err) {
        setError("Error fetching completed orders");
        console.error("Error fetching completed orders:", err);
      }
    };

    const fetchRecipients = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await axios.get(
          "http://localhost:8000/api/recipients/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRecipients(response.data);
      } catch (err) {
        setError("Error fetching recipients");
        console.error("Error fetching recipients:", err);
      }
    };

    fetchCompletedOrders();
    fetchRecipients();
  }, []);

  // Duplicar el último pedido completado con un recipient aleatorio
  const openRepeatOrderModal = () => {
    if (!completedOrders || recipients.length === 0) return;

    // Seleccionar un recipient aleatorio
    const randomRecipient =
      recipients[Math.floor(Math.random() * recipients.length)];
    setSelectedRecipient(randomRecipient.username);

    // Abrir el modal
    setIsModalOpen(true);
  };

  const handleConfirmRepeatOrder = async () => {
    if (!completedOrders || !selectedRecipient) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Obtener el recipient seleccionado
    const recipient = recipients.find((r) => r.username === selectedRecipient);

    if (!recipient) {
      console.error("No recipient selected");
      return;
    }

    try {
      // Crear una nueva orden con los mismos servicios del último pedido completado, pero con recipient aleatorio
      const response = await axios.post(
        "http://localhost:8000/api/orders/",
        {
          services: completedOrders.items.map((item) => ({
            service_id: item.service,
            quantity: item.quantity,
          })),
          recipient_id: recipient.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Orden duplicada con éxito:", response.data);
      setIsModalOpen(false);
      navigate("/applicant-dashboard");
      window.location.reload(); // Recargar la página
    } catch (err) {
      console.error("Error al duplicar la orden:", err);
    }
  };

  const isNextOrderFree = user?.order_count && (user.order_count + 1) % 5 === 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="mb-12 flex space-x-4">
        {isNextOrderFree ? (
          <button
            className="bg-yellow-500 text-black py-4 px-6 rounded-lg text-lg font-bold hover:bg-yellow-600 transition duration-200"
            onClick={() => navigate("/new-service")}
          >
            ¡Solicitud Gratis!
          </button>
        ) : (
          <button
            className="bg-primary-base text-primary-text py-4 px-6 rounded-lg text-lg font-bold hover:bg-primary-hover transition duration-200"
            onClick={() => navigate("/new-service")}
          >
            Solicitar Nuevo Servicio
          </button>
        )}

        {/* Si hay ordenes completadas o hay una orden en current*/}
        {completedOrders && (
          <button
            className="bg-primary-base text-primary-text py-4 px-6 rounded-lg text-lg font-bold hover:bg-primary-hover transition duration-200"
            onClick={openRepeatOrderModal}
          >
            Repetir Pedido
          </button>
        )}
      </div>

      {/* Modal de confirmación */}
      <RepeatOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRepeatOrder}
        orderDetails={{
          services: completedOrders
            ? completedOrders.items.map((item) => ({
                service_name: item.service_name,
                quantity: item.quantity,
              }))
            : [],
          recipient: selectedRecipient || "",
        }}
      />

      <div className="w-full max-w-4xl flex justify-center space-x-8">
        {/* Órdenes en camino a la izquierda */}
        <div className="w-1/2">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Órdenes en Progreso
          </h2>
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
                  <h4 className="font-bold mb-2">Servicios solicitados:</h4>
                  <ul className="list-disc list-inside">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.service_name}
                      </li>
                    ))}
                  </ul>
                  <OrderDetailButton orderId={order.id} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">No hay órdenes vigentes.</p>
          )}
        </div>

        {/* Órdenes pasadas a la derecha */}
        <div className="w-1/2">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Órdenes pasadas
          </h2>
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
                  <OrderDetailButton orderId={order.id} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">No hay órdenes pasadas.</p>
          )}
        </div>
      </div>
      <div className="flex justify-center mt-10">
        <LogoutButton />
      </div>
    </div>
  );
};

export default ApplicantDashboard;
