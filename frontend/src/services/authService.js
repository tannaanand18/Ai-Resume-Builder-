import API from "./api";



export const registerUser = async (data) => {
  return await API.post("/auth/register", data);
};



export const loginUser = async (credentials) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",  // ✅ ADDED: Receive cookie
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  const data = await res.json();
  // ✅ REMOVED: localStorage - cookie is set automatically by backend
  return data;
};

