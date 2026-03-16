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
        <header className="mb-6 overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_16px_38px_rgba(15,23,42,0.09)]">
          <div className="border-b border-blue-100 bg-[linear-gradient(90deg,#eff6ff,rgba(255,255,255,0.95))] px-5 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E3A8A] text-base font-bold text-white shadow-[0_12px_20px_rgba(30,58,138,0.2)]"
                >
                  CS
                </Link>
                <div className="min-w-0">
                  <div className="portal-ribbon">Digital Public Services</div>
                  <div className="mt-2 truncate text-lg font-semibold text-slate-900">CivicShield Government Portal</div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Citizen Access</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">{getDisplayName(user)}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              {title ? <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">{title}</h1> : null}
              {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
            </div>

            <div className="flex items-center gap-3">
              {actions}
              <button type="button" className="secondary-button" onClick={logout}>
                Logout
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 px-4 py-3">
            <nav className="flex flex-wrap gap-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#1E3A8A] text-white shadow-[0_8px_16px_rgba(30,58,138,0.18)]"
                        : "text-slate-600 hover:bg-blue-50 hover:text-[#1E3A8A]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}

export default AppShell;
