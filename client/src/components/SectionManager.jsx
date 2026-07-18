import React, { useState } from 'react';

export default function SectionManager({ courseId, initialSections = [] }) {
  const [sections, setSections] = useState(initialSections);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, color: "var(--text-h)" }}>Course Sections</h3>
        <button className="user-search-input" style={{ padding: "8px 16px", cursor: "pointer", background: "#3B82F6", color: "#fff", border: "none" }}>
          + Add Section
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {sections.length > 0 ? (
          sections.map(section => (
            <div key={section._id} className="glass-card" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ cursor: "grab", color: "var(--c-sub)" }}>
                  <i className="lucide-grip-vertical" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{section.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--c-sub)" }}>{section.content?.length || 0} items</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="user-search-input" style={{ padding: "6px 12px", background: "transparent", cursor: "pointer" }}>Edit</button>
                <button className="user-search-input" style={{ padding: "6px 12px", background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--c-sub)" }}>
            No sections created yet. Start by adding a new section.
          </div>
        )}
      </div>
    </div>
  );
}
