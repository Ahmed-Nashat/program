import React, { useState } from 'react';

export default function CourseContentAccordion({ section }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card" style={{ marginBottom: "16px", overflow: "hidden" }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          color: "var(--text-h)"
        }}
        className="hover-glow"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{section.title}</span>
          {section.status !== 'published' && (
            <span style={{ fontSize: "0.7rem", padding: "2px 8px", background: "rgba(255,255,255,0.1)", borderRadius: "12px" }}>
              {section.status}
            </span>
          )}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isExpanded && (
        <div style={{ padding: "0 20px 20px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {section.content?.length > 0 ? (
            section.content.map(item => (
              <div key={item._id} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--c-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <i className={`lucide-${item.type === 'video' ? 'play-circle' : 'file-text'}`} style={{ color: "var(--c-sub)" }} />
                  <span style={{ fontSize: "0.95rem", color: "var(--text-body)" }}>{item.title}</span>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--c-sub)" }}>{item.duration || 0}m</span>
              </div>
            ))
          ) : (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--c-sub)", fontSize: "0.9rem" }}>
              No content in this section yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
