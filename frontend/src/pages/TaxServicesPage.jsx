import AppShell from "../components/AppShell";
import { verifiedCitizenSnapshot } from "../data/citizenServices";

function TaxServicesPage() {
  return (
    <AppShell
      title="Tax Service Module"
      subtitle="Tax is exposed as a separate government service so the citizen can access PAN-linked actions without mixing them with subsidy or identity records."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">PAN</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{verifiedCitizenSnapshot.pan}</p>
          <p className="mt-2 text-sm text-slate-600">Registered for tax-facing services.</p>
        </div>
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Tax Account</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{verifiedCitizenSnapshot.taxAccount}</p>
          <p className="mt-2 text-sm text-slate-600">Separate from income eligibility records.</p>
        </div>
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Privacy Rule</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">Masked Access</p>
          <p className="mt-2 text-sm text-slate-600">Only tax service status is exposed across modules.</p>
        </div>
      </section>

      <section className="mt-8 page-section">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">What This Service Covers</p>
            <p className="mt-3 text-sm text-slate-900">
              PAN linkage, filing readiness, and tax-service status checks in an isolated module.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Why It Is Separate</p>
            <p className="mt-3 text-sm text-slate-900">
              The problem statement expects multiple e-governance services like tax, birth certificates, and subsidies,
              each protected independently.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default TaxServicesPage;
