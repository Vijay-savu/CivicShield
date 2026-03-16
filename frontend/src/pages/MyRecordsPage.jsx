import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell";
import IntegrityBadge from "../components/IntegrityBadge";
import { getRecords } from "../services/recordService";

const getDecisionLabel = (record) => {
  if (record.integrityStatus === "TAMPERING DETECTED") {
    return { text: "Tampered", classes: "bg-rose-50 text-rose-700" };
  }

  if (!record.verificationResult) {
    return { text: "Pending", classes: "bg-slate-100 text-slate-600" };
  }

  if (record.verificationResult.eligible) {
    return { text: "Eligible", classes: "bg-emerald-50 text-emerald-700" };
  }

  if (record.suspicious) {
    return { text: "Suspicious", classes: "bg-amber-50 text-amber-700" };
  }

  return { text: "Rejected", classes: "bg-rose-50 text-rose-700" };
};

function MyRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecords = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getRecords();
        setRecords(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load records.");
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  return (
    <AppShell title="My Applications" subtitle="Your submitted applications.">
      {error ? <div className="status-danger px-5 py-4 text-sm">{error}</div> : null}
      {!loading && records.some((record) => record.integrityStatus === "TAMPERING DETECTED") ? (
        <div className="status-danger mb-6 px-5 py-4 text-sm">
          One or more applications failed integrity verification. A security alert has been posted to your account.
        </div>
      ) : null}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="dashboard-card">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Applications</div>
          <div className="mt-3 text-3xl font-bold text-slate-900">{records.length}</div>
        </div>
        <div className="dashboard-card">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Eligible</div>
          <div className="mt-3 text-3xl font-bold text-emerald-600">
            {records.filter((record) => record.verificationResult?.eligible).length}
          </div>
        </div>
        <div className="dashboard-card">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Pending</div>
          <div className="mt-3 text-3xl font-bold text-slate-900">
            {records.filter((record) => !record.verificationResult).length}
          </div>
        </div>
        <div className="dashboard-card">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Tamper Alerts</div>
          <div className="mt-3 text-3xl font-bold text-rose-600">
            {records.filter((record) => record.integrityStatus === "TAMPERING DETECTED").length}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="dashboard-card">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Latest Scheme</div>
          <div className="mt-3 text-lg font-bold text-slate-900">{records[0]?.schemeType || "No application"}</div>
        </div>
        <div className="dashboard-card">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Latest Status</div>
          <div className="mt-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getDecisionLabel(records[0] || {}).classes || "bg-slate-100 text-slate-600"}`}>
              {records[0] ? getDecisionLabel(records[0]).text : "No application"}
            </span>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Last Submitted</div>
          <div className="mt-3 text-lg font-bold text-slate-900">
            {records[0]?.createdAt ? new Date(records[0].createdAt).toLocaleDateString() : "No application"}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        {loading ? (
          <div className="page-section text-sm text-slate-600">Loading applications...</div>
        ) : records.length === 0 ? (
          <div className="page-section text-sm text-slate-600">No applications submitted yet.</div>
        ) : (
          records.map((record) => {
            const decisionLabel = getDecisionLabel(record);

            return (
              <article
                key={record._id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Scheme</p>
                    <h2 className="mt-3 text-2xl font-bold text-slate-900">{record.schemeType}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Submitted on {new Date(record.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <IntegrityBadge status={record.integrityStatus} />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Application ID</div>
                    <div className="mt-2 break-all text-sm text-slate-900">{record._id}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Decision</div>
                    <div className="mt-2">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${decisionLabel.classes}`}>
                        {decisionLabel.text}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Documents</div>
                    <div className="mt-2 text-sm font-medium text-slate-900">
                      {record.documentStatus?.verified ? "Verified" : "Needs review"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Income Check</div>
                    <div className="mt-2 text-sm font-medium text-slate-900">
                      {record.verifiedIncome === null || record.verifiedIncome === undefined
                        ? "Unavailable"
                        : `Rs. ${Number(record.verifiedIncome).toLocaleString()}`}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="text-sm text-slate-600">
                    {record.verificationResult?.reason || record.documentStatus?.reason || "Waiting for verification result."}
                  </div>
                  <Link className="secondary-button" to={`/records/${record._id}`}>
                    Open
                  </Link>
                </div>
              </article>
            );
          })
        )}
      </section>
    </AppShell>
  );
}

export default MyRecordsPage;
