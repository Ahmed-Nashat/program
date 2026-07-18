import { useState, useEffect } from "react";
import RevenueCard, { AnimatedNumber, fmtEGP } from "./RevenueCard";


/* ─── Helpers ────────────────────────────────────────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const BAR_COLORS = [
  "#f97316", "#8b5cf6", "#3b82f6", "#ec4899",
  "#10b981", "#facc15", "#06b6d4", "#ef4444",
];

/* ─── Skeleton Block ─────────────────────────────────────────────────────── */
const Sk = ({ h = 14, w = "100%", r = 6, mb = 0 }) => (
  <div
    className="skeleton-pulse"
    style={{ height: h, width: w, borderRadius: r, marginBottom: mb, flexShrink: 0 }}
  />
);

const SkeletonCard = ({ style }) => (
  <div className="glass-card stat-card" style={style}>
    <Sk h={13} w="52%" r={5} mb={12} />
    <Sk h={42} w="70%" r={10} mb={8} />
  </div>
);

/* ─── Trend Arrow SVG ────────────────────────────────────────────────────── */
const TrendArrow = ({ positive }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
    {positive ? (
      <path d="M7 2L12 8H2L7 2Z" fill="currentColor" />
    ) : (
      <path d="M7 12L2 6H12L7 12Z" fill="currentColor" />
    )}
  </svg>
);

/* ─── StatCard ───────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, roleColor, isRevenue, growth }) => {
  const growthPositive = growth == null || growth >= 0;
  return (
    <div
      className={`glass-card stat-card${isRevenue ? " revenue-card" : ""}`}
      data-role={roleColor || undefined}
    >
      <div className="stat-label">{label}</div>
      <div
        className={isRevenue ? "stat-value" : "stat-value role-text"}
        style={
          isRevenue
            ? { color: "#10B981", background: "none", WebkitTextFillColor: "initial" }
            : {}
        }
      >
        {isRevenue
          ? value != null ? `EGP ${fmtEGP(value)}` : "—"
          : value != null ? <AnimatedNumber value={value} /> : "—"}
      </div>
      
      {growth != null && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "3px 10px",
            borderRadius: "99px",
            background: growthPositive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            border: `1px solid ${growthPositive ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            fontSize: "0.8rem",
            fontWeight: 700,
            color: growthPositive ? "#10B981" : "#EF4444",
            marginTop: "12px",
            width: "fit-content",
          }}
        >
          <TrendArrow positive={growthPositive} />
          {growthPositive ? "+" : ""}{growth}% this month
        </div>
      )}
    </div>
  );
};


/* ─── EnrollmentChart ────────────────────────────────────────────────────── */
const EnrollmentChart = ({ categoryCounts, loading, error }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 80);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: "24px" }}>
        <Sk h={20} w="42%" r={6} mb={22} />
        {[78, 60, 45, 28].map((w, i) => (
          <div key={i} style={{ marginBottom: 18 }}>
            <Sk h={12} w="36%" r={4} mb={8} />
            <Sk h={8} w={`${w}%`} r={99} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card" style={{ padding: "24px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>Enrollments by Category</h3>
        <p style={{ color: "var(--c-red)", fontSize: "0.9rem", margin: 0 }}>
          Failed to load enrollment data.
        </p>
      </div>
    );
  }

  const entries = Object.entries(categoryCounts || {});
  const total = entries.reduce((s, [, c]) => s + c, 0);

  return (
    <div className="glass-card" style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Enrollments by Category</h3>
        {total > 0 && (
          <span style={{ fontSize: "0.85rem", color: "var(--c-sub)", fontWeight: 600 }}>
            {total.toLocaleString()} total
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <svg
            width="44" height="44" fill="none" viewBox="0 0 24 24"
            stroke="var(--c-sub)" strokeWidth="1.5"
            style={{ display: "block", margin: "0 auto 12px" }}
          >
            <path
              strokeLinecap="round" strokeLinejoin="round"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p style={{ color: "var(--c-sub)", margin: 0, fontSize: "0.9rem" }}>
            No enrollments yet.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {entries
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count], i) => {
              const pct = total > 0 ? (count / total) * 100 : 0;
              const color = BAR_COLORS[i % BAR_COLORS.length];
              return (
                <div key={cat} className="category-bar-row">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "7px",
                      alignItems: "baseline",
                    }}
                  >
                    <span style={{ fontWeight: 500, fontSize: "0.9rem" }}>{cat}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.85rem", color }}>
                      {count.toLocaleString()}{" "}
                      <span style={{ color: "var(--c-sub)", fontWeight: 400 }}>
                        ({pct.toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                  <div className="category-bar-outer">
                    <div
                      className="category-bar-fill"
                      style={{
                        width: mounted ? `${Math.max(pct, 2)}%` : "0%",
                        background: `linear-gradient(90deg, ${color}, ${color}99)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

/* ─── PendingActionsCard ─────────────────────────────────────────────────── */
const PendingActionsCard = ({ pendingCourses }) => {
  const items = [
    {
      label: "Pending Course Approvals",
      count: pendingCourses?.length ?? 0,
      icon: (
        <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path
            strokeLinecap="round" strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
  ];

  const allClear = items.every((i) => i.count === 0);

  return (
    <div className="glass-card" style={{ padding: "24px" }}>
      <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>Pending Actions</h3>

      {allClear ? (
        <div
          style={{
            textAlign: "center",
            padding: "24px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem",
            }}
          >
            ✅
          </div>
          <p style={{ color: "#10B981", fontWeight: 700, margin: 0 }}>
            Everything is up to date.
          </p>
          <p style={{ color: "var(--c-sub)", fontSize: "0.84rem", margin: 0 }}>
            No actions require attention.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {items
            .filter((i) => i.count > 0)
            .map((item) => (
              <div key={item.label} className="pending-item">
                <span className="pending-item-icon" style={{ color: "var(--c-orange)" }}>
                  {item.icon}
                </span>
                <span className="pending-item-label">{item.label}</span>
                <span className="pending-item-count">{item.count}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

/* ─── QuickActionsStrip ──────────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  { label: "Create Course",    emoji: "✏️",  tab: "courses_all" },
  { label: "Create Category",  emoji: "🗂️", tab: "courses_categories" },
  { label: "Announcement",     emoji: "📢",  tab: "announcements" },
  { label: "Manage Users",     emoji: "👥",  tab: "users_students" },
  { label: "Manage Website",   emoji: "🌐",  tab: "web_home" },
];

const QuickActionsStrip = ({ onNavigate }) => (
  <div className="glass-card" style={{ padding: "20px 24px" }}>
    <h3 style={{ margin: "0 0 14px", fontSize: "1.05rem" }}>Quick Actions</h3>
    <div className="quick-actions-strip">
      {QUICK_ACTIONS.map(({ label, emoji, tab }) => (
        <button
          key={tab}
          type="button"
          className="quick-action-btn"
          onClick={() => onNavigate(tab)}
        >
          <span role="img" aria-hidden="true" style={{ fontSize: "1rem" }}>{emoji}</span>
          <span className="quick-action-label">{label}</span>
        </button>
      ))}
    </div>
  </div>
);

/* ─── PlatformHealthCard ─────────────────────────────────────────────────── */
const PlatformHealthCard = () => (
  <div className="glass-card" style={{ padding: "24px" }}>
    <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem" }}>Platform Health</h3>
    <div
      style={{
        textAlign: "center",
        padding: "24px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <svg
        width="40" height="40" fill="none" viewBox="0 0 24 24"
        stroke="var(--c-sub)" strokeWidth="1.5"
      >
        <path
          strokeLinecap="round" strokeLinejoin="round"
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>
      <p style={{ color: "var(--c-sub)", margin: 0, fontSize: "0.9rem" }}>
        Health monitoring endpoint not yet connected.
      </p>
      <span
        style={{
          padding: "4px 14px",
          borderRadius: "99px",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "var(--c-sub)",
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Pending Integration
      </span>
    </div>
  </div>
);

/* ─── RecentActivityCard ─────────────────────────────────────────────────── */
const RecentActivityCard = ({ onNavigate }) => (
  <div className="glass-card" style={{ padding: "24px" }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
      }}
    >
      <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Recent Activity</h3>
      <button
        type="button"
        onClick={() => onNavigate("dashboard_activity")}
        style={{
          background: "none",
          border: "none",
          color: "var(--c-orange)",
          fontWeight: 600,
          fontSize: "0.85rem",
          cursor: "pointer",
          padding: 0,
          fontFamily: "inherit",
        }}
      >
        View All →
      </button>
    </div>
    <div
      style={{
        textAlign: "center",
        padding: "24px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <svg
        width="40" height="40" fill="none" viewBox="0 0 24 24"
        stroke="var(--c-sub)" strokeWidth="1.5"
      >
        <path
          strokeLinecap="round" strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p style={{ color: "var(--c-sub)", margin: 0, fontSize: "0.9rem" }}>
        No recent activity to display.
      </p>
      <span
        style={{
          padding: "4px 14px",
          borderRadius: "99px",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "var(--c-sub)",
          fontSize: "0.75rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Pending Integration
      </span>
    </div>
  </div>
);

/* ─── Main Export ─────────────────────────────────────────────────────────── */
export default function OverviewDashboard({
  stats,
  loading,
  user,
  pendingCourses,
  onNavigate,
}) {
  const [lastRefreshed, setLastRefreshed] = useState(null);

  useEffect(() => {
    if (!loading && stats) setLastRefreshed(new Date());
  }, [loading, stats]);

  const refreshedStr = lastRefreshed
    ? lastRefreshed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Header ── */}
      <div className="overview-header">
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.8rem" }}>
            {getGreeting()}, {user?.name?.split(" ")[0] || "Admin"} 👋
          </h2>
          <p style={{ margin: 0, color: "var(--c-sub)", fontSize: "0.9rem" }}>
            Here's what's happening on your platform today.
          </p>
        </div>
        {refreshedStr && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: "0.78rem", color: "var(--c-sub)", marginBottom: "2px" }}>
              Last refreshed
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--c-light)" }}>
              {refreshedStr}
            </div>
          </div>
        )}
      </div>

      {/* ── Row 1: Revenue · Students · Instructors ── */}
      <div className="overview-row first-row">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <RevenueCard stats={stats} loading={loading} onNavigate={onNavigate} />
            <StatCard label="Students"     value={stats?.totalStudents}    growth={stats?.growth?.students}    roleColor="student" />
            <StatCard label="Instructors"  value={stats?.totalInstructors} growth={stats?.growth?.instructors} roleColor="instructor" />
          </>
        )}

      </div>

      {/* ── Row 2: Super Admins · Admins ── */}
      <div className="overview-row second-row">
        {loading ? (
          <>
            {user?.role === "superadmin" && <SkeletonCard style={{ flex: 1 }} />}
            <SkeletonCard style={{ flex: 1 }} />
          </>
        ) : (
          <>
            {user?.role === "superadmin" && (
              <StatCard label="Super Admins" value={stats?.totalSuperAdmins} growth={stats?.growth?.superAdmins} roleColor="superadmin" />
            )}
            <StatCard label="Admins" value={stats?.totalAdmins} growth={stats?.growth?.admins} roleColor="admin" />
          </>
        )}
      </div>

      {/* ── Bottom Grid: Enrollment chart (2/3) + Pending Actions (1/3) ── */}
      <div className="overview-bottom-grid">
        <EnrollmentChart
          categoryCounts={stats?.categoryCounts}
          loading={loading}
          error={!loading && !stats}
        />
        <PendingActionsCard pendingCourses={pendingCourses} />
      </div>

      {/* ── Quick Actions ── */}
      <QuickActionsStrip onNavigate={onNavigate} />

      {/* ── Footer Row: Platform Health (1/2) + Recent Activity (1/2) ── */}
      <div className="overview-footer-row">
        <PlatformHealthCard />
        <RecentActivityCard onNavigate={onNavigate} />
      </div>

    </div>
  );
}
