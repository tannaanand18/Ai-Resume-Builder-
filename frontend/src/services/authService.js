import api from "./api";

export const registerUser = async (data) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await api.post("/api/auth/login", credentials);
  return res.data;
};