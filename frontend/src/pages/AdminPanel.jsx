import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const TABS = ["Dashboard", "Users", "Resumes"];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchStats = async () => {
    try { const res = await api.get("/admin/stats"); setStats(res.data); }
    catch (err) { if (err.response?.status === 403) { navigate("/dashboard"); return; } showToast("❌ Failed to load stats"); }
  };
  const fetchUsers = async () => {
    try { const res = await api.get("/admin/users"); setUsers(Array.isArray(res.data) ? res.data : []); }
    catch { showToast("❌ Failed to load users"); }
  };
  const fetchResumes = async () => {
    try { const res = await api.get("/admin/resumes"); setResumes(Array.isArray(res.data) ? res.data : []); }
    catch { showToast("❌ Failed to load resumes"); }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") { navigate("/dashboard"); return; }
    setLoading(true);
    Promise.all([fetchStats(), fetchUsers(), fetchResumes()]).finally(() => setLoading(false));
  }, []);

  const deleteUser = async (userId) => {
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      showToast("✅ " + res.data.message);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setResumes(prev => prev.filter(r => r.user_id !== userId));
      setConfirmDelete(null); setSelectedUser(null); fetchStats();
    } catch (err) { showToast("❌ " + (err.response?.data?.error || "Failed to delete user")); }
  };

  const changeRole = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      showToast("✅ " + res.data.message);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      fetchStats();
    } catch (err) { showToast("❌ " + (err.response?.data?.error || "Failed to change role")); }
  };

  const deleteResume = async (resumeId) => {
    try {
      await api.delete(`/admin/resumes/${resumeId}`);
      showToast("✅ Resume deleted");
      setResumes(prev => prev.filter(r => r.id !== resumeId));
      setConfirmDelete(null); fetchStats();
    } catch { showToast("❌ Failed to delete resume"); }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredResumes = resumes.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.user_name.toLowerCase().includes(search.toLowerCase()) ||
    r.user_email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#f8fafc,#eef2ff)", fontFamily:"Inter,system-ui,sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:40, height:40, border:"4px solid #2563eb", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 16px" }} />
        <p style={{ color:"#64748b", fontSize:14 }}>Loading admin panel...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#f8fafc 0%,#eef2ff 50%,#f5f3ff 100%)", fontFamily:"'Inter',system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg)} }
        .adm-table { width:100%; border-collapse:collapse; }
        .adm-table-wrap { display:block; overflow-x:auto; -webkit-overflow-scrolling:touch; border-radius:0 0 14px 14px; }
        .adm-th { padding:10px 14px; text-align:left; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid #f1f5f9; background:#fafbfc; white-space:nowrap; }
        .adm-td { padding:10px 14px; font-size:13px; color:#334155; border-bottom:1px solid #f8fafc; white-space:nowrap; }
        .adm-tr:hover { background:#f8fafc; }
        .adm-badge-admin { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; background:#eef2ff; color:#6366f1; }
        .adm-badge-user { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; background:#ecfdf5; color:#059669; }
        .adm-btn-danger { background:#fee2e2; color:#dc2626; border:none; border-radius:7px; padding:5px 10px; font-size:11px; font-weight:600; cursor:pointer; }
        .adm-btn-role { background:#eef2ff; color:#6366f1; border:none; border-radius:7px; padding:5px 10px; font-size:11px; font-weight:600; cursor:pointer; white-space:nowrap; }
        .adm-tab { padding:8px 14px; border-radius:8px; border:none; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .adm-search { border:2px solid #e2e8f0; border-radius:10px; padding:8px 12px; font-size:13px; outline:none; background:#f8fafc; width:100%; box-sizing:border-box; max-width:300px; }
        .adm-search:focus { border-color:#6366f1; }
        .adm-card { background:#fff; border-radius:14px; box-shadow:0 1px 4px rgba(0,0,0,0.04); overflow:hidden; border:1px solid #e2e8f0; margin-bottom:16px; }
        .adm-card-header { padding:14px 18px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }

        @media (max-width:640px) {
          .adm-header-title { font-size:14px !important; }
          .adm-header-email { display:none; }
          .adm-stat-grid { grid-template-columns:repeat(3,1fr) !important; gap:10px !important; }
          .adm-stat-num { font-size:24px !important; }
          .adm-tabs { gap:4px !important; }
          .adm-tab { padding:7px 10px !important; font-size:12px !important; }
          .adm-recent-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{ background:"linear-gradient(135deg,#0f172a,#1e293b)", color:"#fff", padding:"0 16px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div className="adm-header-title" style={{ fontSize:17, fontWeight:800, display:"flex", alignItems:"center", gap:8 }}>
          🛡️ Admin Panel
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
          <span className="adm-header-email" style={{ opacity:0.7, fontSize:12 }}>{user?.email}</span>
          <button onClick={() => navigate("/dashboard")} style={{ background:"#1e293b", color:"#94a3b8", border:"1px solid #334155", borderRadius:6, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>
            ← Dashboard
          </button>
          <button onClick={() => { logout(); navigate("/login"); }} style={{ background:"#dc2626", color:"#fff", border:"none", borderRadius:6, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>
            Logout
          </button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:70, right:16, zIndex:999, background: toast.startsWith("✅") ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#dc2626,#ef4444)", color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:14, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.15)", maxWidth:"calc(100vw - 32px)" }}>
          {toast}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:16 }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background:"#fff", borderRadius:20, padding:28, width:"min(400px,100%)", boxShadow:"0 24px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:800, color:"#dc2626" }}>⚠️ Confirm Delete</h3>
            <p style={{ color:"#475569", fontSize:14, lineHeight:1.6, margin:"0 0 24px" }}>
              {confirmDelete.type === "user"
                ? `This will permanently delete user "${confirmDelete.name}" and ALL their resumes.`
                : `This will permanently delete resume "${confirmDelete.name}".`}
            </p>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ background:"#f1f5f9", color:"#475569", border:"none", borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Cancel</button>
              <button onClick={() => confirmDelete.type === "user" ? deleteUser(confirmDelete.id) : deleteResume(confirmDelete.id)}
                style={{ background:"#dc2626", color:"#fff", border:"none", borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"20px 12px" }}>

        {/* Tabs */}
        <div className="adm-tabs" style={{ display:"flex", gap:4, background:"#e2e8f0", borderRadius:10, padding:4, marginBottom:20, width:"fit-content" }}>
          {TABS.map((tab, i) => (
            <button key={tab} className="adm-tab"
              onClick={() => { setActiveTab(i); setSearch(""); setSelectedUser(null); }}
              style={{ background: activeTab===i ? "#fff" : "transparent", color: activeTab===i ? "#4f46e5" : "#64748b", boxShadow: activeTab===i ? "0 1px 4px rgba(99,102,241,0.12)" : "none" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 0 && stats && (
          <div>
            <div className="adm-stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
              {[
                { label:"Total Users", val:stats.total_users, color:"#6366f1" },
                { label:"Total Resumes", val:stats.total_resumes, color:"#10b981" },
                { label:"Admins", val:stats.total_admins, color:"#8b5cf6" },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background:"#fff", borderRadius:14, padding:"20px 16px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", borderLeft:`4px solid ${color}` }}>
                  <p className="adm-stat-num" style={{ fontSize:30, fontWeight:800, color:"#0f172a", margin:0 }}>{val}</p>
                  <p style={{ fontSize:13, color:"#64748b", marginTop:4, margin:"4px 0 0" }}>{label}</p>
                </div>
              ))}
            </div>

            <div className="adm-recent-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
              <div className="adm-card">
                <div className="adm-card-header"><span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Recent Users</span></div>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead><tr><th className="adm-th">Name</th><th className="adm-th">Email</th><th className="adm-th">Joined</th></tr></thead>
                    <tbody>
                      {stats.recent_users.map(u => (
                        <tr key={u.id} className="adm-tr">
                          <td className="adm-td" style={{ fontWeight:600 }}>{u.name}</td>
                          <td className="adm-td">{u.email}</td>
                          <td className="adm-td">{formatDate(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="adm-card">
                <div className="adm-card-header"><span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>Recent Resumes</span></div>
                <div className="adm-table-wrap">
                  <table className="adm-table">
                    <thead><tr><th className="adm-th">Title</th><th className="adm-th">Template</th><th className="adm-th">Created</th></tr></thead>
                    <tbody>
                      {stats.recent_resumes.map(r => (
                        <tr key={r.id} className="adm-tr">
                          <td className="adm-td" style={{ fontWeight:600 }}>{r.title}</td>
                          <td className="adm-td">{r.template_name}</td>
                          <td className="adm-td">{formatDate(r.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 1 && !selectedUser && (
          <div className="adm-card">
            <div className="adm-card-header">
              <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>All Users ({filteredUsers.length})</span>
              <input className="adm-search" placeholder="🔍 Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {filteredUsers.length === 0 ? (
              <div style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:14 }}>No users found</div>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th className="adm-th">ID</th>
                      <th className="adm-th">Name</th>
                      <th className="adm-th">Email</th>
                      <th className="adm-th">Role</th>
                      <th className="adm-th">Resumes</th>
                      <th className="adm-th">Joined</th>
                      <th className="adm-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="adm-tr" style={{ cursor:"pointer" }} onClick={() => setSelectedUser(u)}>
                        <td className="adm-td">{u.id}</td>
                        <td className="adm-td" style={{ fontWeight:600 }}>{u.name}</td>
                        <td className="adm-td">{u.email}</td>
                        <td className="adm-td"><span className={u.role==="admin"?"adm-badge-admin":"adm-badge-user"}>{u.role}</span></td>
                        <td className="adm-td">{u.resume_count}</td>
                        <td className="adm-td">{formatDate(u.created_at)}</td>
                        <td className="adm-td" onClick={e => e.stopPropagation()}>
                          <div style={{ display:"flex", gap:6 }}>
                            <button className="adm-btn-role" onClick={() => changeRole(u.id, u.role==="admin"?"user":"admin")}>
                              {u.role==="admin" ? "→ User" : "→ Admin"}
                            </button>
                            <button className="adm-btn-danger" onClick={() => setConfirmDelete({ type:"user", id:u.id, name:u.name })}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* USER DETAIL */}
        {activeTab === 1 && selectedUser && (
          <div>
            <button onClick={() => setSelectedUser(null)} style={{ background:"none", border:"none", color:"#6366f1", cursor:"pointer", fontSize:13, fontWeight:600, marginBottom:12, display:"flex", alignItems:"center", gap:6 }}>
              ← Back to Users
            </button>
            <div className="adm-card">
              <div style={{ padding:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
                  <div>
                    <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:800, color:"#0f172a" }}>{selectedUser.name}</h2>
                    <p style={{ margin:0, color:"#64748b", fontSize:14 }}>{selectedUser.email}</p>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <span className={selectedUser.role==="admin"?"adm-badge-admin":"adm-badge-user"}>{selectedUser.role}</span>
                    <button className="adm-btn-role"
                      onClick={() => { changeRole(selectedUser.id, selectedUser.role==="admin"?"user":"admin"); setSelectedUser(prev => ({ ...prev, role:prev.role==="admin"?"user":"admin" })); }}>
                      {selectedUser.role==="admin" ? "Demote to User" : "Promote to Admin"}
                    </button>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:12, marginBottom:20 }}>
                  {[["User ID",selectedUser.id],["Total Resumes",selectedUser.resume_count],["Joined",formatDate(selectedUser.created_at)]].map(([l,v]) => (
                    <div key={l} style={{ background:"#f8fafc", borderRadius:10, padding:14 }}>
                      <p style={{ margin:0, fontSize:12, color:"#64748b" }}>{l}</p>
                      <p style={{ margin:"4px 0 0", fontWeight:700, fontSize:15 }}>{v}</p>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>Resumes by this user</h3>
                {resumes.filter(r => r.user_id===selectedUser.id).length === 0 ? (
                  <div style={{ padding:32, textAlign:"center", color:"#94a3b8", fontSize:14 }}>No resumes</div>
                ) : (
                  <div className="adm-table-wrap">
                    <table className="adm-table">
                      <thead><tr><th className="adm-th">ID</th><th className="adm-th">Title</th><th className="adm-th">Template</th><th className="adm-th">Created</th><th className="adm-th">Actions</th></tr></thead>
                      <tbody>
                        {resumes.filter(r => r.user_id===selectedUser.id).map(r => (
                          <tr key={r.id} className="adm-tr">
                            <td className="adm-td">{r.id}</td>
                            <td className="adm-td" style={{ fontWeight:600 }}>{r.title}</td>
                            <td className="adm-td">{r.template_name}</td>
                            <td className="adm-td">{formatDate(r.created_at)}</td>
                            <td className="adm-td">
                              <button className="adm-btn-danger" onClick={() => setConfirmDelete({ type:"resume", id:r.id, name:r.title })}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RESUMES TAB */}
        {activeTab === 2 && (
          <div className="adm-card">
            <div className="adm-card-header">
              <span style={{ fontSize:14, fontWeight:700, color:"#0f172a" }}>All Resumes ({filteredResumes.length})</span>
              <input className="adm-search" placeholder="🔍 Search resumes..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {filteredResumes.length === 0 ? (
              <div style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:14 }}>No resumes found</div>
            ) : (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th className="adm-th">ID</th>
                      <th className="adm-th">Title</th>
                      <th className="adm-th">Owner</th>
                      <th className="adm-th">Template</th>
                      <th className="adm-th">Style</th>
                      <th className="adm-th">Created</th>
                      <th className="adm-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResumes.map(r => (
                      <tr key={r.id} className="adm-tr">
                        <td className="adm-td">{r.id}</td>
                        <td className="adm-td" style={{ fontWeight:600 }}>{r.title}</td>
                        <td className="adm-td">
                          <div style={{ fontWeight:600 }}>{r.user_name}</div>
                          <div style={{ fontSize:11, color:"#94a3b8" }}>{r.user_email}</div>
                        </td>
                        <td className="adm-td">{r.template_name}</td>
                        <td className="adm-td">{r.template_style || "—"}</td>
                        <td className="adm-td">{formatDate(r.created_at)}</td>
                        <td className="adm-td">
                          <button className="adm-btn-danger" onClick={() => setConfirmDelete({ type:"resume", id:r.id, name:r.title })}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}