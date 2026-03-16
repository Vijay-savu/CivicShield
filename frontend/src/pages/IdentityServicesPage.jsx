import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { verifiedCitizenSnapshot } from "../data/citizenServices";
import { getRecords } from "../services/recordService";

function maskAadhaar(value) {
  const digits = String(value || "").replace(/\s+/g, "");

  if (digits.length < 4) {
    return value || "Not available";
  }

  return `XXXX XXXX ${digits.slice(-4)}`;
}

function IdentityServicesPage() {
  const [latestRecord, setLatestRecord] = useState(null);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const records = await getRecords();
        setLatestRecord(records[0] || null);
      } catch (error) {
        setLatestRecord(null);
      }
    };

    loadRecords();
  }, []);

  const aadhaarValue = latestRecord?.aadhaar || latestRecord?.aadhaarNumber || verifiedCitizenSnapshot.aadhaar;
  const addressValue = latestRecord?.address || "No verified address has been submitted yet.";

  return (
    <AppShell
      title="Identity Verification Services"
      subtitle="Aadhaar, PAN, and core identity details are stored as protected citizen attributes and exposed only to the owner."
    >
      <section className="grid gap-4 lg:grid-cols-4">
        <div className="dashboard-card lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Aadhaar Status</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{maskAadhaar(aadhaarValue)}</p>
          <p className="mt-2 text-sm text-slate-600">Verified and masked in the citizen portal.</p>
        </div>
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">PAN Status</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{verifiedCitizenSnapshot.pan}</p>
          <p className="mt-2 text-sm text-slate-600">Linked for tax and benefit workflows.</p>
        </div>
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Last Verification</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{verifiedCitizenSnapshot.lastVerified}</p>
          <p className="mt-2 text-sm text-slate-600">Registry sync completed successfully.</p>
        </div>
      </section>

      <section className="mt-8 page-section">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Citizen ID</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{verifiedCitizenSnapshot.citizenId}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Issuing Authority</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{verifiedCitizenSnapshot.issuingAuthority}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Registered Address</p>
            <p className="mt-3 text-base text-slate-900">{addressValue}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Access Rule</p>
            <p className="mt-3 text-base text-slate-900">
              Only the citizen can view full identity data. Other services receive verification status only.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="page-section">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Stored Details</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            <li>Aadhaar is used to match government income records.</li>
            <li>PAN is linked separately for tax-facing services.</li>
            <li>Identity details remain isolated from benefit-service screens.</li>
          </ul>
        </div>
        <div className="page-section">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Next Service</p>
          <p className="mt-4 text-sm text-slate-600">
            Continue to DOB, Income, Tax, or Subsidy modules from the dashboard without exposing the full identity record.
          </p>
          <Link to="/dashboard" className="primary-button mt-5">
            Back to Services
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

export default IdentityServicesPage;
