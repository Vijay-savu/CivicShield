import { Link } from "react-router-dom";
import IntegrityBadge from "./IntegrityBadge";

function RecordTable({ records, loading, currentRole }) {
  return (
    <section className="table-shell">
      <div className="mb-5">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold text-slate-900">
            {currentRole === "officer" ? "Officer Verification Queue" : "Submitted Applications"}
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="px-6 pb-6 text-sm text-slate-600">Loading applications...</div>
      ) : records.length === 0 ? (
        <div className="px-6 pb-6">
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            No applications available.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">{currentRole === "officer" ? "Application ID" : "Applicant"}</th>
                <th className="px-6 py-4 font-medium">Scheme</th>
                <th className="px-6 py-4 font-medium">{currentRole === "officer" ? "Access" : "Income"}</th>
                <th className="px-6 py-4 font-medium">Integrity</th>
                <th className="px-6 py-4 font-medium">Eligibility</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {records.map((record) => (
                <tr key={record._id || record.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">{currentRole === "officer" ? record.id : record.name}</td>
                  <td className="px-6 py-4 text-slate-700">{record.schemeType}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {currentRole === "officer"
                      ? record.suspicious
                        ? "Masked / Suspicious"
                        : "Masked"
                      : `Rs. ${Number(record.income).toLocaleString()}`}
                  </td>
                  <td className="px-6 py-4">
                    <IntegrityBadge status={record.integrityStatus} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {currentRole === "officer"
                      ? record.eligibilityStatus
                      : record.verificationResult
                        ? record.verificationResult.eligible
                          ? "Eligible"
                          : "Not Eligible"
                        : "Pending"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {currentRole === "officer" ? (
                        <span className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                          Verification Only
                        </span>
                      ) : (
                        <Link className="secondary-button" to={`/records/${record._id}`}>
                          View
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default RecordTable;
