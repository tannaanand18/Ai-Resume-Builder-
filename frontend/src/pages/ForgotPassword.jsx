import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success("Reset link sent to your email");
    } catch (err) {
      const msg = err.response?.data?.error || "Server error";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #faf5ff 100%)", padding: 16, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fp-fade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fp-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; transition: all 0.2s ease; background: #f8fafc; box-sizing: border-box; }
        .fp-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .fp-btn { width: 100%; padding: 12px; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .fp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px -6px rgba(99,102,241,0.4); }
        .fp-btn:disabled { opacity: 0.7; transform: none; box-shadow: none; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; flex-shrink: 0; }
      `}</style>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, animation: "fp-fade 0.5s ease" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px -2px rgba(99,102,241,0.4)" }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M7 8h10M7 12h6M7 16h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </div>
        <span style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Resume<span style={{ color: "#6366f1" }}>AI</span></span>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px -12px rgba(99,102,241,0.12), 0 0 0 1px rgba(226,232,240,0.6)", width: "100%", maxWidth: 420, padding: 36, animation: "fp-fade 0.6s ease" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", color: "#0f172a", margin: "0 0 24px", letterSpacing: "-0.02em" }}>Forgot Password</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="email" placeholder="Enter your email" className="fp-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" disabled={loading} className="fp-btn">
            {loading ? (
              <>
                <div className="auth-spinner"></div>
                Sending reset link...
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <p style={{ fontSize: 14, marginTop: 20, textAlign: "center", color: "#64748b" }}>
          Remember your password?{" "}
          <Link to="/login" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}