import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface SelectedService {
  service_id: number;
  quantity: number;
}

interface Recipient {
  id: number;
  username: string;
}

// Función para decodificar el token JWT y extraer el payload
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

    return JSON.parse(jsonPayload); // Retorna el payload del token
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const NewOrder: React.FC = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    []
  );
  const [recipients, setRecipients] = useState<Recipient[]>([]); // Estado para almacenar recipients
  const [selectedRecipient, setSelectedRecipient] = useState<number | null>(
    null
  ); // Estado para almacenar el recipient seleccionado
  const [totalPrice, setTotalPrice] = useState(0);
  const [budget, setBudget] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isNextOrderFree, setIsNextOrderFree] = useState(false); // Para manejar el pedido gratis

  // Fetch services, user info (including budget), and recipients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No token found");
        }

        // Decodificar el token para obtener el user_id
        const decodedToken = decodeToken(token);
        if (!decodedToken || !decodedToken.user_id) {
          throw new Error("Invalid token or user_id not found");
        }

        const userId = decodedToken.user_id;

        // Fetch available services
        const servicesResponse = await axios.get(
          "http://localhost:8000/api/services/"
        );
        setServices(servicesResponse.data);

        setSelectedServices(
          servicesResponse.data.map((service: Service) => ({
            service_id: service.id,
            quantity: 0,
          }))
        );

        // Fetch the user's budget and order_count using the userId from the token
        const userResponse = await axios.get(
          `http://localhost:8000/api/users/${userId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBudget(userResponse.data.budget);

        // Verificar si el próximo pedido es gratuito
        const orderCount = userResponse.data.order_count;
        const nextOrderFree = (orderCount + 1) % 5 === 0;
        setIsNextOrderFree(nextOrderFree);

        // Fetch recipients
        const recipientsResponse = await axios.get(
          "http://localhost:8000/api/recipients/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRecipients(recipientsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Calculate total price based on selected services
  useEffect(() => {
    let total = selectedServices.reduce((acc, selectedService) => {
      const service = services.find((s) => s.id === selectedService.service_id);
      return service ? acc + service.price * selectedService.quantity : acc;
    }, 0);

    // Si el próximo pedido es gratuito, establecer el total en 0
    if (isNextOrderFree) {
      total = 0;
    }

    setTotalPrice(total);
  }, [selectedServices, services, isNextOrderFree]);

  const handleIncrement = (serviceId: number) => {
    const service = services.find((s) => s.id === serviceId);
    if (service && totalPrice + service.price <= budget) {
      setSelectedServices((prevSelectedServices) =>
        prevSelectedServices.map((selectedService) =>
          selectedService.service_id === serviceId
            ? { ...selectedService, quantity: selectedService.quantity + 1 }
            : selectedService
        )
      );
    } else {
      setError("No puedes exceder tu presupuesto.");
    }
  };

  const handleDecrement = (serviceId: number) => {
    setSelectedServices((prevSelectedServices) =>
      prevSelectedServices.map((selectedService) =>
        selectedService.service_id === serviceId && selectedService.quantity > 0
          ? { ...selectedService, quantity: selectedService.quantity - 1 }
          : selectedService
      )
    );
    setError(null);
  };

  const validateOrder = () => {
    const totalSelected = selectedServices.reduce(
      (acc, service) => acc + service.quantity,
      0
    );
    if (totalSelected > 0 && selectedRecipient !== null) {
      setError(null);
      return true;
    } else {
      setError(
        selectedRecipient === null
          ? "Debes seleccionar un destinatario."
          : "Debes seleccionar al menos un servicio."
      );
      return false;
    }
  };

  const createOrder = async () => {
    if (!validateOrder()) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.post(
        "http://localhost:8000/api/orders/",
        {
          services: selectedServices.filter((service) => service.quantity > 0),
          recipient_id: selectedRecipient, // Agregar recipient al body
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Order created:", response.data);
      navigate("/applicant-dashboard");
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        {/* Dropdown para seleccionar un recipient */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Selecciona un destinatario:
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-base focus:border-primary-base"
            value={selectedRecipient || ""}
            onChange={(e) => setSelectedRecipient(Number(e.target.value))}
          >
            <option value="" disabled>
              Selecciona un destinatario
            </option>
            {recipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.username}
              </option>
            ))}
          </select>
        </div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-800 text-center">
                {service.name} (${service.price})
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                {service.description}
              </p>

              <div className="flex items-center space-x-2">
                <button
                  className={`bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 ${
                    (selectedServices.find((s) => s.service_id === service.id)
                      ?.quantity || 0) === 0
                      ? "invisible"
                      : "visible"
                  }`}
                  onClick={() => handleDecrement(service.id)}
                >
                  -
                </button>

                <div className="w-12 text-center border border-gray-300 p-2 rounded-lg">
                  {selectedServices.find((s) => s.service_id === service.id)
                    ?.quantity || 0}
                </div>

                <button
                  className={`bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 ${
                    totalPrice + service.price > budget
                      ? "invisible"
                      : "visible"
                  }`}
                  onClick={() => handleIncrement(service.id)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="text-red-500 text-center mt-4">{error}</div>}

        <div className="mt-4 text-center">
          <p className="text-lg font-bold">Total: ${totalPrice}</p>
          <p className="text-lg">
            Presupuesto disponible: $
            {isNextOrderFree ? budget : budget - totalPrice}
          </p>
        </div>

        <div className="flex justify-between mt-8">
          <BackButton />
          <button
            className="bg-primary-base text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-primary-hover transition duration-200"
            onClick={createOrder}
          >
            Crear Pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
