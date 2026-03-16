import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { schemeConfig } from "../data/portalConfig";
import { getDocuments } from "../services/documentService";
import {
  getGatewayAvailability,
  getGatewayBlueprint,
  getGatewayStatus,
  getSecurityPosture,
} from "../services/gatewayService";
import { getNotifications } from "../services/notificationService";
import { getRecords } from "../services/recordService";
import { getSchemes } from "../services/schemeService";

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

const innovationSignals = [
  { label: "Zero Trust", detail: "JWT + device binding + request validation" },
  { label: "Tamper Ledger", detail: "SHA-256 chain verifies document integrity" },
  { label: "OCR Verification", detail: "Income and identity extracted from uploads" },
  { label: "Degraded Mode", detail: "One service can fail while others continue" },
];

const fallbackBlueprint = [
  "Citizen Portal",
  "API Gateway",
  "Auth Service",
  "Document Service",
  "Verification Service",
  "Ledger Service",
  "MongoDB",
];

function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    documents: 0,
    alerts: 0,
    applications: 0,
  });
  const [platform, setPlatform] = useState({
    services: [],
    availability: null,
    securityLayers: [],
    blueprint: fallbackBlueprint,
  });
  const [featuredServices, setFeaturedServices] = useState(
    Object.entries(schemeConfig).map(([schemeName, config], index) => ({
      title: schemeName,
      description: config.description,
      to: `/apply?scheme=${encodeURIComponent(schemeName)}`,
      tag: "Service",
      statLabel: "Eligibility",
      statValue: config.eligibilityHint,
      number: String(index + 1).padStart(2, "0"),
    }))
  );

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [records, notifications, documents, gatewayStatus, availabilityData, securityPosture, blueprint, schemes] =
          await Promise.all([
            getRecords(),
            getNotifications(),
            getDocuments(),
            getGatewayStatus(),
            getGatewayAvailability(),
            getSecurityPosture(),
            getGatewayBlueprint(),
            getSchemes(),
          ]);

        setStats({
          documents: documents.length,
          alerts: notifications.filter((notification) => !notification.read).length,
          applications: records.length,
        });

        setPlatform({
          services: gatewayStatus?.services || [],
          availability: availabilityData?.availability || gatewayStatus?.availability || null,
          securityLayers: securityPosture?.layers || [],
          blueprint: blueprint?.flow?.length ? blueprint.flow : fallbackBlueprint,
        });
        setFeaturedServices(
          (schemes.length ? schemes : Object.entries(schemeConfig).map(([name, config]) => ({ name, ...config }))).map(
            (item, index) => ({
              title: item.name || item.title,
              description: item.description,
              to: `/apply?scheme=${encodeURIComponent(item.name || item.title)}`,
              tag: "Service",
              statLabel: "Eligibility",
              statValue: item.eligibilityHint,
              number: String(index + 1).padStart(2, "0"),
            })
          )
        );
      } catch (error) {
        setStats({ documents: 0, alerts: 0, applications: 0 });
        setPlatform({
          services: [],
          availability: null,
          securityLayers: [],
          blueprint: fallbackBlueprint,
        });
        setFeaturedServices(
          Object.entries(schemeConfig).map(([schemeName, config], index) => ({
            title: schemeName,
            description: config.description,
            to: `/apply?scheme=${encodeURIComponent(schemeName)}`,
            tag: "Service",
            statLabel: "Eligibility",
            statValue: config.eligibilityHint,
            number: String(index + 1).padStart(2, "0"),
          }))
        );
      }
    };

    loadDashboard();
  }, []);

  const degradedServices = platform.services.filter(
    (service) => service?.protection?.isolated || service?.circuitBreaker?.isOpen
  ).length;
  const activeServices = platform.services.length - degradedServices;
  const healthyNodes =
    platform.availability?.loadBalancer?.nodes?.filter((node) => node.status === "healthy").length || 0;
  const totalNodes = platform.availability?.loadBalancer?.nodes?.length || 0;

  return (
    <AppShell
      title="Citizen Services Command Center"
      subtitle="Documents, schemes, integrity checks, and platform readiness from one verified portal."
    >
      <section className="overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 bg-[linear-gradient(140deg,rgba(30,58,138,0.1),rgba(59,130,246,0.04))] px-6 py-7 lg:grid-cols-[1.45fr_0.75fr] lg:px-8">
          <div>
            <div className="portal-ribbon">Secure Digital Governance</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Welcome, {getDisplayName(user)}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              CivicShield combines verified document storage, scheme automation, tamper-evident integrity, and
              resilient service delivery in a single citizen portal.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {innovationSignals.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-2xl border border-blue-100 bg-white/80 px-4 py-3 shadow-sm"
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">{signal.label}</div>
                  <div className="mt-1 text-sm text-slate-600">{signal.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-blue-100 bg-white/90 p-5">
                <p className="section-title text-slate-500">Applications</p>
                <div className="mt-3 text-4xl font-bold text-[#1E3A8A]">{stats.applications}</div>
              </div>
              <div className="rounded-3xl border border-blue-100 bg-white/90 p-5">
                <p className="section-title text-slate-500">Documents</p>
                <div className="mt-3 text-4xl font-bold text-slate-900">{stats.documents}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Services Up</div>
                <div className="mt-2 text-2xl font-bold text-emerald-700">{activeServices || 0}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Security</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{platform.securityLayers.length}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Alerts</div>
                <div className="mt-2 text-2xl font-bold text-rose-700">{stats.alerts}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="page-section">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="section-title">Architecture</div>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Live Service Blueprint</h3>
            </div>
            <div className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-semibold text-[#1E3A8A]">
              API Gateway Active
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {platform.blueprint.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {step}
                </div>
                {index < platform.blueprint.length - 1 ? (
                  <div className="text-lg font-semibold text-blue-400">{">"}</div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Microservices</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{platform.services.length || 0}</div>
              <p className="mt-2 text-sm text-slate-600">Auth, documents, verification, tax, ledger, monitoring, and notifications.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Availability Mode</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">
                {platform.availability?.status === "degraded" ? "Degraded" : "Healthy"}
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {platform.availability?.citizenImpact || "Platform status will appear here when the gateway responds."}
              </p>
            </div>
          </div>
        </div>

        <div className="page-section">
          <div className="mb-5">
            <div className="section-title">Platform Assurance</div>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Security and Resilience</h3>
          </div>
          <div className="grid gap-3">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-emerald-700">Service Health</div>
              <div className="mt-2 text-2xl font-bold text-emerald-900">
                {activeServices || 0}/{platform.services.length || 0} services available
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Load Balancer</div>
              <div className="mt-2 text-xl font-bold text-slate-900">
                {healthyNodes}/{totalNodes || 0} nodes healthy
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Defense Layers</div>
              <div className="mt-2 text-xl font-bold text-slate-900">{platform.securityLayers.length} active controls</div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {platform.securityLayers.slice(0, 4).map((layer) => (
              <div key={layer.name} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-sm font-semibold text-slate-900">{layer.name}</div>
                <div className="mt-1 text-sm text-slate-600">{layer.evidence}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="section-title">Citizen Services</div>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Government Schemes</h3>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredServices.map((item) => (
            <article
              key={item.title}
              className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1E3A8A] via-[#3B82F6] to-[#93C5FD]" />
              <div className="absolute right-6 top-4 text-7xl font-bold leading-none text-slate-100">{item.number}</div>
              <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">{item.tag}</p>
              <h3 className="relative z-10 mt-5 text-2xl font-bold text-slate-900">{item.title}</h3>
              <p className="relative z-10 mt-3 min-h-[72px] text-sm leading-7 text-slate-600">{item.description}</p>
              <div className="relative z-10 mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{item.statLabel}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{item.statValue}</p>
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
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className="section-title">Document Vault</div>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Stored Citizen Documents</h3>
            </div>
            <div className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-semibold text-[#1E3A8A]">{stats.documents} saved</div>
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
            <div>
              <div className="section-title">Quick Access</div>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Common Actions</h3>
            </div>
            <div className="text-sm font-semibold text-slate-900">{stats.alerts} alerts</div>
          </div>
          <div className="grid gap-3">
            <Link className="secondary-button w-full" to="/my-applications">
              My Applications
            </Link>
            <Link className="secondary-button w-full" to="/tax-services">
              Tax Service
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
