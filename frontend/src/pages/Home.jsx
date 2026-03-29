import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FileText, Sparkles, Shield, Download, ArrowRight, Zap, Layout, CheckCircle, Star } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    { icon: Sparkles, title: "AI Suggestions", desc: "Generate summaries, improve wording, and get skill recommendations powered by AI." },
    { icon: Layout, title: "15+ Templates", desc: "Choose from Modern, Classic, Creative and more. Switch templates anytime instantly." },
    { icon: Download, title: "PDF Download", desc: "Download your resume as a professionally styled PDF ready for job applications." },
    { icon: Shield, title: "Secure & Private", desc: "Your data is encrypted and protected. Only you can access your resumes." },
    { icon: Zap, title: "ATS Optimized", desc: "Resumes are built to pass Applicant Tracking Systems used by top employers." },
    { icon: FileText, title: "Full Control", desc: "Create, edit, duplicate, and manage multiple resumes from your dashboard." },
  ];

  const steps = [
    { num: "1", title: "Choose a template", desc: "Pick from 15+ professional templates across Simple, Modern and Creative categories." },
    { num: "2", title: "Fill in your details", desc: "Add your experience, education, skills and projects. AI helps you write better content." },
    { num: "3", title: "Download your resume", desc: "Export as a beautifully formatted PDF — ready to send to any employer." },
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: "#0f172a" }}>
      <style>{`
        @keyframes home-fade { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .home-feature { transition: all 0.3s ease; border: 1px solid #e2e8f0; }
        .home-feature:hover { transform: translateY(-4px); box-shadow: 0 16px 40px -12px rgba(99,102,241,0.12); border-color: #c7d2fe; }
        .home-cta { transition: all 0.3s ease; }
        .home-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 32px -8px rgba(99,102,241,0.4); }
        .step-card { transition: all 0.3s ease; }
        .step-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px -8px rgba(99,102,241,0.1); }
        @media (max-width: 640px) {
          .hero-h1 { font-size: 30px !important; }
          .hero-p { font-size: 15px !important; }
          .hero-btn { padding: 12px 20px !important; font-size: 14px !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 8px !important; text-align: center; }
          .trust-badges { gap: 12px !important; }
          .trust-badge { font-size: 12px !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .steps-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", borderBottom:"1px solid rgba(226,232,240,0.6)" }}>
        <div style={{ maxWidth:1120, margin:"0 auto", padding:"0 16px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <FileText style={{ width:16, height:16, color:"#fff" }} />
            </div>
            <span style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.02em" }}>Resume<span style={{ color:"#6366f1" }}>AI</span></span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {!user && (
              <button onClick={() => navigate("/login")} style={{ background:"none", border:"1px solid #e2e8f0", color:"#64748b", padding:"8px 14px", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>
                Sign In
              </button>
            )}
            <button className="home-cta" onClick={() => navigate(user ? "/dashboard" : "/register")}
              style={{ display:"flex", alignItems:"center", gap:6, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", padding:"9px 18px", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer" }}>
              {user ? "Dashboard" : "Get Started"} <ArrowRight style={{ width:15, height:15 }} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section style={{ maxWidth:860, margin:"0 auto", padding:"64px 20px 52px", textAlign:"center", animation:"home-fade 0.6s ease" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#eef2ff", color:"#4f46e5", border:"1px solid #c7d2fe", padding:"6px 16px", borderRadius:20, fontSize:13, fontWeight:600, marginBottom:24 }}>
          <Sparkles style={{ width:14, height:14 }} />
          AI-Powered Resume Builder
        </div>

        <h1 className="hero-h1" style={{ fontSize:"clamp(30px,5vw,54px)", fontWeight:800, lineHeight:1.1, letterSpacing:"-0.03em", margin:"0 0 18px" }}>
          Build{" "}
          <span style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            ATS-Friendly
          </span>{" "}
          Resumes in Minutes
        </h1>

        <p className="hero-p" style={{ fontSize:17, color:"#64748b", maxWidth:560, margin:"0 auto 32px", lineHeight:1.6 }}>
          Create professional resumes with AI-powered suggestions, 15+ templates, and instant PDF downloads.
        </p>

        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button className="home-cta hero-btn" onClick={() => navigate(user ? "/dashboard" : "/register")}
            style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", padding:"14px 28px", borderRadius:12, fontSize:16, fontWeight:700, cursor:"pointer" }}>
            Start Building Free <ArrowRight style={{ width:18, height:18 }} />
          </button>
          {!user && (
            <button onClick={() => navigate("/login")} style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fff", color:"#334155", border:"1.5px solid #e2e8f0", padding:"14px 28px", borderRadius:12, fontSize:16, fontWeight:700, cursor:"pointer" }}>
              Sign In
            </button>
          )}
        </div>

        {/* Trust badges */}
        <div className="trust-badges" style={{ display:"flex", justifyContent:"center", gap:24, marginTop:36, flexWrap:"wrap" }}>
          {["Free to use", "No credit card", "ATS optimized", "PDF download"].map(b => (
            <div key={b} className="trust-badge" style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"#64748b", fontWeight:500 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/></svg>
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", padding:"64px 20px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <h2 style={{ fontSize:"clamp(22px,4vw,30px)", fontWeight:800, color:"#fff", margin:"0 0 10px", letterSpacing:"-0.02em" }}>How it works</h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.75)", margin:0 }}>Build your resume in 3 simple steps</p>
          </div>
          <div className="steps-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {steps.map((s, i) => (
              <div key={i} className="step-card" style={{ background:"rgba(255,255,255,0.12)", borderRadius:16, padding:"24px 20px", border:"1px solid rgba(255,255,255,0.2)" }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"#fff", marginBottom:16 }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize:16, fontWeight:700, color:"#fff", margin:"0 0 8px" }}>{s.title}</h3>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.75)", margin:0, lineHeight:1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background:"#fff", padding:"64px 0" }}>
        <div style={{ maxWidth:1120, margin:"0 auto", padding:"0 20px" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <h2 style={{ fontSize:"clamp(24px,4vw,32px)", fontWeight:800, margin:"0 0 12px", letterSpacing:"-0.02em" }}>Everything You Need</h2>
            <p style={{ fontSize:15, color:"#64748b", margin:0 }}>All the tools to build a job-winning resume</p>
          </div>
          <div className="features-grid" style={{ display:"grid", gap:16, gridTemplateColumns:"repeat(3,1fr)" }}>
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="home-feature"
                style={{ borderRadius:14, background:"#fafbfc", padding:24, animation:`home-fade 0.5s ease ${i*0.08}s both` }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"#eef2ff", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>
                  <Icon style={{ width:20, height:20, color:"#6366f1" }} />
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, margin:"0 0 6px" }}>{title}</h3>
                <p style={{ fontSize:13, color:"#64748b", margin:0, lineHeight:1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:"linear-gradient(135deg,#eef2ff,#f5f3ff)", padding:"64px 20px", textAlign:"center" }}>
        <h2 style={{ fontSize:"clamp(22px,4vw,30px)", fontWeight:800, margin:"0 0 12px", letterSpacing:"-0.02em" }}>
          Ready to land your dream job?
        </h2>
        <p style={{ fontSize:15, color:"#64748b", margin:"0 auto 28px", maxWidth:440, lineHeight:1.6 }}>
          Build a professional resume in minutes with AI assistance and 15+ templates.
        </p>
        <button className="home-cta" onClick={() => navigate(user ? "/dashboard" : "/register")}
          style={{ display:"inline-flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", padding:"14px 32px", borderRadius:12, fontSize:16, fontWeight:700, cursor:"pointer" }}>
          Build My Resume Free <ArrowRight style={{ width:18, height:18 }} />
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid #e2e8f0", padding:"24px 20px", background:"#fff" }}>
        <div className="footer-inner" style={{ maxWidth:1120, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <FileText style={{ width:13, height:13, color:"#fff" }} />
            </div>
            <span style={{ fontSize:14, fontWeight:800, color:"#0f172a" }}>Resume<span style={{ color:"#6366f1" }}>AI</span></span>
          </div>
          <p style={{ fontSize:13, color:"#94a3b8", margin:0 }}>
            &copy; {new Date().getFullYear()} ResumeAI. Build professional resumes with AI.
          </p>
        </div>
      </footer>
    </div>
  );
}