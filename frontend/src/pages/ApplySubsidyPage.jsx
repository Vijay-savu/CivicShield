import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import RecordForm from "../components/RecordForm";
import { schemeConfig } from "../data/portalConfig";
import { getDocuments } from "../services/documentService";
import { createRecord } from "../services/recordService";

function ApplySubsidyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const requestedScheme = searchParams.get("scheme");
  const defaultScheme = requestedScheme && schemeConfig[requestedScheme] ? requestedScheme : "Subsidy Support";
  const [selectedScheme, setSelectedScheme] = useState(defaultScheme);
  const initialFormValues = useMemo(() => ({ schemeType: selectedScheme }), [selectedScheme]);

  useEffect(() => {
    setSelectedScheme(defaultScheme);
  }, [defaultScheme]);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await getDocuments();
        setDocuments(response);
      } catch (requestError) {
        setDocuments([]);
      }
    };

    loadDocuments();
  }, []);

  const handleCreate = async (formData) => {
    setSubmitting(true);
    setFeedback("");
    setError("");

    try {
      const record = await createRecord(formData);
      setFeedback(record.verificationResult?.reason || "Application submitted successfully.");
      navigate(`/records/${record._id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Apply for Schemes"
      subtitle="Select a government scheme and submit it using your verified stored documents."
    >
      <div className="grid gap-6">
        {feedback ? <div className="status-success px-5 py-4 text-sm">{feedback}</div> : null}
        {error ? <div className="status-danger px-5 py-4 text-sm">{error}</div> : null}

        <section className="overflow-hidden rounded-[30px] border border-blue-100 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
          <div className="grid gap-6 bg-[linear-gradient(135deg,rgba(30,58,138,0.06),rgba(59,130,246,0.03))] px-6 py-7 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="portal-ribbon">Government Scheme Access</div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Choose a Service</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                CivicShield uses your uploaded documents for faster scheme processing and citizen-side integrity tracking.
              </p>
            </div>
            <div className="rounded-3xl border border-blue-100 bg-white p-5">
              <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Selected Service</div>
              <div className="mt-3 text-2xl font-bold text-[#1E3A8A]">{selectedScheme}</div>
              <p className="mt-2 text-sm text-slate-600">{schemeConfig[selectedScheme]?.eligibilityHint}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {Object.entries(schemeConfig).map(([schemeName, config]) => (
            <article
              key={schemeName}
              className={`rounded-[28px] border p-6 shadow-[0_14px_30px_rgba(15,23,42,0.08)] ${
                selectedScheme === schemeName ? "border-blue-200 bg-[linear-gradient(135deg,#eff6ff,white)]" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-title">Scheme</p>
                  <h2 className="mt-3 text-xl font-bold text-slate-900">{config.heading}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{config.description}</p>
                  <p className="mt-4 text-sm font-medium text-blue-900">{config.eligibilityHint}</p>
                </div>
                <button
                  type="button"
                  className={selectedScheme === schemeName ? "primary-button" : "secondary-button"}
                  onClick={() => setSelectedScheme(schemeName)}
                >
                  {selectedScheme === schemeName ? "Selected" : "Choose"}
                </button>
              </div>
            </article>
          ))}
        </section>
        <RecordForm
          title="Scheme Application"
          initialValues={initialFormValues}
          documents={documents}
          submitLabel={submitting ? "Submitting..." : "Submit Application"}
          onSubmit={handleCreate}
          disabled={submitting}
          resetOnSubmit
        />
      </div>
    </AppShell>
  );
}

export default ApplySubsidyPage;
