import axios from "axios";

const isProduction = import.meta.env.PROD;

export const API_URL = isProduction
  ? import.meta.env.VITE_API_URL + "/api"
  : "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default api;