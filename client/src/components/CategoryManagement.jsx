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
    case "active": return "#10B981"; // Green
    case "hidden": return "#4B5563"; // Dark Gray
    case "archived": return "#8B5CF6"; // Purple
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

// Drawer for Creating / Editing Categories
const CategoryDrawer = ({ category, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "folder",
    displayOrder: 0,
    isFeatured: false,
    status: "active"
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        icon: category.icon || "folder",
        displayOrder: category.displayOrder || 0,
        isFeatured: category.isFeatured || false,
        status: category.status || "active"
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      notyf.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (category && category._id) {
        await api.patch(`/admin/categories/${category._id}`, formData);
        notyf.success("Category updated");
      } else {
        await api.post('/admin/categories', formData);
        notyf.success("Category created");
      }
      onSaved();
    } catch (err) {
      notyf.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

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
          width: "100%", maxWidth: "450px", height: "100%", background: "var(--c-bg)",
          borderLeft: "1px solid var(--c-border-subtle)", padding: "32px", overflowY: "auto",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.3)", animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex", flexDirection: "column"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "1.5rem", color: "var(--text-h)", margin: 0 }}>
            {category ? 'Edit Category' : 'Create Category'}
          </h2>
          <button onClick={onClose} className="glass-card" style={{ padding: "8px", border: "none", background: "rgba(255,255,255,0.05)", cursor: "pointer", color: "var(--c-sub)" }}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--c-sub)", fontWeight: 600 }}>Category Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name} 
              onChange={handleChange}
              className="user-search-input" 
              style={{ width: "100%" }}
              placeholder="e.g. Web Development"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--c-sub)", fontWeight: 600 }}>Description</label>
            <textarea 
              name="description"
              value={formData.description} 
              onChange={handleChange}
              className="user-search-input" 
              style={{ width: "100%", minHeight: "100px", resize: "vertical" }}
              placeholder="Brief description of this category"
            />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              <label style={{ fontSize: "0.85rem", color: "var(--c-sub)", fontWeight: 600 }}>Icon Name</label>
              <input 
                type="text" 
                name="icon"
                value={formData.icon} 
                onChange={handleChange}
                className="user-search-input" 
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              <label style={{ fontSize: "0.85rem", color: "var(--c-sub)", fontWeight: 600 }}>Display Order</label>
              <input 
                type="number" 
                name="displayOrder"
                value={formData.displayOrder} 
                onChange={handleChange}
                className="user-search-input" 
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--c-sub)", fontWeight: 600 }}>Status</label>
            <select 
              name="status"
              value={formData.status} 
              onChange={handleChange}
              className="user-search-input" 
              style={{ width: "100%" }}
            >
              <option value="active" style={{ background: "var(--c-bg)", color: "var(--text-h)" }}>Active</option>
              <option value="hidden" style={{ background: "var(--c-bg)", color: "var(--text-h)" }}>Hidden</option>
              <option value="archived" style={{ background: "var(--c-bg)", color: "var(--text-h)" }}>Archived</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
            <input 
              type="checkbox" 
              id="isFeatured" 
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              style={{ width: "18px", height: "18px", accentColor: "#3B82F6", cursor: "pointer" }}
            />
            <label htmlFor="isFeatured" style={{ color: "var(--text-h)", cursor: "pointer", userSelect: "none" }}>
              Featured Category (Shows on homepage)
            </label>
          </div>

          <div style={{ marginTop: "auto", paddingTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button 
              type="button"
              onClick={onClose} 
              className="user-search-input" 
              style={{ padding: "10px 20px", cursor: "pointer", background: "transparent" }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={saving}
              style={{ 
                padding: "10px 24px", cursor: saving ? "not-allowed" : "pointer", 
                background: "#3B82F6", color: "#fff", border: "none", borderRadius: "8px",
                fontWeight: 600, opacity: saving ? 0.7 : 1 
              }}
            >
              {saving ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  
  const [viewCategory, setViewCategory] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Debounced search
  const debounceRef = useRef();

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/categories/stats');
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch category stats");
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      let query = `?status=${statusTab}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      
      const res = await api.get(`/admin/categories${query}`);
      setCategories(res.data.categories);
    } catch (err) {
      notyf.error("Failed to fetch categories");
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
      fetchCategories();
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, statusTab]);

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    try {
      await api.post('/admin/categories/bulk', {
        categoryIds: Array.from(selectedIds),
        action
      });
      notyf.success(`Successfully updated ${selectedIds.size} categories`);
      setSelectedIds(new Set());
      fetchCategories();
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
    if (selectedIds.size === categories.length && categories.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(categories.map(c => c._id)));
    }
  };

  const openDrawer = (cat = null) => {
    setViewCategory(cat);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setViewCategory(null);
    setIsDrawerOpen(false);
  };

  const onSaved = () => {
    closeDrawer();
    fetchCategories();
    fetchStats();
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      
      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {[
          { label: "Total Categories", val: stats?.total || 0, color: "#3B82F6" },
          { label: "Active", val: stats?.active || 0, color: "#10B981" },
          { label: "Hidden", val: stats?.hidden || 0, color: "#6B7280" },
          { label: "Total Courses", val: stats?.totalCourses || 0, color: "#F59E0B" },
          { label: "Enrollments", val: stats?.totalEnrollments || 0, color: "#8B5CF6" },
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
            <input type="text" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="user-search-input" />
          </div>
        </div>
        
        <button 
          onClick={() => openDrawer()}
          style={{ padding: "10px 20px", background: "#3B82F6", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}
        >
          + Create Category
        </button>
      </div>

      {/* Status Tabs */}
      <div className="role-tabs" style={{ marginTop: "4px", marginBottom: "20px" }}>
        {[
          { id: "all", label: "All Categories" },
          { id: "active", label: "Active" },
          { id: "hidden", label: "Hidden" },
          { id: "archived", label: "Archived" }
        ].map(tab => (
          <button
            key={tab.id}
            className={`role-tab-button ${statusTab === tab.id ? "active" : ""}`}
            onClick={() => { setStatusTab(tab.id); }}
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
            <button className="user-search-input" onClick={() => handleBulkAction('active')} style={{ padding: "6px 14px", cursor: "pointer" }}>Set Active</button>
            <button className="user-search-input" onClick={() => handleBulkAction('hidden')} style={{ padding: "6px 14px", cursor: "pointer" }}>Hide</button>
            <button className="user-search-input" onClick={() => handleBulkAction('archived')} style={{ padding: "6px 14px", cursor: "pointer" }}>Archive</button>
            <button className="user-search-input" onClick={() => handleBulkAction('delete')} style={{ padding: "6px 14px", cursor: "pointer", color: "#EF4444", borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}>Delete</button>
          </div>
        </div>
      )}

      {/* Table Area */}
      <div className="glass-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--c-border-subtle)", textAlign: "left" }}>
              <th style={{ padding: "16px 20px", width: "40px" }}>
                <input type="checkbox" checked={selectedIds.size === categories.length && categories.length > 0} onChange={toggleSelectAll} style={{ width: "16px", height: "16px", accentColor: "#3B82F6", cursor: "pointer" }} />
              </th>
              <th style={{ padding: "16px", color: "var(--c-sub)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Category</th>
              <th style={{ padding: "16px", color: "var(--c-sub)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Stats</th>
              <th style={{ padding: "16px", color: "var(--c-sub)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Order</th>
              <th style={{ padding: "16px", color: "var(--c-sub)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "16px", color: "var(--c-sub)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--c-border-subtle)" }}>
                  <td style={{ padding: "16px 20px" }}><Sk w="16px" h="16px" r="4px" /></td>
                  <td style={{ padding: "16px" }}><Sk w="120px" h="20px" /><Sk w="180px" h="14px" mt="6px" /></td>
                  <td style={{ padding: "16px" }}><Sk w="80px" h="16px" /></td>
                  <td style={{ padding: "16px" }}><Sk w="40px" h="20px" /></td>
                  <td style={{ padding: "16px" }}><Sk w="80px" h="24px" r="99px" /></td>
                  <td style={{ padding: "16px", textAlign: "right" }}><Sk w="60px" h="30px" r="6px" style={{ display: "inline-block" }} /></td>
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "var(--c-sub)" }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map(cat => (
                <tr key={cat._id} style={{ borderBottom: "1px solid var(--c-border-subtle)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--c-bg-hover)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "16px 20px" }}>
                    <input type="checkbox" checked={selectedIds.has(cat._id)} onChange={() => toggleSelect(cat._id)} style={{ width: "16px", height: "16px", accentColor: "#3B82F6", cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(59,130,246,0.1)", color: "#3B82F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                        <i className={`lucide-${cat.icon || 'folder'}`} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-h)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }}>
                          {cat.name}
                          {cat.isFeatured && <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: "#F59E0B", color: "#fff", borderRadius: "4px", textTransform: "uppercase", fontWeight: 700 }}>Featured</span>}
                        </div>
                        <div style={{ color: "var(--c-sub)", fontSize: "0.8rem", marginTop: "2px" }}>{cat.description?.substring(0, 50)}{cat.description?.length > 50 ? '...' : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px", color: "var(--text-h)", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span>{cat.stats?.totalCourses || 0} Courses</span>
                      <span style={{ color: "var(--c-sub)", fontSize: "0.8rem" }}>{cat.stats?.totalEnrollments || 0} Enrollments</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px", color: "var(--text-h)", fontSize: "0.9rem" }}>
                    {cat.displayOrder}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Badge label={cat.status} color={getStatusColor(cat.status)} />
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button 
                      onClick={() => openDrawer(cat)}
                      className="user-search-input" 
                      style={{ padding: "6px 12px", cursor: "pointer", fontSize: "0.85rem", background: "transparent" }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isDrawerOpen && <CategoryDrawer category={viewCategory} onClose={closeDrawer} onSaved={onSaved} />}
    </div>
  );
}
