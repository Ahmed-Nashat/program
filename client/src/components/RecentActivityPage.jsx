import { useState, useEffect } from "react";
import api from "../api/axios";


async function fetchActivity() {
  const response = await api.get('/admin/activity');
  return response.data;
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
const Sk = ({ h = 14, w = "100%", r = 6, mb = 0 }) => (
  <div className="skeleton-pulse" style={{ height: h, width: w, borderRadius: r, marginBottom: mb, flexShrink: 0 }} />
);

/* ─── Activity Item Component ────────────────────────────────────────────── */
const ActivityItem = ({ item }) => {
  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: "16px 20px", 
        display: "flex", 
        gap: "16px",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Subtle left border accent */}
      <div 
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          background: item.color,
          opacity: 0.8
        }}
      />
      
      {/* Icon */}
      <div 
        style={{ 
          width: "48px", 
          height: "48px", 
          borderRadius: "50%", 
          background: `${item.color}15`, 
          border: `1px solid ${item.color}30`,
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          fontSize: "1.4rem",
          flexShrink: 0
        }}
      >
        {item.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "4px" }}>
          <h4 style={{ margin: 0, fontSize: "1.05rem", color: "var(--c-light)", fontWeight: 600 }}>
            {item.title}
          </h4>
          <span style={{ fontSize: "0.8rem", color: "var(--c-sub)", whiteSpace: "nowrap" }}>
            {item.timestamp}
          </span>
        </div>
        <p style={{ margin: 0, color: "var(--c-sub)", fontSize: "0.9rem", lineHeight: 1.5 }}>
          {item.description}
        </p>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function RecentActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity().then((data) => {
      setActivities(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "800px" }}>
      
      {/* Header */}
      <div>
        <h2 style={{ margin: "0 0 4px", fontSize: "1.5rem" }}>Recent Activity</h2>
        <p style={{ margin: 0, color: "var(--c-sub)", fontSize: "0.9rem" }}>
          A chronological log of all major events across the platform.
        </p>
      </div>

      {/* Timeline Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card" style={{ padding: "16px 20px", display: "flex", gap: "16px" }}>
              <Sk h={48} w="48px" r="50%" />
              <div style={{ flex: 1, paddingTop: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <Sk h={16} w="30%" />
                  <Sk h={12} w="15%" />
                </div>
                <Sk h={14} w="80%" />
              </div>
            </div>
          ))
        ) : (
          activities.map((item) => <ActivityItem key={item.id} item={item} />)
        )}
        
        {!loading && activities.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--c-sub)" }}>
            No recent activity found.
          </div>
        )}
      </div>

      {/* Load More (Mock) */}
      {!loading && activities.length > 0 && (
        <button
          className="glass-card"
          style={{
            padding: "14px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--c-light)",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onClick={(e) => {
            e.currentTarget.style.transform = "scale(0.98)";
            setTimeout(() => e.currentTarget.style.transform = "none", 150);
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
        >
          Load More Activity
        </button>
      )}

    </div>
  );
}
