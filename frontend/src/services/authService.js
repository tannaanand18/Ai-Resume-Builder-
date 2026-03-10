import api from "./api";

export const registerUser = async (data) => {
  return await api.post("/auth/register", data);
};

export const loginUser = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

