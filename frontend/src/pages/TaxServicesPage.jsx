import AppShell from "../components/AppShell";
import { useEffect, useState } from "react";
import { getTaxStatus } from "../services/taxService";
import { getGatewayAvailability, getGatewayStatus } from "../services/gatewayService";

const formatCooldown = (openUntil) => {
  if (!openUntil) {
    return "Available";
  }

  const remainingMs = openUntil - Date.now();

  if (remainingMs <= 0) {
    return "Recovered";
  }

  return `${Math.ceil(remainingMs / 1000)}s`;
};

function TaxServicesPage() {
  const [status, setStatus] = useState(null);
  const [gatewayStatus, setGatewayStatus] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTaxStatus = async (simulateOverload = false) => {
    setLoading(true);
    setError("");

    try {
      const response = await getTaxStatus(simulateOverload ? { simulateOverload: true } : {});
      setStatus(response);
    } catch (requestError) {
      setStatus(requestError.response?.data || null);
      setError(requestError.response?.data?.message || "Tax service unavailable.");
    } finally {
      try {
        const gateway = await getGatewayStatus();
        setGatewayStatus(gateway);
      } catch (gatewayError) {
        setGatewayStatus(null);
      }
      try {
        const availabilitySnapshot = await getGatewayAvailability();
        setAvailability(availabilitySnapshot.availability);
      } catch (availabilityError) {
        setAvailability(null);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxStatus();
  }, []);

  return (
    <AppShell
      title="Tax Service Module"
      subtitle="Tax stays isolated so overload here does not stop the rest of CivicShield."
    >
      {error ? <div className="status-danger mb-6 px-5 py-4 text-sm">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">PAN</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{status?.taxProfile?.pan || "Unavailable"}</p>
          <p className="mt-2 text-sm text-slate-600">Masked for citizen-safe display.</p>
        </div>
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Service Status</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{status?.status || (loading ? "Loading" : "Degraded")}</p>
          <p className="mt-2 text-sm text-slate-600">Separate from scheme and document services.</p>
        </div>
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Filing Status</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{status?.taxProfile?.filingStatus || "Unavailable"}</p>
          <p className="mt-2 text-sm text-slate-600">Other services continue even if this module degrades.</p>
        </div>
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Recovery</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{formatCooldown(status?.circuitBreaker?.openUntil)}</p>
          <p className="mt-2 text-sm text-slate-600">Cooldown before this service accepts traffic again.</p>
        </div>
      </section>

      <section className="mt-8 page-section">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Circuit Breaker</p>
            <p className="mt-3 text-sm text-slate-900">
              If tax requests overload the service, the circuit breaker opens and only this module becomes temporarily unavailable.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Self-Healing</p>
            <p className="mt-3 text-sm text-slate-900">
              Once the cooldown ends, the service accepts traffic again without restarting the whole platform.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Platform Availability</p>
            <p className="mt-3 text-sm text-slate-900">
              Documents, scheme applications, and security alerts remain available while tax protection is active.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="primary-button" type="button" onClick={() => loadTaxStatus(true)}>
            Simulate Tax Overload
          </button>
          <button className="secondary-button" type="button" onClick={() => loadTaxStatus()}>
            Check Tax Status
          </button>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="page-section">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Gateway View</h2>
            <button className="secondary-button" type="button" onClick={() => loadTaxStatus()}>
              Refresh
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {(gatewayStatus?.services || [])
              .filter((service) =>
                ["tax-service", "document-service", "application-service", "notification-service"].includes(service.id)
              )
              .map((service) => (
                <div key={service.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{service.name}</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {service.protection?.isolated ? "Isolated" : "Running"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Requests: {service.metrics?.requestCount ?? 0} | Errors: {service.metrics?.errorCount ?? 0}
                  </p>
                </div>
              ))}
          </div>
        </div>

        <div className="page-section">
          <h2 className="text-lg font-bold text-slate-900">Demo Outcome</h2>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              1. Trigger tax overload from this page.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              2. Tax service shows temporary unavailability.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              3. Documents and scheme services continue through the same gateway.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
              4. After cooldown, tax service self-recovers.
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 page-section">
        <h2 className="text-lg font-bold text-slate-900">Availability Layer</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Degraded Mode</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{availability?.status || "Unavailable"}</p>
            <p className="mt-2 text-sm text-slate-600">{availability?.citizenImpact || "Availability status not loaded."}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Load Balancer Simulation</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {(availability?.loadBalancer?.nodes || []).map((node) => (
                <div key={node.nodeId} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">{node.nodeId}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{node.status}</p>
                  <p className="mt-2 text-sm text-slate-600">{node.services.length} routed services</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default TaxServicesPage;
