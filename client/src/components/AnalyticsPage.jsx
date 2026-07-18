import { useState, useEffect } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Bar
} from "recharts";
import api from "../api/axios";
import { fmtEGP } from "./RevenueCard";


async function fetchAnalytics(range) {
  const response = await api.get(`/admin/financial/analytics?timeframe=${range}`);
  return response.data;
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const RANGE_OPTIONS = [
  { label: "Last 7 Days",   value: "7d"  },
  { label: "Last 30 Days",  value: "30d" },
  { label: "Last 6 Months", value: "6m"  },
  { label: "Last Year",     value: "1y"  },
];

const SkChart = ({ h = 220 }) => (
  <div className="skeleton-pulse" style={{ height: h, borderRadius: 12, width: "100%" }} />
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(15,17,23,0.95)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "10px",
          padding: "10px 14px",
          fontSize: "0.82rem",
          minWidth: "160px",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: "6px", color: "var(--c-light)" }}>
          {label}
        </div>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
            <span style={{ color: "var(--c-sub)" }}>{entry.name}: </span>
            <span style={{ color: entry.color, fontWeight: 700 }}>
              {entry.name.includes("Growth") 
                ? `${entry.value > 0 ? "+" : ""}${entry.value}%`
                : `EGP ${fmtEGP(entry.value)}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

/* ═══════════════════════════════════════════════════════════════
   CHART COMPONENTS (Recharts)
   ═══════════════════════════════════════════════════════════════ */

function LineChartComponent({ data, loading }) {
  if (loading) return <SkChart h={260} />;
  
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorShare" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--c-sub)", fontSize: 11 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--c-sub)", fontSize: 11 }}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1, strokeDasharray: "4 3" }} />
          
          <Area 
            type="monotone" 
            dataKey="totalRevenue" 
            name="Revenue" 
            stroke="#10B981" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            activeDot={{ r: 6, fill: "#10B981", stroke: "#0f1117", strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="companyShare" 
            name="Company Share" 
            stroke="#8B5CF6" 
            strokeWidth={2.5}
            strokeDasharray="6 3"
            fillOpacity={1} 
            fill="url(#colorShare)" 
            activeDot={{ r: 6, fill: "#8B5CF6", stroke: "#0f1117", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DonutChartComponent({ distribution, commission, loading }) {
  if (loading) return <SkChart h={220} />;

  const { companyShare, instructorEarnings } = distribution;
  const data = [
    { name: "Company Share", value: companyShare, color: "#8B5CF6" },
    { name: "Instructor Earnings", value: instructorEarnings, color: "#F97316" },
  ];
  
  const total = companyShare + instructorEarnings;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap", justifyContent: "center" }}>
      <div style={{ width: 220, height: 220, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              stroke="none"
              paddingAngle={2}
              dataKey="value"
              animationBegin={100}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--c-light)" }}>{commission}%</span>
          <span style={{ fontSize: "0.75rem", color: "var(--c-sub)" }}>company</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {data.map((item) => (
          <div key={item.name}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span style={{ width: 12, height: 12, borderRadius: "3px", background: item.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.name}</span>
            </div>
            <div style={{ paddingLeft: "22px" }}>
              <div style={{ fontWeight: 800, fontSize: "1.15rem", color: item.color }}>
                EGP {fmtEGP(item.value)}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--c-sub)" }}>
                {((item.value / total) * 100).toFixed(1)}% of total revenue
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GrowthChartComponent({ data, loading }) {
  if (loading) return <SkChart h={260} />;
  
  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--c-sub)", fontSize: 11 }} 
            dy={10} 
          />
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--c-sub)", fontSize: 11 }}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "var(--c-sub)", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          
          <Bar 
            yAxisId="left"
            dataKey="revenue" 
            name="Revenue" 
            fill="#10B981" 
            opacity={0.3}
            radius={[4, 4, 4, 4]} 
          />
          <RechartsLineChart />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="growthPct"
            name="Growth"
            stroke="#FACC15"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#FACC15", stroke: "#0f1117", strokeWidth: 1.5 }}
            activeDot={{ r: 6, fill: "#FACC15", stroke: "#0f1117", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   CHART CARD WRAPPER
   ═══════════════════════════════════════════════════════════════ */
const ChartCard = ({ title, sub, children, legend }) => (
  <div className="glass-card" style={{ padding: "24px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
      <div>
        <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem" }}>{title}</h3>
        {sub && <p style={{ margin: 0, color: "var(--c-sub)", fontSize: "0.84rem" }}>{sub}</p>}
      </div>
      {legend && (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {legend.map(({ color, dash, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}>
              <svg width="24" height="12">
                <line
                  x1="0" y1="6" x2="24" y2="6"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeDasharray={dash || "none"}
                />
              </svg>
              <span style={{ color: "var(--c-sub)" }}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPORT — AnalyticsPage
   ═══════════════════════════════════════════════════════════════ */
export default function AnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [range,   setRange]   = useState("1y");

  useEffect(() => {
    setLoading(true);
    fetchAnalytics(range)
      .then((d) => { setData(d); setError(null); })
      .catch(() => setError("Failed to load analytics data."))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "1.5rem" }}>Analytics</h2>
          <p style={{ margin: 0, color: "var(--c-sub)", fontSize: "0.9rem" }}>
            Financial performance over time.
          </p>
        </div>
        
        {/* Responsive Filter Buttons */}
        <div 
          className="role-tabs" 
          style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "8px",
            width: "100%",
            maxWidth: "400px" // ensures it wraps nicely on mobile
          }}
        >
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setRange(o.value)}
              className={`role-tab-button${range === o.value ? " active" : ""}`}
              style={{ 
                fontSize: "0.82rem", 
                padding: "6px 14px",
                flex: "1 1 auto",
                textAlign: "center"
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="glass-card"
          style={{ padding: "20px 24px", borderColor: "rgba(239,68,68,0.3)", color: "#EF4444", fontSize: "0.9rem" }}
        >
          {error}
        </div>
      )}

      {/* ── 1. Monthly Revenue vs Company Share ── */}
      <ChartCard
        title="Monthly Revenue vs Company Share"
        sub="Comparing total platform revenue with company earnings month over month."
        legend={[
          { color: "#10B981", label: "Total Revenue" },
          { color: "#8B5CF6", dash: "6 3", label: "Company Share" },
        ]}
      >
        <LineChartComponent data={data?.monthlyRevenue} loading={loading} />
      </ChartCard>

      {/* ── 2. Revenue Distribution (Donut) ── */}
      <ChartCard
        title="Revenue Distribution"
        sub={`How revenue is split between the company (${data?.platformCommission ?? "—"}%) and instructors.`}
      >
        <DonutChartComponent
          distribution={data?.revenueDistribution}
          commission={data?.platformCommission}
          loading={loading}
        />
      </ChartCard>

      {/* ── 3. Financial Growth ── */}
      <ChartCard
        title="Financial Growth"
        sub="Monthly revenue (bars) and month-over-month growth percentage (line)."
        legend={[
          { color: "#10B981", label: "Monthly Revenue" },
          { color: "#FACC15", label: "Growth %" },
        ]}
      >
        <GrowthChartComponent data={data?.monthlyGrowth} loading={loading} />
      </ChartCard>

    </div>
  );
}
