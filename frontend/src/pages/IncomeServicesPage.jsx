import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import { getRecords } from "../services/recordService";

function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Not available";
  }

  return `Rs. ${Number(value).toLocaleString()}`;
}

function IncomeServicesPage() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await getRecords();
        setRecords(response);
      } catch (error) {
        setRecords([]);
      }
    };

    loadRecords();
  }, []);

  const summary = useMemo(() => {
    const latest = records[0] || null;

    return {
      latest,
      verifiedCount: records.filter((record) => record.integrityStatus === "VERIFIED").length,
      suspiciousCount: records.filter((record) => record.suspicious).length,
    };
  }, [records]);

  return (
    <AppShell
      title="Income Verification Services"
      subtitle="Income is not typed manually for trust. CivicShield extracts and compares it against protected government records before benefit access."
    >
      <section className="grid gap-4 md:grid-cols-3">
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Latest Extracted Income</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {formatCurrency(summary.latest?.extractedIncome ?? summary.latest?.income)}
          </p>
        </div>
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Verified Records</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{summary.verifiedCount}</p>
        </div>
        <div className="dashboard-card">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Mismatch Alerts</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{summary.suspiciousCount}</p>
        </div>
      </section>

      <section className="mt-8 page-section">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Trusted Government Income</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {formatCurrency(summary.latest?.verifiedIncome)}
            </p>
            <p className="mt-2 text-sm text-slate-600">Matched through Aadhaar-backed government income records.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current Verification Result</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {summary.latest?.verificationResult?.reason || "Submit a service application to generate a result."}
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-slate-700">
          Subsidy services use the verified income band. If the extracted certificate income and the trusted government
          income do not match, the application is flagged suspicious automatically.
        </div>
        <Link to="/subsidy-services" className="primary-button mt-6">
          Open Subsidy Services
        </Link>
      </section>
    </AppShell>
  );
}

export default IncomeServicesPage;
