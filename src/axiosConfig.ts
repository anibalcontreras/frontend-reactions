// src/axiosConfig.ts

import axios from "axios";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: "http://localhost:8000/api", // La URL base de tu API
});

// Interceptor para agregar el token a cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token"); // Recuperar el token del localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Agregar token al encabezado Authorization
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
