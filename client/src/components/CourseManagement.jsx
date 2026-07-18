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
    case "pending": return "#F59E0B"; // Amber
    case "archived": return "#8B5CF6"; // Purple
    case "hidden": return "#4B5563"; // Dark Gray
    case "rejected": return "#EF4444"; // Red
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

// Course Details Drawer
const CourseDetailsDrawer = ({ course, onClose, onAction }) => {
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

  if (!course) return null;

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
          ✕ Close
        </button>

        <div style={{ display: "flex", gap: "20px", marginBottom: "32px" }}>
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title} style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: "12px", border: "1px solid var(--c-border-subtle)" }} />
          ) : (
            <div style={{ width: "160px", height: "100px", borderRadius: "12px", background: "var(--c-input-bg)", border: "1px solid var(--c-border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-sub)", fontSize: "0.8rem" }}>No Image</div>
          )}
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.4rem", lineHeight: 1.2 }}>{course.title}</h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Badge label={course.status} color={getStatusColor(course.status)} />
              <Badge label={course.category} color="#3B82F6" />
              <Badge label={course.difficulty || "Beginner"} color="#8B5CF6" />
            </div>
          </div>
        </div>

        <h3 style={{ borderBottom: "1px solid var(--c-border-subtle)", paddingBottom: "8px", color: "var(--c-sub)", fontSize: "0.9rem", textTransform: "uppercase" }}>Quick Actions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0 32px" }}>
          <div style={{ position: "relative", width: "100%" }} ref={statusMenuRef}>
            <button
              className="user-search-input"
              style={{ padding: "10px 14px", width: "100%", cursor: "pointer", color: "var(--text-h)", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
            >
              <span style={{ textTransform: "capitalize" }}>Change Status: {course.status}</span>
              <span>▾</span>
            </button>
            {isStatusMenuOpen && (
              <div className="glass-card" style={{ position: "absolute", top: "100%", left: 0, width: "100%", marginTop: "6px", zIndex: 100, display: "flex", flexDirection: "column", padding: "6px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
                {['draft', 'published', 'pending', 'archived', 'hidden', 'rejected'].map(s => (
                  <button
                    key={s}
                    style={{ padding: "10px 14px", background: "transparent", border: "1px solid transparent", color: "var(--text-h)", textAlign: "left", cursor: "pointer", borderRadius: "6px", textTransform: "capitalize", transition: "all 0.2s" }}
                    onMouseEnter={e => { const c = getStatusColor(s); e.currentTarget.style.background = hexToRgba(c, 0.1); e.currentTarget.style.border = `1px solid ${hexToRgba(c, 0.3)}`; e.currentTarget.style.color = c; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.color = "var(--text-h)"; }}
                    onClick={() => { onAction('changeStatus', course._id, s); setIsStatusMenuOpen(false); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="user-search-input" style={{ padding: "10px 14px", cursor: "pointer", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }} onClick={() => { if(window.confirm('Delete this course?')) onAction('delete', course._id) }}>
            Soft Delete Course
          </button>
        </div>

        <h3 style={{ borderBottom: "1px solid var(--c-border-subtle)", paddingBottom: "8px", color: "var(--c-sub)", fontSize: "0.9rem", textTransform: "uppercase" }}>Course Details</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", margin: "16px 0 32px" }}>
          <div><div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Instructor</div><div style={{ fontWeight: 500 }}>{course.instructor?.name || "Unknown"}</div></div>
          <div><div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Price</div><div style={{ fontWeight: 500 }}>EGP {course.price || 0}</div></div>
          <div><div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Students Enrolled</div><div style={{ fontWeight: 500 }}>{course.studentsEnrolled || 0}</div></div>
          <div><div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Language</div><div style={{ fontWeight: 500, textTransform: "capitalize" }}>{course.language || "English"}</div></div>
          <div><div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Created Date</div><div style={{ fontWeight: 500 }}>{formatDate(course.createdAt)}</div></div>
          <div><div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginBottom: "4px" }}>Last Updated</div><div style={{ fontWeight: 500 }}>{formatDate(course.updatedAt)}</div></div>
        </div>

        <h3 style={{ borderBottom: "1px solid var(--c-border-subtle)", paddingBottom: "8px", color: "var(--c-sub)", fontSize: "0.9rem", textTransform: "uppercase" }}>Analytics Preview</h3>
        <div className="glass-card" style={{ padding: "32px", textAlign: "center", color: "var(--c-sub)", marginTop: "16px", fontSize: "0.9rem", border: "1px dashed var(--c-border-subtle)" }}>
          Interactive charts will appear here.<br/>(Enrollment trends, Revenue, Ratings)
        </div>
      </div>
    </div>
  );
};

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
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
  const [advancedFilters, setAdvancedFilters] = useState({ category: "" });

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setIsCategoryMenuOpen(false);
      }
    };
    if (isCategoryMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCategoryMenuOpen]);

  const [viewCourse, setViewCourse] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Debounced search
  const debounceRef = useRef();

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/courses/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch course stats");
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit, status: statusTab,
        category: advancedFilters.category
      });
      if (search.trim()) params.append('search', search.trim());
      
      const res = await api.get(`/admin/courses?${params.toString()}`);
      setCourses(res.data.courses);
      setTotalPages(res.data.totalPages);
      setTotalItems(res.data.totalItems);
    } catch (err) {
      notyf.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCourses(), 300);
    return () => clearTimeout(debounceRef.current);
  }, [page, limit, search, statusTab, advancedFilters]);

  // Actions
  const handleAction = async (action, id, value = null) => {
    try {
      if (action === 'changeStatus') {
        await api.patch(`/admin/courses/${id}/status`, { status: value });
      } else if (action === 'delete') {
        await api.delete(`/admin/courses/${id}`);
      }
      
      if (viewCourse && viewCourse._id === id && action === 'changeStatus') {
        setViewCourse(prev => ({ ...prev, status: value }));
      } else if (viewCourse && viewCourse._id === id && action === 'delete') {
        setViewCourse(null);
      }
      
      fetchCourses();
      fetchStats();
      notyf.success(`Action completed successfully`);
    } catch (err) {
      notyf.error(err.response?.data?.message || "Failed to perform action");
    }
  };

  const handleBulkAction = async (action) => {
    try {
      const courseIds = Array.from(selectedIds);
      await api.post(`/admin/courses/bulk`, { courseIds, action });
      setSelectedIds(new Set());
      fetchCourses();
      fetchStats();
      notyf.success(`Bulk action completed`);
    } catch (err) {
      notyf.error(err.response?.data?.message || "Failed to perform bulk action");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === courses.length && courses.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(courses.map(c => c._id)));
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        {[
          { label: "Total Courses", value: stats?.total, color: "#3B82F6" },
          { label: "Published", value: stats?.published, color: "#10B981" },
          { label: "Pending Review", value: stats?.pending, color: "#F59E0B" },
          { label: "Archived", value: stats?.archived, color: "#8B5CF6" },
          { label: "Drafts", value: stats?.draft, color: "#9CA3AF" },
        ].map((kpi, i) => (
          <div key={i} className="glass-card stat-card" style={{ padding: "20px" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--c-sub)", marginBottom: "8px", fontWeight: 600, textTransform: "uppercase" }}>{kpi.label}</div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: kpi.color }}>
              {stats ? kpi.value || 0 : <Sk h={32} w={40} />}
            </div>
          </div>
        ))}
      </div>

      {/* Header & Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginTop: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", margin: "0 0 4px" }}>Course Directory</h2>
          <p style={{ margin: 0, color: "var(--c-sub)", fontSize: "0.9rem" }}>Manage curriculum, reviews, and publication statuses.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="search-bar-glass" style={{ width: "320px" }}>
            <input type="text" placeholder="Search by course title..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="user-search-input" />
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
            <label style={{ fontSize: "0.8rem", color: "var(--c-sub)", fontWeight: 600, textTransform: "uppercase" }}>Category</label>
            <div style={{ position: "relative", width: "200px" }} ref={categoryMenuRef}>
              <button
                className="user-search-input"
                style={{ padding: "8px 12px", width: "100%", cursor: "pointer", color: "var(--text-h)", display: "flex", justifyContent: "space-between", alignItems: "center", textTransform: "capitalize" }}
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              >
                <span>{advancedFilters.category || "All Categories"}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--c-sub)" }}>▾</span>
              </button>
              {isCategoryMenuOpen && (
                <div className="glass-card" style={{ position: "absolute", top: "100%", left: 0, width: "100%", marginTop: "6px", zIndex: 100, display: "flex", flexDirection: "column", padding: "6px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
                  {[
                    { value: "", label: "All Categories" },
                    { value: "development", label: "Development" },
                    { value: "business", label: "Business" },
                    { value: "design", label: "Design" }
                  ].map(cat => (
                    <button
                      key={cat.value}
                      style={{ padding: "10px 14px", background: "transparent", border: "1px solid transparent", color: "var(--text-h)", textAlign: "left", cursor: "pointer", borderRadius: "6px", textTransform: "capitalize", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; e.currentTarget.style.border = "1px solid rgba(59,130,246,0.3)"; e.currentTarget.style.color = "#3B82F6"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.border = "1px solid transparent"; e.currentTarget.style.color = "var(--text-h)"; }}
                      onClick={() => { setAdvancedFilters(p => ({ ...p, category: cat.value })); setPage(1); setIsCategoryMenuOpen(false); }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="user-search-input" onClick={() => { setAdvancedFilters({ category: "" }); setSearch(""); setPage(1); }} style={{ padding: "9px 16px", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer" }}>
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="role-tabs" style={{ marginTop: "4px", marginBottom: "20px" }}>
        {[
          { id: "all", label: "All Courses" },
          { id: "published", label: "Published" },
          { id: "pending", label: "Pending Review" },
          { id: "draft", label: "Drafts" },
          { id: "archived", label: "Archived" },
        ].map(tab => (
          <button key={tab.id} onClick={() => { setStatusTab(tab.id); setPage(1); }} className={`role-tab-button ${statusTab === tab.id ? "active" : ""}`} data-role={tab.id === "all" ? "" : tab.id}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div style={{ background: "linear-gradient(90deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))", border: "1px solid rgba(59,130,246,0.2)", padding: "12px 24px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "fadeIn 0.2s" }}>
          <div style={{ color: "var(--text-h)", fontWeight: 600 }}>{selectedIds.size} courses selected</div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => handleBulkAction('published')} className="user-search-input" style={{ padding: "6px 14px", background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer", width: "auto" }}>Publish</button>
            <button onClick={() => handleBulkAction('archived')} className="user-search-input" style={{ padding: "6px 14px", background: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.3)", cursor: "pointer", width: "auto" }}>Archive</button>
            <button onClick={() => { if(window.confirm('Delete selected courses?')) handleBulkAction('delete') }} className="user-search-input" style={{ padding: "6px 14px", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer", width: "auto" }}>Delete</button>
          </div>
        </div>
      )}

      {/* Course Table */}
      <div className="glass-card table-container" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--c-border-subtle)", textAlign: "left", background: "rgba(255,255,255,0.02)" }}>
              <th style={{ padding: "16px", width: "40px", borderTopLeftRadius: "15px" }}><input type="checkbox" checked={courses.length > 0 && selectedIds.size === courses.length} onChange={toggleSelectAll} style={{ cursor: "pointer" }} /></th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--c-sub)" }}>Course</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--c-sub)" }}>Instructor</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--c-sub)" }}>Category</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--c-sub)" }}>Status</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--c-sub)" }}>Price</th>
              <th style={{ padding: "16px", fontWeight: "600", color: "var(--c-sub)", textAlign: "right", borderTopRightRadius: "15px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--c-border-subtle)" }}>
                  <td style={{ padding: "16px" }}><Sk w={16} h={16} /></td>
                  <td style={{ padding: "16px" }}><div style={{ display: "flex", gap: "12px", alignItems: "center" }}><Sk w={60} h={40} r={6} /><Sk w="120px" /></div></td>
                  <td style={{ padding: "16px" }}><Sk w={90} /></td>
                  <td style={{ padding: "16px" }}><Sk w={80} /></td>
                  <td style={{ padding: "16px" }}><Sk w={70} /></td>
                  <td style={{ padding: "16px" }}><Sk w={50} /></td>
                  <td style={{ padding: "16px", textAlign: "right" }}><Sk w={80} style={{ display: "inline-block" }} /></td>
                </tr>
              ))
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "48px 24px", textAlign: "center", color: "var(--c-sub)" }}>
                  No courses found matching your criteria.
                </td>
              </tr>
            ) : (
              courses.map(c => (
                <tr key={c._id} className="role-row hover-glow" style={{ borderTop: "1px solid var(--c-border-subtle)", cursor: "pointer" }} onClick={() => setViewCourse(c)}>
                  <td style={{ padding: "16px" }} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(c._id)} onChange={() => toggleSelect(c._id)} style={{ cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {c.thumbnailUrl ? (
                        <img src={c.thumbnailUrl} alt={c.title} style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "6px" }} />
                      ) : (
                        <div style={{ width: "60px", height: "40px", background: "var(--c-input-bg)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-sub)", fontSize: "0.7rem" }}>No Img</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{c.title.length > 30 ? c.title.substring(0, 30) + '...' : c.title}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px", color: "var(--c-light)" }}>{c.instructor?.name || "Unknown"}</td>
                  <td style={{ padding: "16px", color: "var(--c-sub)", textTransform: "capitalize" }}>{c.category}</td>
                  <td style={{ padding: "16px" }}><Badge label={c.status} color={getStatusColor(c.status)} /></td>
                  <td style={{ padding: "16px", fontWeight: 500, color: "#10B981" }}>{c.price > 0 ? `EGP ${c.price}` : "Free"}</td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button onClick={(e) => { e.stopPropagation(); setViewCourse(c); }} className="user-search-input" style={{ padding: "6px 12px", width: "auto", cursor: "pointer", fontSize: "0.8rem" }}>
                      Details
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
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="user-search-input" style={{ padding: "6px 12px", width: "auto", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="user-search-input" style={{ padding: "6px 12px", width: "auto", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}>Next</button>
            </div>
          </div>
        )}
      </div>

      <CourseDetailsDrawer course={viewCourse} onClose={() => setViewCourse(null)} onAction={handleAction} />
    </div>
  );
}
