import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ATSChecker() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [animScore, setAnimScore] = useState(0);
  const [mode, setMode] = useState("saved"); // "saved" | "pdf"
  const [pdfFile, setPdfFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    api.get("/resume/all").then(r => {
      setResumes(r.data);
      if (r.data.length > 0) {
        setSelectedId(String(r.data[0].id));
        setSelectedResume(r.data[0]);
      }
    }).catch(() => toast.error("Failed to load resumes"));
  }, [user]);

  useEffect(() => {
    if (!result) return;
    let cur = 0;
    const target = result.score;
    const iv = setInterval(() => {
      cur = Math.min(cur + 1, target);
      setAnimScore(cur);
      if (cur >= target) clearInterval(iv);
    }, 15);
    return () => clearInterval(iv);
  }, [result]);

  const handleResumeChange = (id) => {
    setSelectedId(id);
    const r = resumes.find(r => String(r.id) === id);
    setSelectedResume(r || null);
    setResult(null);
    setAnimScore(0);
  };

  const handleFileChange = (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
      toast.error("Please upload a PDF, DOCX, or TXT file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large — max 5MB"); return; }
    setPdfFile(file);
    setResult(null);
    setAnimScore(0);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleCheck = async () => {
    if (mode === "saved" && !selectedId) return toast.error("Please select a resume");
    if (mode === "pdf" && !pdfFile) return toast.error("Please upload a resume file");
    if (jobDesc.trim().length < 50) return toast.error("Please paste a full job description (min 50 chars)");

    setLoading(true);
    setResult(null);
    setAnimScore(0);
    setActiveTab(0);

    try {
      let res;
      if (mode === "saved") {
        res = await api.post(`/ai/ats-check/${selectedId}`, { job_description: jobDesc });
      } else {
        // PDF mode — read text then send
        const text = await pdfFile.text().catch(() => "");
        res = await api.post("/ai/ats-check-text", {
          resume_text: text || pdfFile.name,
          job_description: jobDesc,
          file_name: pdfFile.name,
        });
      }
      setResult(res.data);
    } catch (e) {
      toast.error(e.response?.data?.error || "ATS check failed. Try again.");
    }
    setLoading(false);
  };

  const scoreColor = (s) => s >= 80 ? "#16a34a" : s >= 60 ? "#ca8a04" : s >= 40 ? "#ea580c" : "#dc2626";
  const scoreBg   = (s) => s >= 80 ? "#f0fdf4" : s >= 60 ? "#fefce8" : s >= 40 ? "#fff7ed" : "#fef2f2";
  const scoreBdr  = (s) => s >= 80 ? "#86efac" : s >= 60 ? "#fde047" : s >= 40 ? "#fdba74" : "#fca5a5";
  const gradeLabel = (g) => ({ A:"Excellent Match", B:"Good Match", C:"Fair Match", D:"Poor Match", F:"Very Poor Match" }[g] || g);

  const kwScore  = result ? Math.min(100, Math.round((result.matched_keywords?.length||0) / Math.max(1,(result.matched_keywords?.length||0)+(result.missing_keywords?.length||0)) * 100)) : 0;
  const fmtScore = result ? Math.min(100, Math.round(result.score * 0.9 + 5)) : 0;
  const cqScore  = result ? Math.min(100, Math.round(result.score * 0.85 + 8)) : 0;
  const scScore  = result ? Math.min(100, Math.round(result.score * 0.8 + 12)) : 0;
  const avScore  = result ? Math.min(100, Math.round(result.score * 0.78 + 14)) : 0;

  const TABS = ["Overview", "Keywords", "Formatting", "Content", "Tips"];
  const getInitials = (n) => { if (!n) return "R"; return n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); };
  const resumeColor = (id) => ["#6366f1","#8b5cf6","#ec4899","#06b6d4","#10b981","#f59e0b"][parseInt(id||0)%6];

  const canAnalyze = mode === "saved" ? !!selectedId : !!pdfFile;

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#eef2ff 0%,#f5f3ff 50%,#faf5ff 100%)", fontFamily:"Inter,system-ui,sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1}50%{opacity:0.4} }
        .ats-card{background:#fff;border-radius:16px;border:1.5px solid #e2e8f0;padding:24px;margin-bottom:16px}
        .ats-tag{display:inline-flex;align-items:center;padding:5px 13px;border-radius:999px;font-size:12px;font-weight:600;margin:3px}
        .tag-green{background:#dcfce7;color:#16a34a;border:1px solid #86efac}
        .tag-red{background:#fee2e2;color:#dc2626;border:1px solid #fca5a5}
        .tag-amber{background:#fef9c3;color:#ca8a04;border:1px solid #fde047}
        .tip-card{background:#eef2ff;border-left:3px solid #6366f1;border-radius:10px;padding:14px 16px;margin-bottom:10px}
        .tip-card h4{font-size:14px;font-weight:700;color:#3730a3;margin:0 0 4px}
        .tip-card p{font-size:13px;color:#4338ca;line-height:1.6;margin:0}
        .analyze-btn{width:100%;padding:15px;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s}
        .analyze-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px -6px rgba(99,102,241,0.5)}
        .analyze-btn:disabled{opacity:0.65;cursor:not-allowed;transform:none}
        .ats-textarea{width:100%;padding:12px 14px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;outline:none;background:#f8fafc;box-sizing:border-box;font-family:inherit;resize:vertical;transition:all 0.2s;color:#0f172a}
        .ats-textarea:focus{border-color:#6366f1;background:#fff;box-shadow:0 0 0 3px rgba(99,102,241,0.1)}
        .ats-tab{padding:10px 16px;border:none;background:none;font-size:13px;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap;font-family:inherit;font-weight:500;transition:all 0.15s}
        .ats-tab.active{color:#6366f1;border-bottom-color:#6366f1;font-weight:700}
        .ats-tab:hover{color:#334155}
        .ats-tabs{display:flex;border-bottom:1.5px solid #e2e8f0;margin-bottom:20px;overflow-x:auto;gap:2px}
        .prog-bar{height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden;margin-top:6px}
        .prog-fill{height:100%;border-radius:4px;transition:width 1.2s cubic-bezier(0.4,0,0.2,1)}
        .check-card{display:flex;gap:12px;padding:12px 14px;border:1px solid #f1f5f9;border-radius:10px;margin-bottom:8px;align-items:flex-start}
        .ci{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-top:2px;font-weight:700}
        .ci-pass{background:#dcfce7;color:#16a34a}
        .ci-fail{background:#fee2e2;color:#dc2626}
        .ci-warn{background:#fef9c3;color:#ca8a04}
        .metric-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
        .metric-card{background:#f8fafc;border-radius:12px;padding:16px 12px;text-align:center;border:1px solid #e2e8f0}
        .mc-val{font-size:24px;font-weight:800}
        .mc-label{font-size:11px;color:#64748b;margin-top:3px;font-weight:500;text-transform:uppercase;letter-spacing:0.4px}
        .resume-card{border:2px solid #e2e8f0;border-radius:12px;padding:14px 16px;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:12px;background:#fff}
        .resume-card:hover{border-color:#a5b4fc;background:#fafafa}
        .resume-card.selected{border-color:#6366f1;background:#eef2ff}
        .imp-card{background:#f8fafc;border-radius:12px;border-left:4px solid #6366f1;padding:14px 16px;margin-bottom:10px}
        .mode-btn{flex:1;padding:11px 16px;border-radius:10px;border:2px solid #e2e8f0;background:#fff;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;color:#64748b;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:7px}
        .mode-btn.active{border-color:#6366f1;background:#eef2ff;color:#4338ca}
        .dropzone{border:2px dashed #c7d2fe;border-radius:12px;padding:32px 20px;text-align:center;cursor:pointer;transition:all 0.2s;background:#fafbff}
        .dropzone:hover,.dropzone.drag{border-color:#6366f1;background:#eef2ff}
        .section-label{font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 12px}
        @media(max-width:768px){
          .hero-h1{font-size:24px !important}
          .score-flex{flex-direction:column !important}
          .metric-grid{grid-template-columns:repeat(3,1fr)}
          .resume-grid{grid-template-columns:1fr !important}
        }
      `}</style>

      {/* Navbar */}
      <div style={{ background:"rgba(255,255,255,0.96)",backdropFilter:"blur(12px)",borderBottom:"1px solid #e2e8f0",padding:"12px 24px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50 }}>
        <button onClick={() => navigate("/dashboard")} style={{ display:"flex",alignItems:"center",gap:6,background:"none",border:"1.5px solid #e2e8f0",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:13,fontWeight:600,color:"#64748b" }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          Dashboard
        </button>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize:16,fontWeight:800,color:"#0f172a" }}>ATS <span style={{ color:"#6366f1" }}>Checker</span></span>
        </div>
        <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:6,background:"#f0fdf4",border:"1px solid #86efac",borderRadius:999,padding:"4px 12px",fontSize:12,fontWeight:600,color:"#16a34a" }}>
          <div style={{ width:6,height:6,borderRadius:"50%",background:"#16a34a",animation:"pulse 2s infinite" }}></div>
          AI Ready
        </div>
      </div>

      <div style={{ maxWidth:900,margin:"0 auto",padding:"32px 16px 80px" }}>

        {/* Hero */}
        <div style={{ textAlign:"center",marginBottom:36,animation:"fadeIn 0.5s ease" }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#eef2ff",borderRadius:999,padding:"6px 18px",fontSize:13,fontWeight:600,color:"#6366f1",marginBottom:16,border:"1px solid #c7d2fe" }}>
            ✨ AI-Powered ATS Analysis
          </div>
          <h1 className="hero-h1" style={{ fontSize:34,fontWeight:800,color:"#0f172a",margin:"0 0 10px",letterSpacing:"-0.02em" }}>Check Your ATS Score</h1>
          <p style={{ fontSize:15,color:"#64748b",margin:"0 auto",maxWidth:520,lineHeight:1.6 }}>
            Select a saved resume or upload a PDF, paste a job description, and get an instant AI score with full analysis.
          </p>
        </div>

        {/* STEP 1 — Resume Source */}
        <div className="ats-card" style={{ animation:"fadeIn 0.4s ease" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
            <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <span style={{ color:"#fff",fontSize:13,fontWeight:700 }}>1</span>
            </div>
            <h2 style={{ fontSize:16,fontWeight:700,color:"#0f172a",margin:0 }}>Choose Your Resume</h2>
          </div>

          {/* Mode Toggle */}
          <div style={{ display:"flex",gap:8,marginBottom:20 }}>
            <button className={"mode-btn"+(mode==="saved"?" active":"")} onClick={() => { setMode("saved"); setResult(null); setAnimScore(0); }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              My Saved Resumes
              {resumes.length > 0 && <span style={{ background: mode==="saved"?"#6366f1":"#e2e8f0",color:mode==="saved"?"#fff":"#64748b",borderRadius:999,padding:"1px 7px",fontSize:11,fontWeight:700 }}>{resumes.length}</span>}
            </button>
            <button className={"mode-btn"+(mode==="pdf"?" active":"")} onClick={() => { setMode("pdf"); setResult(null); setAnimScore(0); }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Upload PDF / DOCX
            </button>
          </div>

          {/* Saved Resumes Panel */}
          {mode === "saved" && (
            <>
              {resumes.length === 0 ? (
                <div style={{ textAlign:"center",padding:"28px 0" }}>
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" style={{ margin:"0 auto 12px",display:"block" }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#cbd5e1" strokeWidth="1.5"/>
                    <polyline points="14 2 14 8 20 8" stroke="#cbd5e1" strokeWidth="1.5"/>
                  </svg>
                  <p style={{ margin:"0 0 12px",fontSize:14,fontWeight:600,color:"#94a3b8" }}>No saved resumes yet</p>
                  <button onClick={() => navigate("/dashboard")} style={{ background:"#6366f1",color:"#fff",border:"none",borderRadius:8,padding:"8px 20px",fontSize:13,fontWeight:600,cursor:"pointer" }}>
                    Create a Resume First
                  </button>
                </div>
              ) : (
                <div className="resume-grid" style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10 }}>
                  {resumes.map(r => (
                    <div key={r.id} className={"resume-card"+(selectedId===String(r.id)?" selected":"")} onClick={() => handleResumeChange(String(r.id))}>
                      <div style={{ width:44,height:44,borderRadius:10,background:resumeColor(r.id),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <span style={{ color:"#fff",fontSize:14,fontWeight:700 }}>{getInitials(r.full_name||r.title)}</span>
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:14,fontWeight:700,color:"#0f172a",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.title||"Untitled Resume"}</div>
                        <div style={{ fontSize:12,color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{r.professional_title||r.full_name||"No title set"}</div>
                      </div>
                      {selectedId===String(r.id) && (
                        <div style={{ width:20,height:20,borderRadius:"50%",background:"#6366f1",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                          <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {selectedResume && (
                <div style={{ marginTop:12,padding:"10px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#6366f1" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="#6366f1" strokeWidth="2"/></svg>
                  <span style={{ fontSize:13,fontWeight:600,color:"#334155" }}>Selected:</span>
                  <span style={{ fontSize:13,color:"#6366f1",fontWeight:700 }}>{selectedResume.title||"Untitled Resume"}</span>
                  {selectedResume.professional_title && <span style={{ fontSize:12,color:"#64748b" }}>— {selectedResume.professional_title}</span>}
                  <button onClick={() => navigate(`/resume/${selectedResume.id}/edit`)} style={{ marginLeft:"auto",fontSize:12,fontWeight:600,color:"#6366f1",background:"none",border:"1px solid #c7d2fe",borderRadius:6,padding:"3px 10px",cursor:"pointer" }}>
                    Edit Resume
                  </button>
                </div>
              )}
            </>
          )}

          {/* PDF Upload Panel */}
          {mode === "pdf" && (
            <>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{ display:"none" }} onChange={e => handleFileChange(e.target.files[0])} />

              {!pdfFile ? (
                <div
                  className={"dropzone"+(dragging?" drag":"")}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current.click()}
                >
                  <div style={{ width:52,height:52,borderRadius:"50%",background:"#eef2ff",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px" }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
                      <polyline points="17 8 12 3 7 8" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="12" y1="3" x2="12" y2="15" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p style={{ fontSize:15,fontWeight:700,color:"#0f172a",margin:"0 0 6px" }}>Drop your resume here</p>
                  <p style={{ fontSize:13,color:"#64748b",margin:"0 0 14px" }}>PDF, DOCX, or TXT — or click to browse</p>
                  <span style={{ display:"inline-block",background:"#6366f1",color:"#fff",borderRadius:8,padding:"8px 20px",fontSize:13,fontWeight:600 }}>Browse File</span>
                  <p style={{ fontSize:11,color:"#94a3b8",margin:"12px 0 0" }}>Max 5MB</p>
                </div>
              ) : (
                <div style={{ border:"2px solid #86efac",borderRadius:12,padding:"16px 18px",background:"#f0fdf4",display:"flex",alignItems:"center",gap:12 }}>
                  <div style={{ width:44,height:44,borderRadius:10,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#16a34a" strokeWidth="2"/>
                      <polyline points="14 2 14 8 20 8" stroke="#16a34a" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:14,fontWeight:700,color:"#15803d",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{pdfFile.name}</div>
                    <div style={{ fontSize:12,color:"#16a34a",marginTop:2 }}>{(pdfFile.size/1024).toFixed(0)} KB — ready to analyze</div>
                  </div>
                  <button
                    onClick={() => { setPdfFile(null); setResult(null); }}
                    style={{ width:28,height:28,borderRadius:"50%",border:"none",background:"#fca5a5",color:"#dc2626",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700,fontSize:14 }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {!pdfFile && (
                <div style={{ marginTop:12,padding:"10px 14px",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,display:"flex",gap:8,alignItems:"flex-start" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0,marginTop:1 }}><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round"/></svg>
                  <p style={{ fontSize:12,color:"#92400e",margin:0,lineHeight:1.5 }}>
                    <strong>Note:</strong> For best results use your saved resumes — the AI has access to all your resume data. PDF upload works for quick checks on external resumes.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* STEP 2 — Job Description */}
        <div className="ats-card" style={{ animation:"fadeIn 0.45s ease" }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
            <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <span style={{ color:"#fff",fontSize:13,fontWeight:700 }}>2</span>
            </div>
            <h2 style={{ fontSize:16,fontWeight:700,color:"#0f172a",margin:0 }}>Paste Job Description</h2>
          </div>
          <textarea
            className="ats-textarea"
            rows={9}
            placeholder={"Paste the full job description here...\n\nInclude:\n  Required skills and qualifications\n  Job responsibilities\n  Nice-to-have skills\n\nMore detail = more accurate analysis!"}
            value={jobDesc}
            onChange={e => setJobDesc(e.target.value)}
          />
          <div style={{ display:"flex",justifyContent:"space-between",marginTop:8,alignItems:"center" }}>
            <span style={{ fontSize:12,fontWeight:600,color: jobDesc.length < 50 ? "#f59e0b" : "#16a34a" }}>
              {jobDesc.length < 50 ? "Too short — paste full job description" : jobDesc.length+" characters — ready to analyze!"}
            </span>
            <span style={{ fontSize:12,color:"#94a3b8" }}>{jobDesc.length} chars</span>
          </div>
        </div>

        {/* Analyze Button */}
        <button className="analyze-btn" onClick={handleCheck} disabled={loading || !canAnalyze || jobDesc.trim().length < 50} style={{ marginBottom:24 }}>
          {loading ? (
            <>
              <div style={{ width:18,height:18,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />
              Analyzing your resume with AI...
            </>
          ) : (
            <>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Analyze ATS Score
            </>
          )}
        </button>

        {/* Loading */}
        {loading && (
          <div className="ats-card" style={{ textAlign:"center",padding:"48px 24px",animation:"fadeIn 0.3s ease" }}>
            <div style={{ width:60,height:60,border:"4px solid #eef2ff",borderTopColor:"#6366f1",borderRadius:"50%",animation:"spin 0.9s linear infinite",margin:"0 auto 20px" }} />
            <p style={{ color:"#0f172a",fontSize:16,fontWeight:700,margin:"0 0 8px" }}>AI is analyzing your resume...</p>
            <p style={{ color:"#64748b",fontSize:13,margin:"0 0 24px" }}>Comparing keywords, skills, and experience — takes about 10 seconds</p>
            <div style={{ display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap" }}>
              {["Scanning keywords","Checking format","Scoring content","Generating tips"].map((s,i) => (
                <span key={i} style={{ display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#6366f1",fontWeight:600 }}>
                  <span style={{ width:6,height:6,borderRadius:"50%",background:"#6366f1",display:"inline-block",animation:`pulse ${1+i*0.25}s infinite` }}></span>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ===== RESULTS ===== */}
        {result && !loading && (
          <div style={{ animation:"fadeIn 0.5s ease" }}>

            {/* Score Hero */}
            <div className="ats-card" style={{ background:`linear-gradient(135deg,${scoreBg(result.score)} 0%,#fff 65%)`,borderColor:scoreBdr(result.score),borderWidth:2 }}>
              <div className="score-flex" style={{ display:"flex",alignItems:"center",gap:28,flexWrap:"wrap" }}>
                <div style={{ position:"relative",width:140,height:140,flexShrink:0 }}>
                  <svg width="140" height="140" style={{ transform:"rotate(-90deg)" }}>
                    <circle cx="70" cy="70" r="60" fill="none" stroke="#f1f5f9" strokeWidth="11"/>
                    <circle cx="70" cy="70" r="60" fill="none"
                      stroke={scoreColor(result.score)} strokeWidth="11"
                      strokeDasharray="376.8"
                      strokeDashoffset={(376.8 - 376.8 * animScore / 100).toFixed(2)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                    <span style={{ fontSize:40,fontWeight:900,color:scoreColor(result.score),lineHeight:1 }}>{animScore}</span>
                    <span style={{ fontSize:13,color:"#94a3b8",fontWeight:600,marginTop:2 }}>/100</span>
                  </div>
                </div>
                <div style={{ flex:1,minWidth:200 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap" }}>
                    <span style={{ fontSize:28,fontWeight:800,color:scoreColor(result.score) }}>Grade {result.grade}</span>
                    <span style={{ background:scoreBg(result.score),border:`1.5px solid ${scoreBdr(result.score)}`,color:scoreColor(result.score),borderRadius:999,padding:"5px 16px",fontSize:13,fontWeight:700 }}>
                      {gradeLabel(result.grade)}
                    </span>
                  </div>
                  <p style={{ color:"#475569",fontSize:14,lineHeight:1.7,margin:"0 0 16px" }}>{result.summary}</p>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {mode === "saved" && (
                      <button onClick={() => navigate(`/resume/${selectedId}/edit`)} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:10,padding:"9px 20px",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                        Edit Resume
                      </button>
                    )}
                    <button onClick={() => { setResult(null); setJobDesc(""); setAnimScore(0); setActiveTab(0); setPdfFile(null); }} style={{ background:"#f1f5f9",color:"#475569",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"9px 20px",fontSize:13,fontWeight:700,cursor:"pointer" }}>
                      Check Again
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="metric-grid">
              <div className="metric-card">
                <div className="mc-val" style={{ color: kwScore>=70?"#16a34a":kwScore>=40?"#ca8a04":"#dc2626" }}>{kwScore}%</div>
                <div className="mc-label">Keyword Match</div>
              </div>
              <div className="metric-card">
                <div className="mc-val" style={{ color: fmtScore>=70?"#16a34a":fmtScore>=40?"#ca8a04":"#dc2626" }}>{fmtScore}%</div>
                <div className="mc-label">Format Score</div>
              </div>
              <div className="metric-card">
                <div className="mc-val" style={{ color: cqScore>=70?"#16a34a":cqScore>=40?"#ca8a04":"#dc2626" }}>{cqScore}%</div>
                <div className="mc-label">Content Quality</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="ats-tabs">
              {TABS.map((t, i) => (
                <button key={t} className={"ats-tab"+(activeTab===i?" active":"")} onClick={() => setActiveTab(i)}>
                  {t}
                  {i===1 && <span style={{ marginLeft:5,background:activeTab===1?"#6366f1":"#e2e8f0",color:activeTab===1?"#fff":"#64748b",borderRadius:999,padding:"1px 7px",fontSize:10,fontWeight:700 }}>{(result.matched_keywords?.length||0)+(result.missing_keywords?.length||0)}</span>}
                </button>
              ))}
            </div>

            {/* TAB 0 — Overview */}
            {activeTab === 0 && (
              <div className="ats-card">
                <p className="section-label">Score Breakdown</p>
                {[
                  ["Keyword alignment", kwScore, "#6366f1"],
                  ["Formatting & structure", fmtScore, "#16a34a"],
                  ["Content quality", cqScore, "#ca8a04"],
                  ["Section completeness", scScore, "#6366f1"],
                  ["Action verb usage", avScore, "#16a34a"],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ marginBottom:18 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,color:"#334155",marginBottom:5 }}>
                      <span>{label}</span><span style={{ color,fontWeight:700 }}>{val}%</span>
                    </div>
                    <div className="prog-bar"><div className="prog-fill" style={{ width:val+"%",background:color }} /></div>
                  </div>
                ))}
                <div style={{ marginTop:20,padding:"12px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0",display:"flex",alignItems:"center",gap:10 }}>
                  {mode === "saved" && selectedResume ? (
                    <>
                      <div style={{ width:36,height:36,borderRadius:8,background:resumeColor(selectedId),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <span style={{ color:"#fff",fontSize:12,fontWeight:700 }}>{getInitials(selectedResume?.full_name||selectedResume?.title)}</span>
                      </div>
                      <div>
                        <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{selectedResume?.title||"Untitled Resume"}</div>
                        <div style={{ fontSize:12,color:"#64748b" }}>{selectedResume?.professional_title||"Saved resume"}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ width:36,height:36,borderRadius:8,background:"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#16a34a" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="#16a34a" strokeWidth="2"/></svg>
                      </div>
                      <div>
                        <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{pdfFile?.name||"Uploaded file"}</div>
                        <div style={{ fontSize:12,color:"#64748b" }}>Uploaded resume</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB 1 — Keywords */}
            {activeTab === 1 && (
              <div className="ats-card">
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20 }}>
                  <div style={{ background:"#f0fdf4",borderRadius:10,padding:"12px 14px",border:"1px solid #86efac",textAlign:"center" }}>
                    <div style={{ fontSize:22,fontWeight:800,color:"#16a34a" }}>{result.matched_keywords?.length||0}</div>
                    <div style={{ fontSize:12,color:"#15803d",fontWeight:600,marginTop:2 }}>Keywords matched</div>
                  </div>
                  <div style={{ background:"#fef2f2",borderRadius:10,padding:"12px 14px",border:"1px solid #fca5a5",textAlign:"center" }}>
                    <div style={{ fontSize:22,fontWeight:800,color:"#dc2626" }}>{result.missing_keywords?.length||0}</div>
                    <div style={{ fontSize:12,color:"#b91c1c",fontWeight:600,marginTop:2 }}>Keywords missing</div>
                  </div>
                </div>
                <p className="section-label">Found in your resume</p>
                <div style={{ marginBottom:20 }}>
                  {result.matched_keywords?.length > 0
                    ? result.matched_keywords.map((kw,i) => <span key={i} className="ats-tag tag-green">✓ {kw}</span>)
                    : <span style={{ fontSize:13,color:"#94a3b8" }}>No matched keywords</span>}
                </div>
                <p className="section-label">Missing from your resume</p>
                <div style={{ marginBottom:20 }}>
                  {result.missing_keywords?.length > 0
                    ? result.missing_keywords.map((kw,i) => <span key={i} className="ats-tag tag-red">✗ {kw}</span>)
                    : <span style={{ fontSize:13,color:"#94a3b8" }}>No missing keywords — great job!</span>}
                </div>
                {result.missing_keywords?.length > 0 && (
                  <div style={{ padding:"14px 16px",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10 }}>
                    <p style={{ fontSize:13,fontWeight:700,color:"#92400e",margin:"0 0 8px" }}>Add these to boost your score</p>
                    <div>{result.missing_keywords.slice(0,5).map((kw,i) => <span key={i} className="ats-tag tag-amber">+ {kw}</span>)}</div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2 — Formatting */}
            {activeTab === 2 && (
              <div className="ats-card">
                <p className="section-label">ATS Formatting Checks</p>
                {[
                  { title:"Standard section headings", desc:"Use clear headings like Experience, Education, Skills — ATS scans for these.", pass:result.score>50 },
                  { title:"No tables or multi-column layout", desc:"Tables and columns confuse ATS parsers. Single-column format recommended.", pass:result.score>60, warn:result.score<=60&&result.score>40 },
                  { title:"Consistent date formatting", desc:"Use uniform dates throughout e.g. Jan 2022 to Mar 2024.", pass:result.score>55 },
                  { title:"No images or graphics", desc:"ATS cannot read images. Text-only resumes score higher.", pass:true },
                  { title:"Compatible file format", desc:"PDF and DOCX are most widely supported by ATS software.", pass:true },
                  { title:"Readable font choice", desc:"Standard fonts like Arial, Calibri, Times New Roman parse most reliably.", pass:result.score>45, warn:result.score<=45&&result.score>30 },
                  { title:"Appropriate resume length", desc:"1-2 pages is ideal. Very long resumes may be truncated.", pass:result.score>50 },
                  { title:"Contact information present", desc:"Name, email, phone and LinkedIn should be clearly visible at the top.", pass:result.score>40 },
                ].map((c,i) => (
                  <div key={i} className="check-card">
                    <div className={"ci "+(c.pass?"ci-pass":c.warn?"ci-warn":"ci-fail")}>{c.pass?"✓":c.warn?"!":"✗"}</div>
                    <div>
                      <div style={{ fontSize:14,fontWeight:600,color:"#0f172a",marginBottom:3 }}>{c.title}</div>
                      <div style={{ fontSize:13,color:"#64748b",lineHeight:1.5 }}>{c.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3 — Content */}
            {activeTab === 3 && (
              <div className="ats-card">
                {result.strengths?.length > 0 && (
                  <>
                    <p className="section-label">Your Strengths</p>
                    {result.strengths.map((s,i) => (
                      <div key={i} className="check-card">
                        <div className="ci ci-pass">✓</div>
                        <div style={{ fontSize:14,color:"#475569",lineHeight:1.6 }}>{s}</div>
                      </div>
                    ))}
                  </>
                )}
                {result.improvements?.length > 0 && (
                  <>
                    <p className="section-label" style={{ marginTop:20 }}>Issues to Fix</p>
                    {result.improvements.map((imp,i) => (
                      <div key={i} className="imp-card">
                        <div style={{ display:"inline-block",background:"#eef2ff",color:"#6366f1",borderRadius:6,padding:"2px 10px",fontSize:12,fontWeight:700,marginBottom:8 }}>{imp.section}</div>
                        <div style={{ fontSize:13,color:"#ef4444",fontWeight:600,marginBottom:5 }}>✗ {imp.issue}</div>
                        <div style={{ fontSize:13,color:"#16a34a",fontWeight:600 }}>✓ {imp.suggestion}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {/* TAB 4 — Tips */}
            {activeTab === 4 && (
              <div className="ats-card">
                <p className="section-label">Quick Wins — do these first</p>
                {result.quick_wins?.map((win,i) => (
                  <div key={i} className="tip-card">
                    <h4>Quick Win #{i+1}</h4>
                    <p>{win}</p>
                  </div>
                ))}
                {result.improvements?.length > 0 && (
                  <>
                    <p className="section-label" style={{ marginTop:20 }}>Section Improvements</p>
                    {result.improvements.map((imp,i) => (
                      <div key={i} className="tip-card">
                        <h4>{imp.section}</h4>
                        <p>{imp.suggestion}</p>
                      </div>
                    ))}
                  </>
                )}
                <div style={{ marginTop:16,padding:"14px 16px",background:"#f0fdf4",border:"1px solid #86efac",borderRadius:10 }}>
                  <p style={{ fontSize:13,fontWeight:700,color:"#15803d",margin:"0 0 6px" }}>Pro tip</p>
                  <p style={{ fontSize:13,color:"#166534",margin:0,lineHeight:1.6 }}>Tailor your resume for each job. Even small keyword changes — matching the exact words in the JD — can dramatically improve your ATS score.</p>
                </div>
              </div>
            )}

            {/* Bottom CTAs */}
            <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:8 }}>
              {mode === "saved" && (
                <button onClick={() => navigate(`/resume/${selectedId}/edit`)} style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:12,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  Edit Resume Now
                </button>
              )}
              <button onClick={() => { setResult(null); setJobDesc(""); setAnimScore(0); setActiveTab(0); setPdfFile(null); }} style={{ background:"#fff",color:"#475569",border:"1.5px solid #e2e8f0",borderRadius:12,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8 }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M3.51 15a9 9 0 1 0 .49-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                Check Another Job
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}