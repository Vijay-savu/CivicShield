import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigationItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "My Documents", to: "/documents" },
  { label: "Apply for Schemes", to: "/apply" },
  { label: "My Applications", to: "/my-applications" },
  { label: "Security Alerts", to: "/security-alerts" },
  { label: "Profile", to: "/profile" },
];

const getDisplayName = (user) => {
  if (user?.email === "citizen@civicshield.local") {
    return "Vijay";
  }

  return user?.name?.replace(/\bcitizen\b/gi, "").trim() || user?.email || "Vijay";
};

function AppShell({ title, subtitle, children, actions }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-base font-bold text-[#1E3A8A]">
                CS
              </Link>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">CivicShield</div>
                <div className="truncate text-xs text-slate-500">{getDisplayName(user)}</div>
              </div>
            </div>

            <nav className="flex flex-wrap gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-blue-50 text-[#1E3A8A]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#1E3A8A]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            </nav>

            <div className="flex items-center gap-3">
              {actions}
              <button type="button" className="secondary-button" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

export default AppShell;
