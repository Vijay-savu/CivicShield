import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import IntegrityBadge from "../components/IntegrityBadge";
import TamperAlert from "../components/TamperAlert";
import { getRecordById } from "../services/recordService";
import { checkEligibility } from "../services/verificationService";

const maskValue = (value, visibleDigits = 4) => {
  const normalized = String(value ?? "");

  if (!normalized) {
    return "Unavailable";
  }

  if (normalized.length <= visibleDigits) {
    return normalized;
  }

  return `${"*".repeat(normalized.length - visibleDigits)}${normalized.slice(-visibleDigits)}`;
};

function RecordViewerPage() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [integrityStatus, setIntegrityStatus] = useState("VERIFIED");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const loadRecord = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getRecordById(id);
      setRecord(data.record);
      setIntegrityStatus(data.integrityStatus);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load application.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecord();
  }, [id]);

  const handleVerify = async () => {
    setFeedback("");
    setError("");

    try {
      const result = await checkEligibility(id);
      setFeedback(result.reason || "Eligibility checked successfully.");
      await loadRecord();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Verification failed.");
    }
  };

  return (
    <AppShell
      title="Application Detail"
      subtitle="Your application and verification result."
    >
      {error ? <div className="status-danger px-5 py-4 text-sm">{error}</div> : null}
      {feedback ? <div className="status-success mb-6 px-5 py-4 text-sm">{feedback}</div> : null}

      {loading ? (
        <div className="page-section text-sm text-slate-600">Loading application...</div>
      ) : record ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <TamperAlert alerts={integrityStatus === "TAMPERING DETECTED" ? [record] : []} />

            <section className="grid gap-4 md:grid-cols-3">
              <div className="dashboard-card">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Scheme</div>
                <div className="mt-3 text-lg font-bold text-slate-900">{record.schemeType}</div>
              </div>
              <div className="dashboard-card">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Status</div>
                <div className="mt-3">
                  <IntegrityBadge status={integrityStatus} />
                </div>
              </div>
              <div className="dashboard-card">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Decision</div>
                <div className="mt-3 text-lg font-bold text-slate-900 capitalize">{record.decision?.status || "pending"}</div>
              </div>
            </section>

            <section className="page-section">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Application</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{record.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{maskValue(record.aadhaar || record.aadhaarNumber)}</p>
                </div>
                <Link className="secondary-button" to="/my-applications">
                  Back
                </Link>
              </div>

              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs uppercase tracking-[0.24em] text-slate-500">Application ID</dt>
                  <dd className="mt-2 break-all text-base text-slate-900">{record._id}</dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs uppercase tracking-[0.24em] text-slate-500">Submission Date</dt>
                  <dd className="mt-2 text-base text-slate-900">{new Date(record.createdAt).toLocaleString()}</dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs uppercase tracking-[0.24em] text-slate-500">Extracted Income</dt>
                  <dd className="mt-2 text-base text-slate-900">Rs. {Number(record.extractedIncome || record.income).toLocaleString()}</dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <dt className="text-xs uppercase tracking-[0.24em] text-slate-500">Verified Income</dt>
                  <dd className="mt-2 text-base text-slate-900">
                    {record.verifiedIncome === null || record.verifiedIncome === undefined
                      ? "Unavailable"
                      : `Rs. ${Number(record.verifiedIncome).toLocaleString()}`}
                  </dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.24em] text-slate-500">Address</dt>
                  <dd className="mt-2 text-base text-slate-900">{record.address}</dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                  <dt className="text-xs uppercase tracking-[0.24em] text-slate-500">Income Certificate</dt>
                  <dd className="mt-2 text-base text-slate-900">{record.incomeCertificateFileName || "Uploaded document"}</dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="page-section">
            <h2 className="text-xl font-bold text-slate-900">Automatic Scheme Decision</h2>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              {record.verificationResult
                ? `${record.verificationResult.eligible ? "Eligible" : "Not Eligible"} - ${record.verificationResult.reason}`
                : "Pending verification"}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Decision: <span className="font-semibold capitalize text-slate-900">{record.decision?.status || "pending"}</span>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Documents:{" "}
              <span className="font-semibold text-slate-900">
                {record.documentStatus?.verified ? "Verified" : "Rejected"}
              </span>
              {record.documentStatus?.reason ? ` - ${record.documentStatus.reason}` : ""}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              OCR Engine: <span className="font-semibold text-slate-900">{record.ocrEngine || "Unavailable"}</span>
            </div>

            {record.suspicious ? (
              <div className="status-danger mt-4 px-4 py-3 text-sm">
                Income verification failed against the trusted government record.
              </div>
            ) : null}

            {record.mismatchDetected ? (
              <div className="status-danger mt-4 px-4 py-3 text-sm">
                OCR income does not match the trusted government record.
              </div>
            ) : null}

            {integrityStatus === "TAMPERING DETECTED" ? (
              <div className="status-danger mt-4 px-4 py-3 text-sm">
                Your record integrity has changed. Contact the cybercrime helpdesk immediately.
              </div>
            ) : null}

            <div className="mt-5">
              <button className="primary-button" type="button" onClick={handleVerify}>
                Refresh Verification
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}

export default RecordViewerPage;
