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
      title="Apply for Government Scheme"
      subtitle="Use stored Aadhaar, PAN, and Income Certificate documents to apply for subsidy and education-loan services."
    >
      <div className="grid gap-6">
        {feedback ? <div className="status-success px-5 py-4 text-sm">{feedback}</div> : null}
        {error ? <div className="status-danger px-5 py-4 text-sm">{error}</div> : null}
        <section className="grid gap-4 md:grid-cols-2">
          {Object.entries(schemeConfig).map(([schemeName, config]) => (
            <article
              key={schemeName}
              className={`rounded-3xl border p-6 shadow-[0_14px_30px_rgba(15,23,42,0.08)] ${
                selectedScheme === schemeName ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"
              }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Scheme</p>
                    <h2 className="mt-3 text-xl font-bold text-slate-900">{config.heading}</h2>
                    <p className="mt-3 text-sm font-medium text-blue-900">{config.eligibilityHint}</p>
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
