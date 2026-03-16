import AppShell from "../components/AppShell";
import { verifiedCitizenSnapshot } from "../data/citizenServices";

function DobServicesPage() {
  return (
    <AppShell
      title="DOB Record Services"
      subtitle="Birth and date-of-birth services are separated from income and subsidy workflows, which matches the government portal model more clearly."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="dashboard-card lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Registered Date of Birth</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{verifiedCitizenSnapshot.dob}</p>
          <p className="mt-2 text-sm text-slate-600">Stored under the protected vital-records service.</p>
        </div>
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Certificate Status</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">Verified</p>
          <p className="mt-2 text-sm text-slate-600">No integrity issue has been reported for the DOB record.</p>
        </div>
      </section>

      <section className="mt-8 page-section">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Service Scope</p>
            <p className="mt-3 text-sm text-slate-900">Birth certificate issue, DOB validation, and record integrity.</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Privacy Rule</p>
            <p className="mt-3 text-sm text-slate-900">DOB is shown only inside the citizen-owned record space.</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Integrity Layer</p>
            <p className="mt-3 text-sm text-slate-900">Vital records remain tamper-evident through protected storage.</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default DobServicesPage;
