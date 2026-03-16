import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { schemeConfig } from "../data/portalConfig";
import { getDocuments } from "../services/documentService";
import { getNotifications } from "../services/notificationService";
import { getRecords } from "../services/recordService";

const featuredServices = Object.entries(schemeConfig).map(([schemeName, config], index) => ({
  title: schemeName,
  description: config.description,
  to: `/apply?scheme=${encodeURIComponent(schemeName)}`,
  tag: "Scheme",
  statLabel: "Status",
  statValue: "Active",
  number: String(index + 1).padStart(2, "0"),
}));

const documentItems = [
  { title: "Aadhaar", to: "/documents?type=aadhaar" },
  { title: "PAN", to: "/documents?type=pan" },
  { title: "Birth Certificate", to: "/documents?type=birth_certificate" },
  { title: "Driving Licence", to: "/documents?type=driving_licence" },
  { title: "Income Certificate", to: "/documents?type=income_certificate" },
];

const getDisplayName = (user) => {
  if (user?.email === "citizen@civicshield.local") {
    return "Vijay";
  }

  return user?.name?.replace(/\bcitizen\b/gi, "").trim() || user?.email || "Vijay";
};

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    documents: 0,
    alerts: 0,
    applications: 0,
  });

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [records, notifications, documents] = await Promise.all([getRecords(), getNotifications(), getDocuments()]);
        setStats({
          documents: documents.length,
          alerts: notifications.filter((notification) => !notification.read).length,
          applications: records.length,
        });
      } catch (error) {
        setStats({ documents: 0, alerts: 0, applications: 0 });
      }
    };

    loadSummary();
  }, []);

  return (
    <AppShell title="Citizen Service Dashboard" subtitle="Government services.">
      <section className="overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 bg-[linear-gradient(135deg,rgba(30,58,138,0.06),rgba(59,130,246,0.04))] px-6 py-7 lg:grid-cols-[1.4fr_0.6fr] lg:px-8">
          <div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {getDisplayName(user)}
            </h2>
          </div>
          <div className="rounded-3xl border border-blue-100 bg-white/90 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current Total</p>
            <div className="mt-4 text-5xl font-bold text-[#1E3A8A]">
              {stats.applications}
            </div>
            <div className="mt-2 text-sm text-slate-500">Applications</div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Services</div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featuredServices.map((item) => (
          <article
            key={item.title}
            className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
          >
            <div className="absolute right-6 top-4 text-7xl font-bold leading-none text-slate-100">{item.number}</div>
            <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">{item.tag}</p>
            <h3 className="relative z-10 mt-5 text-2xl font-bold text-slate-900">{item.title}</h3>
            <p className="relative z-10 mt-3 min-h-[72px] text-sm leading-7 text-slate-600">{item.description}</p>
            <div className="relative z-10 mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{item.statLabel}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{item.statValue}</p>
            </div>
            <Link className="primary-button relative z-10 mt-6 w-full" to={item.to}>
              Open Service
            </Link>
          </article>
        ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="page-section">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Documents</div>
          <div className="text-sm font-semibold text-slate-900">{stats.documents}</div>
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {documentItems.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1E3A8A]"
            >
              {item.title}
            </Link>
          ))}
        </div>
        </div>
        <div className="page-section">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Quick Access</div>
            <div className="text-sm font-semibold text-slate-900">{stats.alerts} alerts</div>
          </div>
          <div className="grid gap-3">
            <Link className="secondary-button w-full" to="/my-applications">
              My Applications
            </Link>
            <Link className="secondary-button w-full" to="/security-alerts">
              Security Alerts
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default DashboardPage;
