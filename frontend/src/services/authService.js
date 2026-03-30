import api from "./api";

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

export const loginUserWithToken = async (credentials) => {
  // Raw fetch to get token from header for iOS
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  const data = await response.json();
  if (!response.ok) throw { response: { data } };
  // Extract token from header
  const token = response.headers.get("X-Access-Token");
  if (token) localStorage.setItem("access_token", token);
  return data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const logoutUser = async () => {
  // Clear token from localStorage on logout
  localStorage.removeItem('access_token');
  const res = await api.post("/auth/logout", {});
  return res.data;
};
