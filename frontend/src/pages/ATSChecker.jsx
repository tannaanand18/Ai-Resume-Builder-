import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ATSChecker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.get("/resume/all").then(r => {
      setResumes(r.data);
      if (r.data.length > 0) setSelectedId(String(r.data[0].id));
    }).catch(() => toast.error("Failed to load resumes"));
  }, [user]);

  const handleCheck = async () => {
    if (!selectedId) return toast.error("Please select a resume");
    if (jobDesc.trim().length < 50) return toast.error("Please paste a full job description (min 50 chars)");
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post(`/ai/ats-check/${selectedId}`, { job_description: jobDesc });
      setResult(res.data);
    } catch (e) {
      toast.error(e.response?.data?.error || "ATS check failed. Try again.");
    }
    setLoading(false);
  };

  const sc = (score) => {
    if (score >= 80) return { bg: "#f0fdf4", border: "#86efac", text: "#16a34a", ring: "#22c55e" };
    if (score >= 60) return { bg: "#fefce8", border: "#fde047", text: "#ca8a04", ring: "#eab308" };
    if (score >= 40) return { bg: "#fff7ed", border: "#fdba74", text: "#ea580c", ring: "#f97316" };
    return { bg: "#fef2f2", border: "#fca5a5", text: "#dc2626", ring: "#ef4444" };
  };

  const gradeLabel = (g) => ({ A: "Excellent Match", B: "Good Match", C: "Fair Match", D: "Poor Match", F: "Very Poor Match" }[g] || g);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #faf5ff 100%)", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .ats-card { background:#fff; border-radius:16px; border:1.5px solid #e2e8f0; padding:24px; margin-bottom:16px; }
        .ats-tag { display:inline-flex; align-items:center; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:600; margin:3px; }
        .ats-tag-green { background:#dcfce7; color:#16a34a; border:1px solid #86efac; }
        .ats-tag-red { background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; }
        .ats-imp { background:#f8fafc; border-radius:12px; border-left:4px solid #6366f1; padding:14px 16px; margin-bottom:10px; }
        .check-btn { width:100%; padding:14px; border:none; border-radius:12px; font-size:15px; font-weight:700; cursor:pointer; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; }
        .check-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px -6px rgba(99,102,241,0.4); }
        .check-btn:disabled { opacity:0.7; cursor:not-allowed; transform:none; }
        .ats-select { width:100%; padding:11px 14px; border:2px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; background:#f8fafc; box-sizing:border-box; font-family:inherit; transition:all 0.2s; }
        .ats-select:focus { border-color:#6366f1; background:#fff; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
        .ats-textarea { width:100%; padding:12px 14px; border:2px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; background:#f8fafc; box-sizing:border-box; font-family:inherit; resize:vertical; transition:all 0.2s; }
        .ats-textarea:focus { border-color:#6366f1; background:#fff; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }
        @media (max-width:768px) { .ats-2col { grid-template-columns:1fr !important; } .ats-hero h1 { font-size:24px !important; } }
      `}</style>

      {/* Navbar */}
      <div style={{ background:"rgba(255,255,255,0.95)", backdropFilter:"blur(12px)", borderBottom:"1px solid #e2e8f0", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => navigate("/dashboard")} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13, fontWeight:600, color:"#64748b" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
            Dashboard
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontSize:16, fontWeight:800, color:"#0f172a" }}>ATS <span style={{ color:"#6366f1" }}>Checker</span></span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"32px 16px 64px" }}>

        {/* Hero */}
        <div className="ats-hero" style={{ textAlign:"center", marginBottom:32, animation:"fadeIn 0.5s ease" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#eef2ff", borderRadius:999, padding:"6px 16px", fontSize:13, fontWeight:600, color:"#6366f1", marginBottom:16 }}>
            ✨ AI-Powered ATS Analysis
          </div>
          <h1 style={{ fontSize:32, fontWeight:800, color:"#0f172a", margin:"0 0 8px", letterSpacing:"-0.02em" }}>Check Your ATS Score</h1>
          <p style={{ fontSize:15, color:"#64748b", margin:0 }}>See how well your resume matches a job and get AI suggestions to improve it</p>
        </div>

        {/* Input Card */}
        <div className="ats-card" style={{ animation:"fadeIn 0.4s ease" }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:"#0f172a", margin:"0 0 20px", display:"flex", alignItems:"center", gap:8 }}>
            📋 Setup Analysis
          </h2>

          <div className="ats-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#334155", marginBottom:8 }}>Select Resume *</label>
              <select className="ats-select" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                {resumes.length === 0
                  ? <option>No resumes found — create one first</option>
                  : resumes.map(r => <option key={r.id} value={String(r.id)}>{r.title || "Untitled Resume"}</option>)
                }
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#334155", marginBottom:8 }}>
                Job Title <span style={{ color:"#94a3b8", fontWeight:400 }}>(for reference)</span>
              </label>
              <input className="ats-select" placeholder="e.g. Software Engineer, Data Analyst..." style={{ border:"2px solid #e2e8f0" }} />
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#334155", marginBottom:8 }}>
              Job Description * <span style={{ color:"#94a3b8", fontWeight:400 }}>— paste the full JD for best results</span>
            </label>
            <textarea
              className="ats-textarea"
              rows={9}
              placeholder={"Paste the full job description here...\n\nInclude:\n• Required skills and qualifications\n• Job responsibilities\n• Nice to have skills\n\nMore details = better analysis!"}
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
            />
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span style={{ fontSize:12, color: jobDesc.length < 50 ? "#f59e0b" : "#16a34a", fontWeight:600 }}>
                {jobDesc.length < 50 ? "⚠️ Too short — paste full job description" : `✅ ${jobDesc.length} characters — good to go!`}
              </span>
              <span style={{ fontSize:12, color:"#94a3b8" }}>{jobDesc.length} chars</span>
            </div>
          </div>

          <button className="check-btn" onClick={handleCheck} disabled={loading || !selectedId || jobDesc.trim().length < 50}>
            {loading ? (
              <>
                <div style={{ width:18, height:18, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
                Analyzing your resume with AI...
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                Analyze ATS Score
              </>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"48px 0", animation:"fadeIn 0.3s ease" }}>
            <div style={{ width:56, height:56, border:"4px solid #eef2ff", borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.9s linear infinite", margin:"0 auto 20px" }} />
            <p style={{ color:"#475569", fontSize:15, fontWeight:700, margin:"0 0 6px" }}>AI is analyzing your resume...</p>
            <p style={{ color:"#94a3b8", fontSize:13, margin:0 }}>Comparing keywords, skills, and experience — takes ~10 seconds</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ animation:"fadeIn 0.5s ease" }}>

            {/* Score */}
            <div className="ats-card" style={{ background:`linear-gradient(135deg, ${sc(result.score).bg}, #fff)`, borderColor:sc(result.score).border }}>
              <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
                <div style={{ position:"relative", width:120, height:120, flexShrink:0 }}>
                  <svg width="120" height="120" style={{ transform:"rotate(-90deg)" }}>
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#f1f5f9" strokeWidth="10"/>
                    <circle cx="60" cy="60" r="54" fill="none"
                      stroke={sc(result.score).ring} strokeWidth="10"
                      strokeDasharray="339"
                      strokeDashoffset={339 - (339 * result.score / 100)}
                      strokeLinecap="round"
                      style={{ transition:"stroke-dashoffset 1.5s ease" }}
                    />
                  </svg>
                  <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:30, fontWeight:800, color:sc(result.score).text, lineHeight:1 }}>{result.score}</span>
                    <span style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>/ 100</span>
                  </div>
                </div>
                <div style={{ flex:1, minWidth:180 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, flexWrap:"wrap" }}>
                    <span style={{ fontSize:26, fontWeight:800, color:sc(result.score).text }}>Grade {result.grade}</span>
                    <span style={{ background:sc(result.score).bg, border:`1.5px solid ${sc(result.score).border}`, color:sc(result.score).text, borderRadius:999, padding:"4px 14px", fontSize:13, fontWeight:700 }}>
                      {gradeLabel(result.grade)}
                    </span>
                  </div>
                  <p style={{ color:"#475569", fontSize:14, lineHeight:1.7, margin:0 }}>{result.summary}</p>
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="ats-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div className="ats-card" style={{ margin:0 }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:"#16a34a", margin:"0 0 12px", display:"flex", alignItems:"center", gap:6 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  Matched ({result.matched_keywords?.length || 0})
                </h3>
                <div>{result.matched_keywords?.map((kw, i) => <span key={i} className="ats-tag ats-tag-green">✓ {kw}</span>)}</div>
              </div>
              <div className="ats-card" style={{ margin:0 }}>
                <h3 style={{ fontSize:14, fontWeight:700, color:"#dc2626", margin:"0 0 12px", display:"flex", alignItems:"center", gap:6 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  Missing ({result.missing_keywords?.length || 0})
                </h3>
                <div>{result.missing_keywords?.map((kw, i) => <span key={i} className="ats-tag ats-tag-red">✗ {kw}</span>)}</div>
              </div>
            </div>

            {/* Strengths */}
            <div className="ats-card">
              <h3 style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 14px" }}>💪 Your Strengths</h3>
              {result.strengths?.map((s, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0", borderBottom: i < result.strengths.length-1 ? "1px solid #f1f5f9":"none" }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="3" strokeLinecap="round"/></svg>
                  </div>
                  <p style={{ margin:0, fontSize:14, color:"#475569", lineHeight:1.6 }}>{s}</p>
                </div>
              ))}
            </div>

            {/* Improvements */}
            <div className="ats-card">
              <h3 style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 14px" }}>🔧 How to Improve</h3>
              {result.improvements?.map((imp, i) => (
                <div key={i} className="ats-imp">
                  <span style={{ background:"#eef2ff", color:"#6366f1", borderRadius:6, padding:"2px 10px", fontSize:12, fontWeight:700, display:"inline-block", marginBottom:8 }}>{imp.section}</span>
                  <p style={{ margin:"0 0 6px", fontSize:13, color:"#ef4444", fontWeight:600 }}>❌ {imp.issue}</p>
                  <p style={{ margin:0, fontSize:13, color:"#16a34a", fontWeight:600 }}>✅ {imp.suggestion}</p>
                </div>
              ))}
            </div>

            {/* Quick Wins */}
            <div className="ats-card">
              <h3 style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 14px" }}>⚡ Quick Wins</h3>
              {result.quick_wins?.map((win, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom: i < result.quick_wins.length-1 ? "1px solid #f1f5f9":"none" }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ color:"#fff", fontSize:12, fontWeight:700 }}>{i+1}</span>
                  </div>
                  <p style={{ margin:0, fontSize:14, color:"#475569", lineHeight:1.6 }}>{win}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign:"center", marginTop:24, display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={() => navigate(`/resume/${selectedId}/edit`)}
                style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", color:"#fff", border:"none", borderRadius:12, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                ✏️ Edit Resume Now →
              </button>
              <button onClick={() => { setResult(null); setJobDesc(""); }}
                style={{ background:"#f1f5f9", color:"#475569", border:"1.5px solid #e2e8f0", borderRadius:12, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                🔄 Check Another Job
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
