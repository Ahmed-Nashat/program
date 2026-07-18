import { useState, useEffect, useRef, useMemo } from "react";
import api from "../api/axios";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf({
  position: { x: 'right', y: 'top' },
  types: [
    {
      type: 'info',
      background: '#3B82F6',
      icon: false
    }
  ]
});

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const Sk = ({ h = 14, w = "100%", r = 6, mb = 0 }) => (
  <div className="skeleton-pulse" style={{ height: h, width: w, borderRadius: r, marginBottom: mb }} />
);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric"
  }).format(new Date(dateStr));
};

const getRoleColor = (role) => {
  switch (role) {
    case "student": return "#9CA3AF";
    case "instructor": return "#F97316";
    case "admin": return "#8B5CF6";
    case "superadmin": return "#EF4444";
    default: return "#9CA3AF";
  }
};

const hexToRgba = (hex, alpha) => {
  let r = 0, g = 0, b = 0;
  if (hex.startsWith('var')) return `rgba(156, 163, 175, ${alpha})`; // fallback if var passed
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getStatusColor = (status) => {
  switch (status) {
    case "active": return "#10B981";
    case "suspended": return "#F59E0B";
    case "banned": return "#EF4444";
    case "pending_verification": return "#3B82F6";
    default: return "#9CA3AF";
  }
};

/* ─── Components ─────────────────────────────────────────────────────────── */

const Badge = ({ label, color }) => (
  <span
    style={{
      padding: "4px 10px",
      borderRadius: "99px",
      fontSize: "0.75rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: color,
      background: `${color}15`,
      border: `1px solid ${color}30`,
      whiteSpace: "nowrap"
    }}
  >
    {label}
  </span>
);

const UserAvatar = ({ name, color }) => {
  const initial = name ? name.charAt(0).toUpperCase() : "?";
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: `${color}20`,
        border: `1px solid ${color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        color: color,
        flexShrink: 0
      }}
    >
      {initial}
    </div>
  );
};

/* ─── User Profile Drawer ────────────────────────────────────────────────── */
const UserProfileDrawer = ({ user, onClose, onAction, currentUserRole }) => {
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const roleMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target)) {
        setIsRoleMenuOpen(false);
      }
    };
    if (isRoleMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isRoleMenuOpen]);

  if (!user) return null;

  const canModify = !(
    user.role === 'superadmin' || 
    (user.role === 'admin' && currentUserRole !== 'superadmin') ||
    user._id === "current_user_id_placeholder" // Ideally pass currentUserId
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          background: "var(--c-bg)",
          borderLeft: "1px solid var(--c-border-subtle)",
          padding: "32px",
          overflowY: "auto",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.3)",
          animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="glass-card"
          style={{ padding: "8px", border: "none", background: "rgba(255,255,255,0.05)", cursor: "pointer", marginBottom: "24px", color: "var(--c-sub)" }}
        >
          ✕ Close
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px" }}>
          <UserAvatar name={user.name} color={getRoleColor(user.role)} />
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.4rem" }}>{user.name}</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <Badge label={user.role} color={getRoleColor(user.role)} />
              <Badge label={user.status || "Active"} color={getStatusColor(user.status || "active")} />
            </div>
          </div>
        </div>

        <h3 style={{ borderBottom: "1px solid var(--c-border-subtle)", paddingBottom: "8px", color: "var(--c-sub)", fontSize: "0.9rem", textTransform: "uppercase" }}>
          Personal Information
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", margin: "16px 0 32px" }}>
          <div>
            <div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Email</div>
            <div style={{ fontWeight: 500 }}>{user.email}</div>
          </div>
          <div>
            <div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Phone</div>
            <div style={{ fontWeight: 500 }}>{user.phone || "—"}</div>
          </div>
          <div>
            <div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>University</div>
            <div style={{ fontWeight: 500 }}>{user.university || "—"}</div>
          </div>
          <div>
            <div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Student ID</div>
            <div style={{ fontWeight: 500 }}>{user.studentId || "—"}</div>
          </div>
        </div>

        <h3 style={{ borderBottom: "1px solid var(--c-border-subtle)", paddingBottom: "8px", color: "var(--c-sub)", fontSize: "0.9rem", textTransform: "uppercase" }}>
          Account Information
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", margin: "16px 0 32px" }}>
          <div>
            <div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Registration Date</div>
            <div style={{ fontWeight: 500 }}>{formatDate(user.createdAt)}</div>
          </div>
          <div>
            <div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Last Login</div>
            <div style={{ fontWeight: 500 }}>{formatDate(user.lastLogin)}</div>
          </div>
          <div>
            <div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Email Verified</div>
            <div style={{ fontWeight: 500, color: user.emailVerified ? "#10B981" : "#F59E0B" }}>
              {user.emailVerified ? "Yes" : "No"}
            </div>
          </div>
        </div>

        {canModify && (
          <>
            <h3 style={{ borderBottom: "1px solid var(--c-border-subtle)", paddingBottom: "8px", color: "var(--c-sub)", fontSize: "0.9rem", textTransform: "uppercase" }}>
              Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ position: "relative", width: "100%" }} ref={roleMenuRef}>
                <button
                  className="user-search-input"
                  style={{
                    padding: "10px 14px",
                    width: "100%",
                    cursor: "pointer",
                    color: "var(--c-light)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderRadius: '12px',

                  }}
                  onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                >
                  <span style={{ textTransform: "capitalize" }}>{user.role}</span>
                  <span>▾</span>
                </button>

                {isRoleMenuOpen && (
                  <div
                    className="glass-card"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      width: "100%",
                      marginTop: "6px",
                      zIndex: 100,
                      display: "flex",
                      flexDirection: "column",
                      padding: "6px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                    }}
                  >
                    {['student', 'instructor', 'admin'].map(r => (
                      <button
                        key={r}
                        style={{
                          padding: "10px 14px",
                          background: "transparent",
                          border: "1px solid transparent",
                          color: "var(--text-h)",
                          textAlign: "left",
                          cursor: "pointer",
                          borderRadius: "12px",
                          textTransform: "capitalize",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => {
                          const c = getRoleColor(r);
                          e.currentTarget.style.background = hexToRgba(c, 0.1);
                          e.currentTarget.style.border = `1px solid ${hexToRgba(c, 0.3)}`;
                          e.currentTarget.style.color = c;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.border = "1px solid transparent";
                          e.currentTarget.style.color = "var(--text-h)";
                        }}
                        onClick={() => {
                          onAction('changeRole', user._id, r);
                          setIsRoleMenuOpen(false);
                        }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                {user.status === 'suspended' ? (
                  <button className="user-search-input" style={{ flex: 1, padding: "10px 14px", cursor: "pointer", background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }} onClick={() => onAction('activate', user._id)}>
                    Activate Account
                  </button>
                ) : (
                  <button className="user-search-input" style={{ flex: 1, padding: "10px 14px", cursor: "pointer", background: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)" }} onClick={() => onAction('suspend', user._id)}>
                    Suspend Account
                  </button>
                )}
                <button className="user-search-input" style={{ flex: 1, padding: "10px 14px", cursor: "pointer", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }} onClick={() => { if(window.confirm('Delete this account?')) onAction('delete', user._id) }}>
                  Soft Delete Account
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Main UserManagement Component ──────────────────────────────────────── */
export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State: Search & Filters
  const [search, setSearch] = useState("");
  const [roleTab, setRoleTab] = useState("student");
  const [advancedFilters, setAdvancedFilters] = useState({
    status: "",
    isVerified: ""
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // State: Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // State: Selection & Drawer
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [viewUser, setViewUser] = useState(null);

  // Fetch logic
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        role: roleTab,
        ...(search && { search }),
        ...(advancedFilters.status && { status: advancedFilters.status }),
        ...(advancedFilters.isVerified && { isVerified: advancedFilters.isVerified })
      });
      
      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.users || []);
      
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages);
        setTotalItems(res.data.pagination.totalItems);
      }
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, roleTab, advancedFilters]);

  // Debounced Search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  // Actions
  const handleSingleAction = async (action, id, data) => {
    try {
      if (action === 'suspend') await api.patch(`/admin/users/${id}/suspend`);
      if (action === 'activate') await api.patch(`/admin/users/${id}/activate`);
      if (action === 'delete') await api.delete(`/admin/users/${id}/soft-delete`);
      if (action === 'changeRole') await api.patch(`/admin/users/${id}/role`, { role: data });
      
      setViewUser(null);
      fetchUsers();
      notyf.success(`Action '${action}' completed successfully`);
    } catch (err) {
      notyf.error(err.response?.data?.message || "Failed to perform action");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    try {
      const userIds = Array.from(selectedIds);
      if (action === 'suspend') await api.post(`/admin/users/bulk-suspend`, { userIds });
      if (action === 'activate') await api.post(`/admin/users/bulk-activate`, { userIds });
      if (action === 'delete') await api.post(`/admin/users/bulk-delete`, { userIds });
      setSelectedIds(new Set());
      fetchUsers();
      notyf.success(`Bulk action '${action}' completed successfully`);
    } catch (err) {
      notyf.error(err.response?.data?.message || "Failed to perform bulk action");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map(u => u._id)));
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Header & Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", margin: "0 0 4px" }}>User Management</h2>
          <p style={{ margin: 0, color: "var(--c-sub)", fontSize: "0.9rem" }}>Manage platform accounts, roles, and statuses.</p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="search-bar-glass" style={{ width: "320px" }}>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="user-search-input"
            />
          </div>
          <button 
            className="user-search-input" 
            style={{ padding: "10px 16px", cursor: "pointer", width: "auto" }}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="glass-card" style={{ padding: "20px", display: "flex", gap: "24px", animation: "fadeIn 0.2s" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--c-sub)", fontWeight: 600, textTransform: "uppercase" }}>Account Status</label>
            <select 
              value={advancedFilters.status} 
              onChange={e => { setAdvancedFilters(p => ({ ...p, status: e.target.value })); setPage(1); }}
              style={{ padding: "8px", borderRadius: "6px", background: "var(--c-bg-dark)", color: "var(--c-light)", border: "1px solid var(--c-border-subtle)" }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending_verification">Pending Verification</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--c-sub)", fontWeight: 600, textTransform: "uppercase" }}>Verification</label>
            <select 
              value={advancedFilters.isVerified} 
              onChange={e => { setAdvancedFilters(p => ({ ...p, isVerified: e.target.value })); setPage(1); }}
              style={{ padding: "8px", borderRadius: "6px", background: "var(--c-bg-dark)", color: "var(--c-light)", border: "1px solid var(--c-border-subtle)" }}
            >
              <option value="">All</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button 
              onClick={() => { setAdvancedFilters({ status: "", isVerified: "" }); setSearch(""); setPage(1); }}
              style={{ padding: "9px 16px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer" }}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Role Tabs */}
      <div className="role-tabs" style={{ marginTop: "4px", marginBottom: "20px" }}>
        {[
          { id: "student", label: "Students" },
          { id: "instructor", label: "Instructors" },
          { id: "admin", label: "Admins" },
          { id: "superadmin", label: "Super Admins" },
        ].filter(t => !(t.id === "superadmin" && currentUser?.role !== "superadmin"))
         .map(tab => (
          <button
            key={tab.id}
            onClick={() => { setRoleTab(tab.id); setPage(1); }}
            className={`role-tab-button ${roleTab === tab.id ? "active" : ""}`}
            data-role={tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div style={{ 
          background: "linear-gradient(90deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))", 
          border: "1px solid rgba(59,130,246,0.2)",
          padding: "12px 24px",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          animation: "fadeIn 0.2s"
        }}>
          <span style={{ fontWeight: 600, color: "var(--c-light)" }}>{selectedIds.size} users selected</span>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => handleBulkAction('activate')} style={{ padding: "6px 14px", borderRadius: "6px", background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer" }}>Activate</button>
            <button onClick={() => handleBulkAction('suspend')} style={{ padding: "6px 14px", borderRadius: "6px", background: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)", cursor: "pointer" }}>Suspend</button>
            <button onClick={() => notyf.open({ type: 'info', message: 'Export functionality coming soon' })} style={{ padding: "6px 14px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", color: "var(--c-light)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>Export CSV</button>
            <button onClick={() => { if(window.confirm('Delete selected users?')) handleBulkAction('delete') }} style={{ padding: "6px 14px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card user-management-table-card">
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "var(--c-border-subtle)" }}>
            <tr>
              <th style={{ padding: "16px", width: "40px", borderTopLeftRadius: "15px" }}>
                <input 
                  type="checkbox" 
                  checked={users.length > 0 && selectedIds.size === users.length}
                  onChange={toggleSelectAll}
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--c-sub)" }}>User</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--c-sub)" }}>Role</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--c-sub)" }}>Status</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--c-sub)" }}>Registered</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--c-sub)", textAlign: "right", borderTopRightRadius: "15px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--c-border-subtle)" }}>
                  <td style={{ padding: "16px" }}><Sk w={16} h={16} /></td>
                  <td style={{ padding: "16px" }}><div style={{ display: "flex", gap: "12px", alignItems: "center" }}><Sk w={36} h={36} r="50%" /><Sk w="120px" /></div></td>
                  <td style={{ padding: "16px" }}><Sk w={60} /></td>
                  <td style={{ padding: "16px" }}><Sk w={70} /></td>
                  <td style={{ padding: "16px" }}><Sk w={90} /></td>
                  <td style={{ padding: "16px", textAlign: "right" }}><Sk w={80} style={{ display: "inline-block" }} /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "48px 24px", textAlign: "center", color: "var(--c-sub)" }}>
                  No users found matching your criteria.
                  { (search || advancedFilters.status || advancedFilters.isVerified) && (
                    <div style={{ marginTop: "12px" }}>
                      <button onClick={() => { setAdvancedFilters({status:"", isVerified:""}); setSearch(""); }} style={{ padding: "8px 16px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--c-light)", cursor: "pointer" }}>Clear Filters</button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u._id} className="role-row" style={{ borderTop: "1px solid var(--c-border-subtle)", cursor: "pointer" }} onClick={() => setViewUser(u)}>
                  <td style={{ padding: "16px" }} onClick={e => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(u._id)}
                      onChange={() => toggleSelect(u._id)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <UserAvatar name={u.name} color={getRoleColor(u.role)} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--c-sub)" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Badge label={u.role} color={getRoleColor(u.role)} />
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Badge label={u.status || "Active"} color={getStatusColor(u.status || "active")} />
                  </td>
                  <td style={{ padding: "16px", fontSize: "0.9rem", color: "var(--c-sub)" }}>
                    {formatDate(u.createdAt)}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewUser(u); }}
                      style={{ padding: "6px 12px", borderRadius: "6px", background: "var(--c-bg-subtle)", border: "1px solid var(--c-border-subtle)", color: "var(--text-h)", cursor: "pointer", fontSize: "0.8rem" }}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderTop: "1px solid var(--c-border-subtle)" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--c-sub)" }}>
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: page === 1 ? "var(--c-sub)" : "var(--c-light)", cursor: page === 1 ? "default" : "pointer" }}
              >
                Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: page === totalPages ? "var(--c-sub)" : "var(--c-light)", cursor: page === totalPages ? "default" : "pointer" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <UserProfileDrawer 
        user={viewUser} 
        onClose={() => setViewUser(null)} 
        onAction={handleSingleAction} 
        currentUserRole={currentUser?.role} 
      />

    </div>
  );
}
