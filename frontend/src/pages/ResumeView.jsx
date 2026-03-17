import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE = import.meta.env.VITE_API_URL || "";

export default function ResumeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  const publicUrl = `${window.location.origin}/resume/${id}/view`;

  useEffect(() => {
    fetch(`${BASE}/api/resume/public/${id}`)
      .then(res => res.json())
      .then(json => {
        if (json.error) setError(json.error);
        else setData(json);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load resume"); setLoading(false); });
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  };

  const handleShare = (platform) => {
    const name = data?.resume?.full_name || "My Resume";
    const text = `Check out ${name}'s resume built with ResumeAI`;
    const encodedUrl = encodeURIComponent(publicUrl);
    const encodedText = encodeURIComponent(text);

    const urls = {
      whatsapp: `https://wa.me/?text=${encodedText}%0A${encodedUrl}`,
      email: `mailto:?subject=${encodedText}&body=${encodedText}%0A%0AView Resume%3A%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    };

    window.open(urls[platform], "_blank");
    setShowShareMenu(false);
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, border: "4px solid #e0e7ff", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#64748b", fontSize: 14, fontFamily: "Inter, sans-serif" }}>Loading resume...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>Resume Not Found</h2>
      <p style={{ color: "#64748b", marginBottom: 24 }}>This resume may have been deleted or does not exist.</p>
      <button onClick={() => navigate("/")} style={{ padding: "10px 24px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
        Go Home
      </button>
    </div>
  );

  const { resume, experiences, educations, skills, projects, certs } = data;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .resume-card { box-shadow: none !important; border-radius: 0 !important; }
        }
        @media (max-width: 600px) {
          .resume-header { padding: 24px 20px !important; }
          .resume-body { padding: 24px 20px !important; }
          .topbar-buttons { gap: 6px !important; }
          .topbar-btn-text { display: none; }
        }
        .share-btn:hover { opacity: 0.85; transform: scale(1.02); }
        .share-option:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* ── Top Bar ── */}
      <div className="no-print" style={{
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0", padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 8h10M7 12h6M7 16h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Resume<span style={{ color: "#6366f1" }}>AI</span></span>
        </div>

        {/* Buttons */}
        <div className="topbar-buttons" style={{ display: "flex", gap: 8, alignItems: "center", position: "relative" }}>

          {/* Share Button */}
          <div style={{ position: "relative" }}>
            <button
              className="share-btn"
              onClick={() => setShowShareMenu(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s"
              }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="topbar-btn-text">Share</span>
            </button>

            {/* Share Dropdown */}
            {showShareMenu && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                minWidth: 220, zIndex: 200, overflow: "hidden",
                animation: "fadeIn 0.15s ease"
              }}>
                <div style={{ padding: "10px 14px 6px", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Share Resume
                </div>

                {/* Copy Link */}
                <div className="share-option" onClick={handleCopy} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", cursor: "pointer", transition: "background 0.15s"
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: copyDone ? "#dcfce7" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {copyDone
                      ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10" stroke="#475569" strokeWidth="2" strokeLinecap="round"/></svg>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{copyDone ? "Link Copied!" : "Copy Link"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Share the public URL</div>
                  </div>
                </div>

                <div style={{ height: 1, background: "#f1f5f9", margin: "0 14px" }} />

                {/* WhatsApp */}
                <div className="share-option" onClick={() => handleShare("whatsapp")} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", cursor: "pointer", transition: "background 0.15s"
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#16a34a"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.05 2C6.495 2 2.05 6.445 2.05 12c0 1.822.49 3.524 1.338 4.99L2 22l5.15-1.348A9.902 9.902 0 0012.05 22c5.555 0 10-4.445 10-10S17.605 2 12.05 2zm0 18.2a8.19 8.19 0 01-4.17-1.141l-.299-.178-3.057.8.82-2.981-.195-.307A8.163 8.163 0 013.85 12c0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>WhatsApp</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Send via WhatsApp</div>
                  </div>
                </div>

                {/* Email */}
                <div className="share-option" onClick={() => handleShare("email")} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", cursor: "pointer", transition: "background 0.15s"
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Email</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Send via Email / Gmail</div>
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="share-option" onClick={() => handleShare("linkedin")} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", cursor: "pointer", transition: "background 0.15s"
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#1d4ed8"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>LinkedIn</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Post on LinkedIn</div>
                  </div>
                </div>

                {/* Twitter/X */}
                <div className="share-option" onClick={() => handleShare("twitter")} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", cursor: "pointer", transition: "background 0.15s"
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#0f172a"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.243 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Twitter / X</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Post on Twitter</div>
                  </div>
                </div>

                <div style={{ height: 1, background: "#f1f5f9", margin: "0 14px" }} />

                {/* Download PDF */}
                <div className="share-option" onClick={handlePrint} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px 12px", cursor: "pointer", transition: "background 0.15s"
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" stroke="#059669" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Save as PDF</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Print or download PDF</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Print button */}
          <button onClick={handlePrint} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", background: "#059669", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            <span className="topbar-btn-text">Save PDF</span>
          </button>

          <button onClick={() => navigate("/")} style={{
            padding: "8px 16px", background: "transparent",
            border: "1px solid #e2e8f0", color: "#64748b",
            borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>
            <span className="topbar-btn-text">Create Your Own →</span>
            <span style={{ display: "none" }} className="topbar-btn-icon">+</span>
          </button>
        </div>
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div onClick={() => setShowShareMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
      )}

      {/* ── Resume Content ── */}
      <div style={{ maxWidth: 900, margin: "32px auto", padding: "0 16px 64px" }}>
        <div className="resume-card" style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>

          {/* Header */}
          <div className="resume-header" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", padding: "40px 48px", color: "#fff" }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              {resume.full_name || "No Name"}
            </h1>
            {resume.professional_title && (
              <p style={{ fontSize: 16, opacity: 0.9, margin: "0 0 16px" }}>{resume.professional_title}</p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", fontSize: 13, opacity: 0.85 }}>
              {resume.email && <span>✉ {resume.email}</span>}
              {resume.phone && <span>📞 {resume.phone}</span>}
              {resume.location && <span>📍 {resume.location}</span>}
              {resume.linkedin && <a href={resume.linkedin.startsWith("http") ? resume.linkedin : `https://${resume.linkedin}`} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>🔗 LinkedIn</a>}
              {resume.website && <a href={resume.website.startsWith("http") ? resume.website : `https://${resume.website}`} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>🌐 Portfolio</a>}
            </div>
          </div>

          {/* Body */}
          <div className="resume-body" style={{ padding: "40px 48px" }}>

            {resume.summary && (
              <Section title="Professional Summary">
                <p style={{ color: "#475569", lineHeight: 1.7, margin: 0 }}>{resume.summary}</p>
              </Section>
            )}

            {experiences?.length > 0 && (
              <Section title="Work Experience">
                {experiences.map((exp, i) => (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{exp.role}</span>
                        <span style={{ color: "#6366f1", fontWeight: 600 }}> @ {exp.company}</span>
                      </div>
                      <span style={{ fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" }}>
                        {exp.start_date} – {exp.end_date || "Present"}
                      </span>
                    </div>
                    {exp.description && (
                      <p style={{ color: "#475569", lineHeight: 1.6, margin: "8px 0 0", paddingLeft: 12, borderLeft: "2px solid #e2e8f0" }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </Section>
            )}

            {educations?.length > 0 && (
              <Section title="Education">
                {educations.map((edu, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{edu.degree}</span>
                        <span style={{ color: "#64748b" }}> – {edu.institution}</span>
                      </div>
                      <span style={{ fontSize: 13, color: "#94a3b8" }}>{edu.start_year} – {edu.end_year}</span>
                    </div>
                    {edu.score && <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Score: {edu.score}</p>}
                  </div>
                ))}
              </Section>
            )}

            {skills?.length > 0 && (
              <Section title="Skills">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {skills.map((s, i) => (
                    <span key={i} style={{
                      background: "#eef2ff", color: "#4f46e5",
                      border: "1px solid #c7d2fe", borderRadius: 20,
                      padding: "4px 14px", fontSize: 13, fontWeight: 500
                    }}>
                      {s.name}{s.level ? ` · ${s.level}` : ""}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {projects?.length > 0 && (
              <Section title="Projects">
                {projects.map((p, i) => (
                  <div key={i} style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{p.title}</span>
                      {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#6366f1", fontWeight: 600 }}>View Project →</a>}
                    </div>
                    {p.tech_stack && <p style={{ fontSize: 13, color: "#6366f1", margin: "4px 0", fontStyle: "italic" }}>{p.tech_stack}</p>}
                    {p.description && <p style={{ color: "#475569", lineHeight: 1.6, margin: "6px 0 0" }}>{p.description}</p>}
                  </div>
                ))}
              </Section>
            )}

            {certs?.length > 0 && (
              <Section title="Certifications">
                {certs.map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < certs.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{c.name}</span>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{c.issuer}{c.issue_date ? ` · ${c.issue_date}` : ""}</span>
                  </div>
                ))}
              </Section>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="no-print" style={{ textAlign: "center", marginTop: 24, color: "#94a3b8", fontSize: 13 }}>
          Made with <span style={{ color: "#6366f1", fontWeight: 600 }}>ResumeAI</span> ·{" "}
          <span onClick={() => navigate("/")} style={{ color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>
            Create your own resume →
          </span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>{title}</h2>
        <div style={{ flex: 1, height: 2, background: "linear-gradient(90deg, #6366f1, transparent)" }} />
      </div>
      {children}
    </div>
  );
}
