import { useState, useEffect } from "react";
import api from "../api/axios";

import { AnimatedNumber, fmtEGP } from "./RevenueCard";

/* ─── Mock financial data — swap body of fetchFinancial() for real API ──── */

async function fetchFinancial() {
  return (await api.get('/admin/financial')).data;
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
const Sk = ({ h = 14, w = "100%", r = 6, mb = 0 }) => (
  <div className="skeleton-pulse" style={{ height: h, width: w, borderRadius: r, marginBottom: mb, flexShrink: 0 }} />
);

/* ─── KPI Card ───────────────────────────────────────────────────────────── */
const KpiCard = ({ label, value, prefix = "", suffix = "", accent, icon, loading }) => {
  if (loading) {
    return (
      <div className="glass-card stat-card">
        <Sk h={13} w="55%" r={5} mb={12} />
        <Sk h={40} w="70%" r={10} />
      </div>
    );
  }
  return (
    <div className="glass-card stat-card" style={{ position: "relative", overflow: "hidden" }}>
      {/* Subtle accent blob */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: accent ? `${accent}18` : "transparent",
          pointerEvents: "none",
        }}
      />
      <div className="stat-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {icon && <span style={{ fontSize: "1rem" }}>{icon}</span>}
        {label}
      </div>
      <div
        className="stat-value"
        style={{
          color: accent || "#F9FAFB",
          background: "none",
          WebkitTextFillColor: "initial",
          fontSize: "1.9rem",
        }}
      >
        {value == null ? "—" : (
          <>
            {prefix}
            <AnimatedNumber value={value} />
            {suffix}
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Section Header ─────────────────────────────────────────────────────── */
const SectionHeader = ({ title, sub }) => (
  <div style={{ marginBottom: "4px" }}>
    <h2 style={{ margin: "0 0 4px", fontSize: "1.5rem" }}>{title}</h2>
    {sub && <p style={{ margin: 0, color: "var(--c-sub)", fontSize: "0.9rem" }}>{sub}</p>}
  </div>
);

/* ─── StatisticsPage ─────────────────────────────────────────────────────── */
export default function StatisticsPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchFinancial()
      .then((d) => { setData(d); setError(null); })
      .catch(() => setError("Failed to load financial data."))
      .finally(() => setLoading(false));
  }, []);

  const avgRevenuePerEnrollment =
    data?.totalRevenue && data?.totalEnrollments
      ? data.totalRevenue / data.totalEnrollments
      : null;

  const commission = data?.platformCommission;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <SectionHeader
        title="Statistics"
        sub="Financial summary of platform performance."
      />

      {error && (
        <div
          className="glass-card"
          style={{
            padding: "20px 24px",
            borderColor: "rgba(239,68,68,0.3)",
            color: "#EF4444",
            fontSize: "0.9rem",
          }}
        >
          {error}
        </div>
      )}

      {/* ── Financial Summary ── */}
      <section>
        <h3
          style={{
            margin: "0 0 16px",
            fontSize: "1.05rem",
            color: "var(--c-sub)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: 700,
          }}
        >
          Financial Summary
        </h3>

        <div className="stats-grid">
          <KpiCard
            label="Total Revenue"
            prefix="EGP "
            value={data?.totalRevenue}
            accent="#10B981"
            icon="💰"
            loading={loading}
          />
          <KpiCard
            label={`Company Share${commission != null ? ` (${commission}%)` : ""}`}
            prefix="EGP "
            value={data?.companyShare}
            accent="#8B5CF6"
            icon="🏢"
            loading={loading}
          />
          <KpiCard
            label="Instructor Earnings"
            prefix="EGP "
            value={data?.instructorEarnings}
            accent="#F97316"
            icon="👨‍🏫"
            loading={loading}
          />
          <KpiCard
            label="Outstanding Payouts"
            prefix="EGP "
            value={data?.outstandingPayouts}
            accent="#EF4444"
            icon="⏳"
            loading={loading}
          />
          <KpiCard
            label="Avg Revenue / Enrollment"
            prefix="EGP "
            value={avgRevenuePerEnrollment != null ? Math.round(avgRevenuePerEnrollment) : null}
            accent="#FACC15"
            icon="📊"
            loading={loading}
          />
        </div>
      </section>

      {/* ── Commission info card ── */}
      {!loading && data && (
        <div
          className="glass-card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Revenue Distribution</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Company bar */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                  fontSize: "0.88rem",
                }}
              >
                <span style={{ fontWeight: 600 }}>Company Share</span>
                <span style={{ color: "#8B5CF6", fontWeight: 700 }}>
                  EGP {fmtEGP(data.companyShare)}{" "}
                  <span style={{ color: "var(--c-sub)", fontWeight: 400 }}>
                    ({commission}%)
                  </span>
                </span>
              </div>
              <div className="category-bar-outer">
                <div
                  className="category-bar-fill"
                  style={{ width: `${commission}%`, background: "linear-gradient(90deg,#8B5CF6,#6D28D9)" }}
                />
              </div>
            </div>

            {/* Instructor bar */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                  fontSize: "0.88rem",
                }}
              >
                <span style={{ fontWeight: 600 }}>Instructor Earnings</span>
                <span style={{ color: "#F97316", fontWeight: 700 }}>
                  EGP {fmtEGP(data.instructorEarnings)}{" "}
                  <span style={{ color: "var(--c-sub)", fontWeight: 400 }}>
                    ({100 - commission}%)
                  </span>
                </span>
              </div>
              <div className="category-bar-outer">
                <div
                  className="category-bar-fill"
                  style={{
                    width: `${100 - commission}%`,
                    background: "linear-gradient(90deg,#F97316,#EA580C)",
                  }}
                />
              </div>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--c-sub)" }}>
            Platform commission is currently configured at{" "}
            <strong style={{ color: "var(--c-light)" }}>{commission}%</strong>. This rate is
            managed by the backend and reflected here automatically.
          </p>
        </div>
      )}
    </div>
  );
}
