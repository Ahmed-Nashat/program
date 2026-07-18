import { useState, useEffect } from "react";

/* ─── AnimatedNumber ─────────────────────────────────────────────────────── */
export const AnimatedNumber = ({ value, decimals = 0 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const end = parseFloat(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    let raf;
    let start = null;
    const dur = 1400;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay(parseFloat((end * ease).toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setDisplay(end);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, decimals]);
  return <span>{decimals > 0 ? display.toFixed(decimals) : Math.floor(display).toLocaleString()}</span>;
};

/* ─── Currency formatter ─────────────────────────────────────────────────── */
export const fmtEGP = (v) =>
  v == null || isNaN(v)
    ? "—"
    : new Intl.NumberFormat("en-EG").format(Math.round(v));

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
const Sk = ({ h = 14, w = "100%", r = 6, mb = 0 }) => (
  <div className="skeleton-pulse" style={{ height: h, width: w, borderRadius: r, marginBottom: mb, flexShrink: 0 }} />
);

/* ─── Trend Arrow SVG ────────────────────────────────────────────────────── */
const TrendArrow = ({ positive }) => (
  <svg
    width="14" height="14" viewBox="0 0 14 14" fill="none"
    style={{ flexShrink: 0 }}
  >
    {positive ? (
      <path d="M7 2L12 8H2L7 2Z" fill="#10B981" />
    ) : (
      <path d="M7 12L2 6H12L7 12Z" fill="#EF4444" />
    )}
  </svg>
);

/* ─── Revenue Card (enhanced) ────────────────────────────────────────────── */
export default function RevenueCard({ stats, loading, onNavigate }) {
  const revenue     = stats?.totalRevenue;
  const companyShare = stats?.companyShare;
  const commission  = stats?.platformCommission;          // e.g. 15  (percent)
  const growth      = stats?.revenueGrowthPercent;        // e.g. 12.5

  // Derive company share locally only if backend didn't send it
  const derivedShare =
    companyShare != null
      ? companyShare
      : revenue != null && commission != null
      ? (revenue * commission) / 100
      : null;

  const growthPositive = growth == null || growth >= 0;

  if (loading) {
    return (
      <div className="glass-card stat-card revenue-card" style={{ cursor: "default" }}>
        <Sk h={13} w="45%" r={5} mb={10} />
        <Sk h={42} w="70%" r={10} mb={12} />
        <Sk h={10} w="38%" r={4} mb={16} />
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
          <Sk h={11} w="52%" r={4} mb={8} />
          <Sk h={20} w="58%" r={6} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card stat-card revenue-card"
      style={{ cursor: onNavigate ? "pointer" : "default", position: "relative" }}
      onClick={() => onNavigate?.("financial_revenue")}
      role={onNavigate ? "button" : undefined}
      tabIndex={onNavigate ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && onNavigate?.("financial_revenue")}
    >
      {/* Label */}
      <div className="stat-label">Total Revenue</div>

      {/* Primary Value */}
      <div
        className="stat-value"
        style={{ color: "#10B981", background: "none", WebkitTextFillColor: "initial", lineHeight: 1.1 }}
      >
        {revenue != null ? (
          <>EGP <AnimatedNumber value={revenue} /></>
        ) : (
          "—"
        )}
      </div>

      {/* Growth badge */}
      {growth != null ? (
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
            marginTop: "2px",
            width: "fit-content",
          }}
        >
          <TrendArrow positive={growthPositive} />
          {growthPositive ? "+" : ""}{growth}% this month
        </div>
      ) : (
        <div style={{ fontSize: "0.78rem", color: "var(--c-sub)", marginTop: "2px" }}>
          Growth data unavailable
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "14px 0 0" }} />

      {/* Company Share secondary metric */}
      <div style={{ paddingTop: "12px" }}>
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--c-sub)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "5px",
          }}
        >
          Company Share{commission != null ? ` (${commission}%)` : ""}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#10B981",
            }}
          >
            {derivedShare != null ? (
              <>EGP <AnimatedNumber value={derivedShare} /></>
            ) : (
              "—"
            )}
          </span>
        </div>
      </div>

      {/* Last updated */}
      {stats && (
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--c-sub)",
            marginTop: "10px",
            opacity: 0.75,
          }}
        >
          Updated just now
        </div>
      )}

      {/* Click hint */}
      {onNavigate && (
        <div
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            color: "rgba(16,185,129,0.45)",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          →
        </div>
      )}
    </div>
  );
}
