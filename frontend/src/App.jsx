import { useEffect, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";
import { Toaster } from "react-hot-toast";

const BASE = import.meta.env.VITE_API_URL || "";

function WakeupScreen({ progress }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #faf5ff 100%)",
      fontFamily: "'Inter', system-ui, sans-serif", padding: 24
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .wake-bar { height: 4px; background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa); border-radius: 999px; transition: width 0.5s ease; }
      `}</style>

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, animation: "fadeIn 0.5s ease" }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px -4px rgba(99,102,241,0.4)" }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M7 8h10M7 12h6M7 16h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </div>
        <span style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
          Resume<span style={{ color: "#6366f1" }}>AI</span>
        </span>
      </div>

      {/* Card */}
      <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 20px 60px -12px rgba(99,102,241,0.15), 0 0 0 1px rgba(226,232,240,0.6)", padding: "40px 48px", maxWidth: 400, width: "100%", textAlign: "center", animation: "fadeIn 0.6s ease 0.1s both" }}>

        {/* Spinner */}
        <div style={{ width: 56, height: 56, border: "4px solid #eef2ff", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 24px" }} />

        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
          Starting up server...
        </h2>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>
          Our free server takes <strong>~60 seconds</strong> to wake up.<br />
          Please wait, your resume data is safe! ☕
        </p>

        {/* Progress bar */}
        <div style={{ background: "#f1f5f9", borderRadius: 999, height: 4, marginBottom: 12, overflow: "hidden" }}>
          <div className="wake-bar" style={{ width: `${progress}%` }} />
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{Math.round(progress)}% — hang tight!</p>

        {/* Tips */}
        <div style={{ marginTop: 28, padding: "16px", background: "#f8fafc", borderRadius: 12, textAlign: "left" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#475569", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>While you wait...</p>
          {[
            "💡 Use AI to generate your summary",
            "📄 15+ professional templates available",
            "🔗 Share your resume with a public link",
          ].map((tip, i) => (
            <p key={i} style={{ fontSize: 13, color: "#64748b", margin: "4px 0", animation: `pulse 2s ease ${i * 0.3}s infinite` }}>{tip}</p>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 24 }}>
        Upgrade to Render paid plan to eliminate this wait
      </p>
    </div>
  );
}

function App() {
  const [serverReady, setServerReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval;
    let attempts = 0;
    const maxAttempts = 30; // 30 * 3s = 90s max

    // Animate progress bar (fake but reassuring)
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return 90; // Hold at 90% until server responds
        return prev + (90 / 30); // Fill 90% over 30 ticks
      });
    }, 1000);

    const pingServer = async () => {
      try {
        const res = await fetch(`${BASE}/api/auth/check-auth`, {
          credentials: "include",
          signal: AbortSignal.timeout(5000) // 5s timeout per attempt
        });
        // Server responded (even 401 means it's awake!)
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => setServerReady(true), 400);
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          // Give up waiting, show app anyway
          clearInterval(progressInterval);
          setProgress(100);
          setTimeout(() => setServerReady(true), 400);
        } else {
          // Retry every 3 seconds
          setTimeout(pingServer, 3000);
        }
      }
    };

    pingServer();
    return () => clearInterval(progressInterval);
  }, []);

  if (!serverReady) return <WakeupScreen progress={progress} />;

  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
