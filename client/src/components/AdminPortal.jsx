import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import logoDark from "../assets/logo-dark.png";
import logoLight from "../assets/logo-light.png";
import OverviewDashboard from "./OverviewDashboard";
import StatisticsPage from "./StatisticsPage";
import AnalyticsPage from "./AnalyticsPage";
import RecentActivityPage from "./RecentActivityPage";
import UserManagement from "./UserManagement";
import CourseManagement from "./CourseManagement";
import LessonManagement from "./LessonManagement";
import CategoryManagement from "./CategoryManagement";
import SystemManagement from "./SystemManagement";
import WebsiteManagement from "./WebsiteManagement/WebsiteManagement";

const ROLE_OPTIONS = ["student", "instructor", "admin"];
const SIDEBAR_TAB_STEP = 44;

const isSidebarTabActive = (tabId, currentTab) => {
  if (tabId === "users") {
    return currentTab === "users" || currentTab.startsWith("users_");
  }
  return currentTab === tabId;
};

const resolveSidebarTabId = (tabId) =>
  tabId === "users" ? "users_students" : tabId;

// Renders its content into document.body and positions it with `fixed`
// coordinates measured from the trigger element. This is required because the
// dropdown's trigger lives inside table/card containers that use `overflow`
// for their own layout (scroll panes, rounded-corner clipping, etc.) — any
// CSS `overflow` other than `visible` on an ancestor clips absolutely
// positioned descendants regardless of z-index, so no z-index value can make
// an in-place dropdown escape that clipping. Rendering outside the DOM
// subtree via a portal is the only robust fix.
const RoleMenu = ({ anchorEl, onClose, children }) => {
  const menuRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!anchorEl) return;
    const updateCoords = () => {
      const rect = anchorEl.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    };
    updateCoords();
    // capture: true catches scroll events from any scrollable ancestor
    // (e.g. the dashboard's scrollable content pane), not just window scroll.
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [anchorEl]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        anchorEl &&
        !anchorEl.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [anchorEl, onClose]);

  if (!coords) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="glass-card animate-entrance"
      style={{
        position: "fixed",
        top: coords.top,
        right: coords.right,
        minWidth: "160px",
        padding: "6px",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      {children}
    </div>,
    document.body,
  );
};

// Generic placeholder for pages not yet implemented
const PlaceholderPage = ({ title }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
      padding: "80px 40px",
      textAlign: "center",
    }}
  >
    <div
      className="glass-card"
      style={{
        width: "100%",
        maxWidth: "480px",
        padding: "56px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      {/* Hourglass / construction icon */}
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--c-orange)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ opacity: 0.85 }}
      >
        <path d="M5 3h14" />
        <path d="M5 21h14" />
        <path d="M5 3l7 9-7 9" />
        <path d="M19 3l-7 9 7 9" />
      </svg>

      <h2
        style={{
          fontSize: "1.5rem",
          margin: 0,
          background: "linear-gradient(135deg, var(--c-orange), var(--c-yellow))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </h2>

      <p style={{ color: "var(--c-sub)", margin: 0, lineHeight: 1.6 }}>
        This section is currently under construction and will be available soon.
      </p>

      <div
        style={{
          marginTop: "8px",
          padding: "6px 18px",
          borderRadius: "99px",
          border: "1px solid rgba(249,115,22,0.35)",
          color: "var(--c-orange)",
          fontSize: "0.85rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Coming Soon
      </div>
    </div>
  </div>
);

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500;
    const endValue = parseInt(value, 10) || 0;
    const startValue = displayValue;

    if (startValue === endValue) return;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(
        Math.floor(startValue + (endValue - startValue) * easeProgress),
      );

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return <span>{displayValue}</span>;
};

export default function AdminPortal({
  user,
  onLogout,
  toggleTheme,
  isLightMode,
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard_overview");

  // Data States
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);

  // Loading & Processing States
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Reject-course-with-reason modal state
  const [pendingReject, setPendingReject] = useState(null); // { id, title } | null
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");

  // Sidebar Dropdown State
  const [expandedGroup, setExpandedGroup] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleGroup = (title) => {
    setExpandedGroup((prev) => (prev === title ? null : title));
  };

  const handleSidebarTabClick = (tabId, groupTitle) => {
    setActiveTab(resolveSidebarTabId(tabId));
    setExpandedGroup(groupTitle);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/courses/pending"),
      ]);
      setStats(statsRes.data);
      setPendingCourses(pendingRes.data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/transactions");
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin" && user.role !== "superadmin") {
      navigate("/");
      return;
    }

    if (activeTab.startsWith("dashboard") || activeTab.startsWith("courses")) {
      fetchDashboardData();
    } else if (activeTab === "enrollment") {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [user, navigate, activeTab]);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await api.patch(`/courses/${id}/approve`);
      fetchDashboardData();
    } catch (err) {
      console.error("Failed to approve course", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Opens the reason modal — rejection doesn't actually happen until confirmed.
  const requestReject = (course) => {
    setRejectReasonError("");
    setRejectReason("");
    setPendingReject({ id: course._id, title: course.title });
  };

  const cancelReject = () => {
    setPendingReject(null);
    setRejectReason("");
    setRejectReasonError("");
  };

  const confirmReject = async () => {
    if (!pendingReject) return;
    if (!rejectReason.trim()) {
      setRejectReasonError(
        "Let the instructor know why, so they can fix and resubmit.",
      );
      return;
    }
    setProcessingId(pendingReject.id);
    try {
      await api.patch(`/courses/${pendingReject.id}/reject`, {
        reason: rejectReason.trim(),
      });
      setPendingReject(null);
      setRejectReason("");
      fetchDashboardData();
    } catch (err) {
      setRejectReasonError(
        err.response?.data?.message || "Failed to reject course",
      );
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && !stats && !transactions.length) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading Admin Portal...
      </div>
    );
  }

  // Unified menu structure for both admin and superadmin
  const menuGroups = [
    {
      title: "Dashboard",
      items: [
        { id: "dashboard_overview", label: "Overview" },
        { id: "dashboard_stats", label: "Statistics" },
        { id: "dashboard_analytics", label: "Analytics" },
        { id: "dashboard_activity", label: "Recent Activity" },
      ],
    },
    {
      title: "User Management",
      items: [{ id: "users", label: "Users" }],
    },
    {
      title: "Course Management",
      items: [
        { id: "courses_all", label: "Courses" },
        { id: "courses_lessons", label: "Lessons" },
        { id: "courses_categories", label: "Categories" },
      ],
    },
    {
      title: "Enrollment Management",
      items: [{ id: "enrollment", label: "Enrollments" }],
    },
    {
      title: "Certificate Management",
      items: [{ id: "certificates", label: "Certificates" }],
    },
    {
      title: "Website Management",
      items: [
        { id: "web_home", label: "Homepage" },
        { id: "web_about", label: "About" },
        { id: "web_faq", label: "FAQ" },
        { id: "web_contact", label: "Contact" },
        { id: "web_testimonials", label: "Testimonials" },
      ],
    },
    {
      title: "Announcement Management",
      items: [{ id: "announcements", label: "Announcements" }],
    },
    {
      title: "Reports & Analytics",
      items: [{ id: "reports", label: "Reports & Analytics" }],
    },
    {
      title: "Role & Permission",
      items: [{ id: "roles", label: "Role & Permission Management" }],
    },
    {
      title: "System Management",
      items: [{ id: "settings", label: "System Management" }],
    },
    {
      title: "Profile",
      items: [
        { id: "profile_my", label: "My Profile" },
        { id: "profile_password", label: "Change Password" },
      ],
    },
  ];

  // Navigate to a tab and auto-expand its sidebar group.
  const navigateToTab = (tabId) => {
    setActiveTab(tabId);
    const group = menuGroups.find((g) => g.items.some((i) => i.id === tabId));
    if (group) setExpandedGroup(group.title);
  };

  const SIDEBAR_TAB_STEP = 46;

  return (
    <div
      data-role={user?.role}
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <nav
        className="top-nav"
        style={{
          position: "relative",
          borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
          zIndex: 10,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
          height: "70px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link to="/student" style={{ display: "flex", alignItems: "center" }}>
            <img
              src={isLightMode ? `${logoLight}?v=3` : `${logoDark}?v=3`}
              alt="Program Logo"
              style={{ height: "32px", width: "auto", objectFit: "contain" }}
            />
          </Link>
        </div>
        <div className="nav-logo">
          <h1 style={{ fontSize: "1.2rem", margin: "0" }}>
            {user?.role === "superadmin"
              ? "Super Admin Portal"
              : "Admin Portal"}
          </h1>
        </div>
        <div
          className="nav-controls"
          style={{ display: "flex", alignItems: "center" }}
        >
          <button
            className="nav-icon-btn"
            onClick={toggleTheme}
            style={{ marginRight: "16px" }}
          >
            {isLightMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="12" y1="2" x2="12" y2="4"></line>
                <line x1="12" y1="20" x2="12" y2="22"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="2" y1="12" x2="4" y2="12"></line>
                <line x1="20" y1="12" x2="22" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
          <div className="profile-wrapper">
            <div className="nav-avatar">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"></path>
              </svg>
            </div>
            <div className="profile-tooltip">
              <div className="tooltip-name">{user?.name}</div>
              <hr className="tooltip-divider" />
              <a href="#" className="tooltip-link">
                Profile
              </a>
              <a href="#" className="tooltip-link">
                Settings
              </a>
              <hr className="tooltip-divider" />
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onLogout();
                }}
                className="tooltip-link logout-link"
              >
                Log out
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside
          className={`glass-card admin-sidebar${sidebarCollapsed ? " collapsed" : ""}`}
        >
          {menuGroups.map((group, idx) => {
            const isGroupExpanded = expandedGroup === group.title;
            const activeIndex = group.items.findIndex((t) =>
              isSidebarTabActive(t.id, activeTab),
            );

            return (
              <div key={idx} className="admin-sidebar-group">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="admin-sidebar-group-title hover-glow"
                >
                  <span className="admin-sidebar-group-icon" aria-hidden="true">
                    {group.title.charAt(0)}
                  </span>
                  <span className="admin-sidebar-group-label">
                    {group.title}
                  </span>
                  <svg
                    className="admin-sidebar-chevron"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      transform: isGroupExpanded
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <div
                  className={`admin-sidebar-items${
                    isGroupExpanded ? " expanded-group" : " collapsed-group"
                  }`}
                >
                  <div className="admin-sidebar-items-inner">
                    {activeIndex >= 0 && (
                      <div
                        className="admin-sidebar-indicator"
                        style={{ top: `${activeIndex * SIDEBAR_TAB_STEP}px` }}
                      />
                    )}
                    {group.items.map((tab) => {
                      const isActive = isSidebarTabActive(tab.id, activeTab);

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() =>
                            handleSidebarTabClick(tab.id, group.title)
                          }
                          className={`admin-sidebar-tab ${
                            isActive ? " active" : ""
                          }`}
                          data-tooltip={tab.label}
                          title={sidebarCollapsed ? tab.label : undefined}
                        >
                          <span className="admin-sidebar-tab-short">
                            {tab.label.charAt(0)}
                          </span>
                          <span className="admin-sidebar-tab-label">
                            {tab.label}
                          </span>
                          {tab.id === "courses_all" &&
                            pendingCourses.length > 0 && (
                              <span
                                className="admin-sidebar-badge"
                                aria-label={`${pendingCourses.length} pending courses`}
                              >
                                {pendingCourses.length}
                              </span>
                            )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </aside>

        <div style={{ flex: 1, padding: "32px 48px", overflowY: "auto" }}>
          <div
            key={activeTab}
            className="admin-content-panel"
            style={{ maxWidth: "100%", margin: "40px auto" }}
          >
            {activeTab === "dashboard_overview" && (
              <OverviewDashboard
                stats={stats}
                loading={loading}
                user={user}
                pendingCourses={pendingCourses}
                onNavigate={navigateToTab}
              />
            )}

            {activeTab === "dashboard_stats" && <StatisticsPage />}
            
            {activeTab === "dashboard_analytics" && <AnalyticsPage />}
            
            {activeTab === "dashboard_activity" && <RecentActivityPage />}

            {activeTab.startsWith("users") && (
              <UserManagement currentUser={user} />
            )}

            {activeTab === "enrollment" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <h2 style={{ fontSize: "1.8rem", margin: 0 }}>
                  Financial Transactions
                </h2>
                <div className="glass-card" style={{ overflow: "hidden" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead style={{ background: "var(--c-border-subtle)" }}>
                      <tr>
                        <th
                          style={{
                            padding: "16px",
                            fontWeight: "600",
                            color: "var(--c-sub)",
                          }}
                        >
                          Date
                        </th>
                        <th
                          style={{
                            padding: "16px",
                            fontWeight: "600",
                            color: "var(--c-sub)",
                          }}
                        >
                          Student
                        </th>
                        <th
                          style={{
                            padding: "16px",
                            fontWeight: "600",
                            color: "var(--c-sub)",
                          }}
                        >
                          Course
                        </th>
                        <th
                          style={{
                            padding: "16px",
                            fontWeight: "600",
                            color: "var(--c-sub)",
                            textAlign: "right",
                          }}
                        >
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            style={{
                              padding: "24px",
                              textAlign: "center",
                              color: "var(--c-sub)",
                            }}
                          >
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        transactions.map((t) => (
                          <tr
                            key={t._id}
                            style={{
                              borderTop: "1px solid var(--c-border-subtle)",
                            }}
                          >
                            <td
                              style={{ padding: "16px", color: "var(--c-sub)" }}
                            >
                              {new Date(t.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: "16px" }}>
                              {t.student?.name || "Unknown User"}
                            </td>
                            <td style={{ padding: "16px" }}>
                              {t.course?.title || "Unknown Course"}
                            </td>
                            <td
                              style={{
                                padding: "16px",
                                textAlign: "right",
                                color: "#10B981",
                                fontWeight: "600",
                              }}
                            >
                              EGP {t.amountPaid}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "courses_all" && (
              <CourseManagement />
            )}

            {activeTab === "courses_lessons" && (
              <LessonManagement />
            )}

            {activeTab === "courses_categories" && (
              <CategoryManagement />
            )}

            {activeTab === "settings" && (
              <SystemManagement user={user} />
            )}

            {activeTab.startsWith("web_") && (
              <WebsiteManagement user={user} subTab={activeTab.replace("web_", "")} />
            )}

            {activeTab === "announcements" && (
              <WebsiteManagement user={user} subTab="announcements" />
            )}

            {[
              "certificates",
              "reports",
              "roles",
              "profile_my",
              "profile_password",
            ].includes(activeTab) && (
              <PlaceholderPage
                title={
                  menuGroups
                    .flatMap((g) => g.items)
                    .find((t) => t.id === activeTab)?.label ||
                  activeTab
                }
              />
            )}
          </div>
        </div>
      </div>


      {/* Reject course confirmation modal — requires a reason the instructor will see */}
      {pendingReject && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            className="glass-card animate-entrance"
            style={{ width: "100%", maxWidth: "480px", padding: "32px" }}
          >
            <h2 style={{ margin: "0 0 12px 0", fontSize: "1.3rem" }}>
              Reject course?
            </h2>
            <p style={{ color: "var(--c-sub)", margin: "0 0 16px 0" }}>
              Rejecting{" "}
              <strong style={{ color: "var(--c-light)" }}>
                {pendingReject.title}
              </strong>
              . This reason is shown to the instructor so they can fix and
              resubmit.
            </p>
            <div className="input-group">
              <label>Reason for rejection *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Description is too short, thumbnail is missing, pricing seems off..."
                style={{
                  minHeight: "100px",
                  width: "100%",
                  padding: "10px 14px",
                  background: "var(--c-input-bg)",
                  border: "var(--c-border)",
                  borderRadius: "12px",
                  color: "var(--text-h)",
                  fontFamily: "inherit",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>
            {rejectReasonError && (
              <div
                style={{
                  color: "#ef4444",
                  margin: "8px 0 0 0",
                  fontSize: "0.9rem",
                }}
              >
                {rejectReasonError}
              </div>
            )}
            <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={cancelReject}
                disabled={processingId === pendingReject.id}
                className="glass-btn hover-glow"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReject}
                disabled={processingId === pendingReject.id}
                className="glass-btn auth-submit-btn"
                style={{ flex: 1 }}
              >
                {processingId === pendingReject.id
                  ? "Rejecting..."
                  : "Reject Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
