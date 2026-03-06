import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert("Registration failed");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #faf5ff 100%)", padding: "16px", fontFamily: "'Inter', system-ui, sans-serif" }}>

      <style>{`
        @keyframes reg-fade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .reg-input { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; outline: none; transition: all 0.2s ease; background: #f8fafc; box-sizing: border-box; }
        .reg-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .reg-btn { width: 100%; padding: 12px; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
        .reg-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px -6px rgba(99,102,241,0.4); }
      `}</style>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, animation: "reg-fade 0.5s ease" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px -2px rgba(99,102,241,0.4)" }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M7 8h10M7 12h6M7 16h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </div>
        <span style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Resume<span style={{ color: "#6366f1" }}>AI</span></span>
      </div>

      {/* Card */}
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px -12px rgba(99,102,241,0.12), 0 0 0 1px rgba(226,232,240,0.6)", width: "100%", maxWidth: 420, padding: 36, animation: "reg-fade 0.6s ease 0.1s both" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Create account</h2>
        <p style={{ fontSize: 14, textAlign: "center", color: "#64748b", margin: "0 0 28px" }}>Get started with AI-powered resumes</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Full Name</label>
            <input type="text" name="name" placeholder="John Doe" onChange={handleChange} className="reg-input" required />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Email</label>
            <input type="email" name="email" placeholder="you@example.com" onChange={handleChange} className="reg-input" required />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 6 }}>Password</label>
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} className="reg-input" required />
          </div>

          <button type="submit" className="reg-btn">Create Account</button>
        </form>

        <p style={{ fontSize: 14, marginTop: 24, textAlign: "center", color: "#64748b" }}>
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} style={{ color: "#6366f1", cursor: "pointer", fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
            onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;