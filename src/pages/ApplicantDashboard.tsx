import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderDetailButton from "../components/OrderDetailButton";
import RepeatOrderModal from "../components/RepeatOrderModal"; // Importar el modal
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
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

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

  // Fetch completed orders and recipients
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
          recipient_id: recipient.id, // Asignar el nuevo recipient
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Orden duplicada con éxito:", response.data);
      setIsModalOpen(false);
      navigate("/applicant-dashboard"); // Actualizar el dashboard
      window.location.reload(); // Recargar la página
    } catch (err) {
      console.error("Error al duplicar la orden:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="mb-12 flex space-x-4">
        <button
          className="bg-primary-base text-white py-4 px-6 rounded-lg text-lg font-bold hover:bg-primary-blue transition duration-200"
          onClick={() => navigate("/new-service")}
        >
          Solicitar Nuevo Servicio
        </button>

        {completedOrders && (
          <button
            className="bg-primary-base text-white py-4 px-6 rounded-lg text-lg font-bold hover:bg-primary-blue transition duration-200"
            onClick={openRepeatOrderModal} // Abrir modal de confirmación
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
              Aún no se completan tus solicitudes! Si llegas a 5, el precio
              total va por nuestra cuenta!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
