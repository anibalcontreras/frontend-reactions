import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number; // Agregamos el precio a la interfaz de Service
}

interface SelectedService {
  service_id: number;
  quantity: number;
}

const NewOrder: React.FC = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    []
  );
  const [totalPrice, setTotalPrice] = useState(0); // Estado para manejar el precio total
  const [budget, setBudget] = useState(0); // Estado para almacenar el presupuesto del usuario
  const [error, setError] = useState<string | null>(null);

  // Fetch the services and user info (including budget) from the backend
  useEffect(() => {
    const fetchServicesAndUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No token found");
        }

        // Fetch the available services
        const servicesResponse = await axios.get(
          "http://localhost:8000/api/services/"
        );
        setServices(servicesResponse.data);

        setSelectedServices(
          servicesResponse.data.map((service: Service) => ({
            service_id: service.id,
            quantity: 0, // Default quantity is set to 0
          }))
        );

        // Fetch the user's budget
        const userResponse = await axios.get(
          "http://localhost:8000/api/users/1/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBudget(userResponse.data.budget); // Set the user's budget
      } catch (error) {
        console.error("Error fetching services or user data:", error);
      }
    };

    fetchServicesAndUser();
  }, []);

  // Calculate the total price based on selected services
  useEffect(() => {
    const total = selectedServices.reduce((acc, selectedService) => {
      const service = services.find((s) => s.id === selectedService.service_id);
      return service ? acc + service.price * selectedService.quantity : acc;
    }, 0);

    setTotalPrice(total);
  }, [selectedServices, services]);

  // Handle increment/decrement of service quantity
  const handleIncrement = (serviceId: number) => {
    // Ensure we don't exceed the user's budget
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
    setError(null); // Limpiar el error si existe
  };

  // Check if at least one service has been selected
  const validateOrder = () => {
    const totalSelected = selectedServices.reduce(
      (acc, service) => acc + service.quantity,
      0
    );
    if (totalSelected > 0) {
      setError(null);
      return true;
    } else {
      setError("Debes seleccionar al menos un servicio");
      return false;
    }
  };

  // Submit the selected services to the backend (Create Order)
  const createOrder = async () => {
    if (!validateOrder()) {
      return; // Stop execution if validation fails
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
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Order created:", response.data);
      navigate("/applicant-dashboard"); // Redirect to dashboard after creating the order
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
        {/* Grid de servicios */}
        <div className="grid grid-cols-1 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col items-center"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-800 text-center">
                {service.name} (${service.price}){" "}
                {/* Mostrar el precio del servicio */}
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                {service.description}
              </p>

              <div className="flex items-center space-x-2">
                {/* Botón "-" siempre visible pero oculto si la cantidad es 0 */}
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

                {/* Botón "+" siempre visible pero oculto si supera el presupuesto */}
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

        {/* Mostrar mensaje de error si se supera el presupuesto o no se selecciona ningún servicio */}
        {error && <div className="text-red-500 text-center mt-4">{error}</div>}

        {/* Mostrar el total y el presupuesto */}
        <div className="mt-4 text-center">
          <p className="text-lg font-bold">Total: ${totalPrice}</p>
          <p className="text-lg">
            Presupuesto disponible: ${budget - totalPrice}
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between mt-8">
          <BackButton /> {/* Botón para cancelar y volver atrás */}
          <button
            className="bg-primary-base text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-primary-blue transition duration-200"
            onClick={createOrder}
          >
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;
