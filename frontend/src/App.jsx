import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";

const BASE = import.meta.env.VITE_API_URL || "";

function App() {
  useEffect(() => {
    // Ping backend on app load to wake up Render
    fetch(`${BASE}/api/auth/check-auth`, { credentials: "include" })
      .catch(() => {}); // ignore errors - just waking up
  }, []);

  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;