import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf({
  position: { x: 'right', y: 'top' },
  types: [
    { type: 'info', background: '#3B82F6', icon: false }
  ]
});

// Helpers
const Sk = ({ h = 14, w = "100%", r = 6, mb = 0 }) => (
  <div className="skeleton-pulse" style={{ height: h, width: w, borderRadius: r, marginBottom: mb }} />
);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusColor = (status) => {
  switch (status) {
    case "published": return "#10B981"; // Green
    case "draft": return "#6B7280"; // Gray
    case "archived": return "#8B5CF6"; // Purple
    case "hidden": return "#4B5563"; // Dark Gray
    default: return "#9CA3AF";
  }
};

const getTypeBadgeColor = (type) => {
  switch (type) {
    case "video": return "#EF4444";
    case "reading": return "#3B82F6";
    case "quiz": return "#F59E0B";
    case "assignment": return "#8B5CF6";
    case "live": return "#10B981";
    default: return "#9CA3AF";
  }
};

const hexToRgba = (hex, alpha) => {
  let r = 0, g = 0, b = 0;
  if (hex.startsWith('var')) return `rgba(156, 163, 175, ${alpha})`;
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

const Badge = ({ label, color }) => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "99px",
    fontSize: "0.75rem",
    fontWeight: 600,
    background: hexToRgba(color, 0.1),
    color: color,
    border: `1px solid ${hexToRgba(color, 0.2)}`,
    textTransform: "capitalize"
  }}>
    {label}
  </span>
);

// Lesson Details Drawer
const LessonDetailsDrawer = ({ lesson, onClose, onAction }) => {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setIsStatusMenuOpen(false);
      }
    };
    if (isStatusMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isStatusMenuOpen]);

  if (!lesson) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end",
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: "520px", height: "100%", background: "var(--c-bg)",
          borderLeft: "1px solid var(--c-border-subtle)", padding: "32px", overflowY: "auto",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.3)", animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="glass-card" style={{ padding: "8px", border: "none", background: "rgba(255,255,255,0.05)", cursor: "pointer", marginBottom: "24px", color: "var(--c-sub)" }}>
          ← Back to Lessons
        </button>

        {/* Header */}
        <div style={{ position: "relative", marginBottom: "24px" }}>
          {lesson.thumbnailUrl ? (
            <img src={lesson.thumbnailUrl} alt={lesson.title} style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px", background: "var(--c-bg-dark)" }} />
          ) : (
            <div style={{ width: "100%", height: "200px", background: "var(--c-bg-dark)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-sub)" }}>
              No Thumbnail
            </div>
          )}
          <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "8px" }}>
            <Badge label={lesson.status} color={getStatusColor(lesson.status)} />
            <Badge label={lesson.lessonType} color={getTypeBadgeColor(lesson.lessonType)} />
          </div>
        </div>

        <h2 style={{ fontSize: "1.5rem", color: "var(--text-h)", marginBottom: "8px" }}>{lesson.title}</h2>
        <div style={{ color: "var(--c-sub)", fontSize: "0.9rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Course: <strong style={{ color: "var(--text-h)" }}>{lesson.section?.course?.title || 'Unknown'}</strong></span>
          <span>•</span>
          <span>Section: {lesson.section?.title || 'Unknown'}</span>
          <span>•</span>
          <span>Order: {lesson.order}</span>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
          <div style={{ position: "relative" }} ref={statusMenuRef}>
            <button 
              className="user-search-input" 
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              style={{ padding: "10px 16px", cursor: "pointer", background: "#3B82F6", color: "#fff", border: "none", fontWeight: 600 }}
            >
              Change Status ▾
            </button>
            {isStatusMenuOpen && (
              <div className="glass-card" style={{ position: "absolute", top: "100%", left: 0, marginTop: "8px", display: "flex", flexDirection: "column", padding: "6px", zIndex: 10, width: "160px" }}>
                {['draft', 'published', 'hidden', 'archived'].map(s => (
                  <button key={s} 
                    style={{ padding: "8px 12px", background: "transparent", border: "none", color: "var(--text-h)", textAlign: "left", cursor: "pointer", borderRadius: "4px", textTransform: "capitalize" }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--c-bg-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    onClick={() => { onAction(lesson._id, 'status', s); setIsStatusMenuOpen(false); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="user-search-input" onClick={() => onAction(lesson._id, 'delete')} style={{ padding: "10px 16px", cursor: "pointer", color: "#EF4444", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>
            Soft Delete
          </button>
        </div>

        {/* Details Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
          <div className="glass-card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--c-sub)", textTransform: "uppercase", marginBottom: "4px" }}>Instructor</div>
            <div style={{ color: "var(--text-h)", fontWeight: 500 }}>{lesson.section?.course?.instructor?.name || 'Unknown'}</div>
          </div>
          <div className="glass-card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--c-sub)", textTransform: "uppercase", marginBottom: "4px" }}>Duration</div>
            <div style={{ color: "var(--text-h)", fontWeight: 500 }}>{lesson.duration || 0} mins</div>
          </div>
          <div className="glass-card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--c-sub)", textTransform: "uppercase", marginBottom: "4px" }}>Views</div>
            <div style={{ color: "var(--text-h)", fontWeight: 500 }}>{lesson.views || 0}</div>
          </div>
          <div className="glass-card" style={{ padding: "16px" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--c-sub)", textTransform: "uppercase", marginBottom: "4px" }}>Completion Rate</div>
            <div style={{ color: "var(--text-h)", fontWeight: 500 }}>{lesson.completionRate || 0}%</div>
          </div>
          <div className="glass-card" style={{ padding: "16px", gridColumn: "1 / -1" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--c-sub)", textTransform: "uppercase", marginBottom: "4px" }}>Description</div>
            <div style={{ color: "var(--text-h)", fontSize: "0.9rem", lineHeight: "1.5" }}>{lesson.description || 'No description provided.'}</div>
          </div>
        </div>

        {/* Info */}
        <div style={{ fontSize: "0.8rem", color: "var(--c-sub)", display: "flex", justifyContent: "space-between" }}>
          <span>Created: {formatDate(lesson.createdAt)}</span>
          <span>Last Updated: {formatDate(lesson.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default function LessonManagement() {
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusTab, setStatusTab] = useState("all");
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({ type: "" });

  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const typeMenuRef = useRef(null);

  const [viewLesson, setViewLesson] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Debounced search
  const debounceRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target)) {
        setIsTypeMenuOpen(false);
      }
    };
    if (isTypeMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTypeMenuOpen]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/lessons/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch lesson stats");
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      let query = `?page=${page}&limit=${limit}&status=${statusTab}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (advancedFilters.type) query += `&type=${advancedFilters.type}`;
      
      const res = await api.get(`/admin/lessons${query}`);
      setLessons(res.data.lessons);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalItems);
    } catch (err) {
      notyf.error("Failed to fetch lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchLessons();
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, page, limit, statusTab, advancedFilters]);

  const handleAction = async (id, action, payload = null) => {
    try {
      if (action === 'status') {
        await api.patch(`/admin/lessons/${id}/status`, { status: payload });
        notyf.success(`Lesson status updated to ${payload}`);
      } else if (action === 'delete') {
        if (!window.confirm("Are you sure you want to delete this lesson?")) return;
        await api.delete(`/admin/lessons/${id}`);
        notyf.success("Lesson deleted");
        setViewLesson(null);
      }
      fetchLessons();
      fetchStats();
      
      if (viewLesson && viewLesson._id === id && action === 'status') {
        setViewLesson(prev => ({ ...prev, status: payload }));
      }
    } catch (err) {
      notyf.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    try {
      await api.post('/admin/lessons/bulk', {
        lessonIds: Array.from(selectedIds),
        action
      });
      notyf.success(`Successfully updated ${selectedIds.size} lessons`);
      setSelectedIds(new Set());
      fetchLessons();
      fetchStats();
    } catch (err) {
      notyf.error("Bulk action failed");
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === lessons.length && lessons.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(lessons.map(l => l._id)));
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {[
          { label: "Total Lessons", val: stats?.total || 0, color: "#3B82F6" },
          { label: "Published", val: stats?.published || 0, color: "#10B981" },
          { label: "Drafts", val: stats?.draft || 0, color: "#F59E0B" },
          { label: "Hidden", val: stats?.hidden || 0, color: "#4B5563" },
          { label: "Archived", val: stats?.archived || 0, color: "#8B5CF6" },
        ].map((kpi, i) => (
          <div key={i} className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: `radial-gradient(circle, ${hexToRgba(kpi.color, 0.2)} 0%, transparent 70%)`, transform: "translate(30%, -30%)" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--c-sub)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{kpi.label}</span>
            {stats ? (
              <span style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-h)" }}>{kpi.val}</span>
            ) : (
              <Sk h={32} w="60px" />
            )}
          </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="search-bar-glass" style={{ width: "320px" }}>
            <input type="text" placeholder="Search by lesson title..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="user-search-input" />
          </div>
          <button className="user-search-input" style={{ padding: "10px 16px", cursor: "pointer", width: "auto" }} onClick={() => setShowAdvanced(!showAdvanced)}>
            Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="glass-card" style={{ padding: "20px", display: "flex", gap: "24px", animation: "fadeIn 0.2s", position: "relative", zIndex: 50 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--c-sub)", fontWeight: 600, textTransform: "uppercase" }}>Lesson Type</label>
            <div style={{ position: "relative", width: "200px" }} ref={typeMenuRef}>
              <button
                className="user-search-input"
                style={{ padding: "8px 12px", width: "100%", cursor: "pointer", color: "var(--text-h)", display: "flex", justifyContent: "space-between", alignItems: "center", textTransform: "capitalize" }}
                onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen)}
              >
                <span>{advancedFilters.type || "All Types"}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--c-sub)" }}>▾</span>
              </button>
              {isTypeMenuOpen && (
                <div className="glass-card" style={{ position: "absolute", top: "100%", left: 0, width: "100%", marginTop: "6px", zIndex: 100, display: "flex", flexDirection: "column", padding: "6px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
                  {[
                    { value: "", label: "All Types" },
                    { value: "video", label: "Video" },
                    { value: "reading", label: "Reading" },
                    { value: "quiz", label: "Quiz" },
                    { value: "assignment", label: "Assignment" },
                    { value: "live", label: "Live Session" }
                  ].map(t => (
                    <button
                      key={t.value}
                      style={{ padding: "10px 14px", background: "transparent", border: "1px solid transparent", color: "var(--text-h)", textAlign: "left", cursor: "pointer", borderRadius: "6px", textTransform: "capitalize", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; e.currentTarget.style.border = "1px solid rgba(59,130,246,0.3)"; e.currentTarget.style.color = "#3B82F6"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.color = "var(--text-h)"; }}
                      onClick={() => { setAdvancedFilters(p => ({ ...p, type: t.value })); setPage(1); setIsTypeMenuOpen(false); }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="user-search-input" onClick={() => { setAdvancedFilters({ type: "" }); setSearch(""); setPage(1); }} style={{ padding: "9px 16px", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer" }}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="role-tabs" style={{ marginTop: "4px", marginBottom: "20px" }}>
        {[
          { id: "all", label: "All Lessons" },
          { id: "published", label: "Published" },
          { id: "draft", label: "Drafts" },
          { id: "hidden", label: "Hidden" },
          { id: "archived", label: "Archived" }
        ].map(tab => (
          <button
            key={tab.id}
            className={`role-tab-button ${statusTab === tab.id ? "active" : ""}`}
            onClick={() => { setStatusTab(tab.id); setPage(1); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="glass-card" style={{ padding: "12px 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "slideDown 0.2s", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <span style={{ fontWeight: 600, color: "var(--text-h)" }}>{selectedIds.size} selected</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="user-search-input" onClick={() => handleBulkAction('published')} style={{ padding: "6px 14px", cursor: "pointer" }}>Publish</button>
            <button className="user-search-input" onClick={() => handleBulkAction('hidden')} style={{ padding: "6px 14px", cursor: "pointer" }}>Hide</button>
            <button className="user-search-input" onClick={() => handleBulkAction('archived')} style={{ padding: "6px 14px", cursor: "pointer" }}>Archive</button>
            <button className="user-search-input" onClick={() => handleBulkAction('delete')} style={{ padding: "6px 14px", cursor: "pointer", color: "#EF4444", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>Delete</button>
          </div>
        </div>
      )}

      {/* Table Area */}
      <div className="glass-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--c-border-subtle)", textAlign: "left" }}>
              <th style={{ padding: "16px 20px", width: "40px" }}>
                <input type="checkbox" checked={selectedIds.size === lessons.length && lessons.length > 0} onChange={toggleSelectAll} style={{ width: "16px", height: "16px", accentColor: "#3B82F6", cursor: "pointer" }} />
              </th>
              <th style={{ padding: "16px", color: "var(--c-sub)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Lesson</th>
              <th style={{ padding: "16px", color: "var(--c-sub)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Course & Instructor</th>
              <th style={{ padding: "16px", color: "var(--c-sub)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Type</th>
              <th style={{ padding: "16px", color: "var(--c-sub)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Stats</th>
              <th style={{ padding: "16px", color: "var(--c-sub)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "16px", color: "var(--c-sub)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--c-border-subtle)" }}>
                  <td style={{ padding: "16px 20px" }}><Sk w="16px" h="16px" r="4px" /></td>
                  <td style={{ padding: "16px" }}><Sk w="200px" h="20px" /><Sk w="120px" h="14px" mt="6px" /></td>
                  <td style={{ padding: "16px" }}><Sk w="180px" h="16px" /><Sk w="100px" h="14px" mt="6px" /></td>
                  <td style={{ padding: "16px" }}><Sk w="70px" h="24px" r="99px" /></td>
                  <td style={{ padding: "16px" }}><Sk w="80px" h="16px" /><Sk w="50px" h="14px" mt="6px" /></td>
                  <td style={{ padding: "16px" }}><Sk w="80px" h="24px" r="99px" /></td>
                  <td style={{ padding: "16px", textAlign: "right" }}><Sk w="70px" h="30px" r="6px" style={{ display: "inline-block" }} /></td>
                </tr>
              ))
            ) : lessons.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: "var(--c-sub)" }}>
                  No lessons found.
                </td>
              </tr>
            ) : (
              lessons.map(lesson => (
                <tr key={lesson._id} style={{ borderBottom: "1px solid var(--c-border-subtle)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--c-bg-hover)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px 20px" }}>
                    <input type="checkbox" checked={selectedIds.has(lesson._id)} onChange={() => toggleSelect(lesson._id)} style={{ width: "16px", height: "16px", accentColor: "#3B82F6", cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "48px", height: "36px", borderRadius: "6px", background: "var(--c-bg-dark)", overflow: "hidden", flexShrink: 0 }}>
                        {lesson.thumbnailUrl ? (
                          <img src={lesson.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-sub)", fontSize: "0.7rem" }}>No img</div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-h)", fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
                          {lesson.title}
                        </div>
                        <div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginTop: "2px" }}>Updated: {formatDate(lesson.updatedAt)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 500, color: "var(--text-h)", fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px" }}>
                      {lesson.section?.course?.title || 'Unknown'}
                    </div>
                    <div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginTop: "2px" }}>
                      {lesson.section?.course?.instructor?.name || 'Unknown'}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Badge label={lesson.lessonType} color={getTypeBadgeColor(lesson.lessonType)} />
                  </td>
                  <td style={{ padding: "16px", color: "var(--text-h)", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span>{lesson.views || 0} views</span>
                      <span style={{ color: "var(--c-sub)", fontSize: "0.8rem" }}>{lesson.completionRate || 0}% compl.</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Badge label={lesson.status} color={getStatusColor(lesson.status)} />
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button 
                      onClick={() => setViewLesson(lesson)}
                      className="user-search-input" 
                      style={{ padding: "6px 12px", cursor: "pointer", fontSize: "0.85rem", background: "transparent" }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
          <span style={{ color: "var(--c-sub)", fontSize: "0.9rem" }}>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button 
              className="user-search-input" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: "8px 16px", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1, background: "transparent" }}
            >
              Previous
            </button>
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = page > 3 && totalPages > 5 ? page - 2 + i : i + 1;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    className="user-search-input"
                    onClick={() => setPage(p)}
                    style={{ 
                      padding: "8px 14px", cursor: "pointer",
                      background: page === p ? "#3B82F6" : "transparent",
                      color: page === p ? "#fff" : "var(--text-h)",
                      border: page === p ? "1px solid #3B82F6" : "1px solid var(--c-border)"
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button 
              className="user-search-input" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ padding: "8px 16px", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1, background: "transparent" }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <LessonDetailsDrawer lesson={viewLesson} onClose={() => setViewLesson(null)} onAction={handleAction} />
    </div>
  );
}
