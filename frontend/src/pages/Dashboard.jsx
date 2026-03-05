import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resumeService } from "../services/resumeService";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true); // Starts strictly as loading
  const navigate = useNavigate();

  const fetchResumes = async (token) => {
    try {
      const res = await fetch("/api/resume/all", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error("Failed to fetch resumes");
      }

      const data = await res.json();
      setResumes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      // ONLY set loading to false AFTER the data is safely locked in state
      setLoading(false); 
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Force loading to true every time we refetch
    setLoading(true); 
    fetchResumes(token);
  }, [navigate]);

  const createResume = () => {
    navigate("/resume/new");
  };

  const duplicateResume = async (e, resume) => {
    e.stopPropagation();
    try {
      setLoading(true); // Show loading while duplicating
      await resumeService.create({
        title: `${resume.title} (Copy)`,
        summary: resume.summary,
        full_name: resume.full_name,
        email: resume.email,
        phone: resume.phone,
        linkedin: resume.linkedin,
      });
      // Refetch everything to keep state perfectly in sync
      const token = localStorage.getItem("token");
      fetchResumes(token);
    } catch (err) {
      alert("Failed to duplicate");
      setLoading(false);
    }
  };

  const deleteResume = async (e, id) => {
    e.stopPropagation();
    try {
      await resumeService.delete(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
         <div 
  className="flex items-center gap-3 group cursor-pointer"
  style={{
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  }}
  onMouseEnter={(e) => {
    const icon = e.currentTarget.querySelector('.logo-icon');
    if (icon) icon.style.transform = "scale(1.05) rotate(-2deg)";
  }}
  onMouseLeave={(e) => {
    const icon = e.currentTarget.querySelector('.logo-icon');
    if (icon) icon.style.transform = "scale(1) rotate(0deg)";
  }}
>
  {/* ANIMATED LOGO ICON */}
  <div 
    className="logo-icon w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden"
    style={{ 
      background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
      boxShadow: "0 8px 16px -4px rgba(37, 99, 235, 0.3)",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    }}
  >
    {/* Subtle Glass Reflection Overlay */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)'
    }} />
    
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path 
        d="M7 8h10M7 12h6M7 16h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round"
      />
    </svg>
  </div>

  {/* MODERN BRAND TEXT */}
  <div className="flex flex-col">
    <span 
      className="text-xl font-black tracking-tight leading-none"
      style={{ 
        color: "#0f172a",
        fontFamily: "'Inter', sans-serif" 
      }}
    >
      Resume<span className="text-blue-600">AI</span>
    </span>
    <div 
      className="h-1 w-0 group-hover:w-full transition-all duration-500 rounded-full"
      style={{ background: "linear-gradient(to right, #2563eb, #60a5fa)", marginTop: '2px' }}
    />
  </div>
</div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
  {/* USER PILL BADGE */}
  <div 
    style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "10px", 
      padding: "6px 14px", 
      background: "#f1f5f9", 
      borderRadius: "20px",
      border: "1px solid rgba(226, 232, 240, 0.8)",
      transition: "all 0.3s ease"
    }}
  >
    <span style={{ 
      fontSize: "16px", 
      display: "inline-block",
      animation: "wave-animation 2.5s infinite ease-in-out",
      transformOrigin: "70% 70%" 
    }}>
      👋
    </span>
    <span style={{ 
      fontSize: "14px", 
      fontWeight: "700", 
      color: "#334155",
      textTransform: "capitalize",
      letterSpacing: "-0.01em" 
    }}>
      {user?.email ? user.email.split("@")[0] : "User"}
    </span>
  </div>

  {/* ANIMATED LOGOUT BUTTON */}
  <button
    onClick={handleLogout}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#fee2e2";
      e.currentTarget.style.color = "#ef4444";
      e.currentTarget.style.transform = "scale(1.1) rotate(8deg)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = "#94a3b8";
      e.currentTarget.style.transform = "scale(1) rotate(0deg)";
    }}
    title="Logout"
    style={{ 
      padding: "10px", 
      borderRadius: "12px", 
      color: "#94a3b8", 
      cursor: "pointer", 
      border: "none",
      background: "transparent",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </button>

  {/* WAVE ANIMATION KEYFRAMES */}
  <style>
    {`
      @keyframes wave-animation {
        0% { transform: rotate( 0.0deg) }
       10% { transform: rotate(14.0deg) }
       20% { transform: rotate(-8.0deg) }
       30% { transform: rotate(14.0deg) }
       40% { transform: rotate(-4.0deg) }
       50% { transform: rotate(10.0deg) }
       60% { transform: rotate( 0.0deg) }
      100% { transform: rotate( 0.0deg) }
      }
    `}
  </style>
</div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-gray-500 mt-1">Create and manage your AI-powered resumes</p>
          </div>
          <button
            onClick={createResume}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Resume
          </button>
        </div>

        {/* THE FIX IS HERE: Strict conditional rendering */}
        {loading ? (
          /* State 1: Strictly Loading */
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          /* State 2: Strictly Empty (Only shows if loading is done AND resumes = 0) */
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-20 shadow-sm">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="text-gray-400 mb-4">
              <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No resumes yet</h3>
            <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">
              It looks like you haven't created a resume yet. Build your first AI-powered professional resume in minutes!
            </p>
            <button
              onClick={createResume}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Create Your First Resume
            </button>
          </div>
        ) : (
          /* State 3: Show Resumes Grid */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                onClick={() => navigate(`/resume/${resume.id}/edit`)}
                className="group bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path d="M7 8h10M7 12h6M7 16h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {/* Action buttons — visible on hover */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => duplicateResume(e, resume)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      title="Duplicate"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => deleteResume(e, resume.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{resume.title || "Untitled Resume"}</h3>
                <p className="text-sm text-gray-500">
                  Updated: {new Date(resume.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}