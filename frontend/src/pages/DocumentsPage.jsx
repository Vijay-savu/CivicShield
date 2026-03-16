import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import DocumentCard from "../components/DocumentCard";
import UploadForm from "../components/UploadForm";
import { documentTypeConfig, requiredCitizenDocuments } from "../data/portalConfig";
import { deleteDocument, getDocuments, uploadDocument } from "../services/documentService";

function DocumentsPage() {
  const [searchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const selectedType = useMemo(() => searchParams.get("type") || "aadhaar", [searchParams]);
  const latestDocumentsByType = useMemo(
    () =>
      documents.reduce((accumulator, document) => {
        if (!accumulator[document.documentType]) {
          accumulator[document.documentType] = document;
        }

        return accumulator;
      }, {}),
    [documents]
  );
  const visibleDocuments = useMemo(
    () =>
      requiredCitizenDocuments
        .map((type) => latestDocumentsByType[type])
        .filter(Boolean),
    [latestDocumentsByType]
  );
  const missingDocuments = requiredCitizenDocuments.filter((type) => !latestDocumentsByType[type]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await getDocuments();
      setDocuments(response);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (payload) => {
    setUploading(true);
    setFeedback("");
    setError("");

    try {
      const document = await uploadDocument(payload);
      setFeedback(`${document.documentLabel} saved successfully.`);
      await loadDocuments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (document) => {
    setDeletingId(document._id);
    setFeedback("");
    setError("");

    try {
      await deleteDocument(document._id);
      setFeedback(`${document.documentLabel} removed successfully.`);
      await loadDocuments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to remove document.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <AppShell
      title="My Documents"
      subtitle="Securely maintain verified government documents for service use."
    >
      <div className="grid gap-6">
        {feedback ? <div className="status-success px-5 py-4 text-sm">{feedback}</div> : null}
        {error ? <div className="status-danger px-5 py-4 text-sm">{error}</div> : null}

        <section className="overflow-hidden rounded-[30px] border border-blue-100 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
          <div className="grid gap-6 bg-[linear-gradient(135deg,rgba(30,58,138,0.06),rgba(59,130,246,0.03))] px-6 py-7 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <div className="portal-ribbon">Citizen Document Vault</div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Verified Documents</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Upload one trusted copy of each document type. New uploads replace the previous version automatically.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Uploaded</div>
                <div className="mt-3 text-4xl font-bold text-[#1E3A8A]">{visibleDocuments.length}</div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="text-xs uppercase tracking-[0.22em] text-slate-500">Missing</div>
                <div className="mt-3 text-4xl font-bold text-amber-600">{missingDocuments.length}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="mb-4">
            <div className="section-title">Document Status</div>
            <h3 className="mt-2 text-xl font-bold text-slate-900">Required Records</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {requiredCitizenDocuments.map((type) => {
              const document = latestDocumentsByType[type];
              const config = documentTypeConfig[type];

              return (
                <article key={type} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{config.label}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        document ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                    {document ? "Uploaded" : "Missing"}
                  </span>
                  </div>
                  <div className="mt-4 text-sm text-slate-600">
                    {document ? (
                      <>
                        <div className="font-medium text-slate-900">{document.originalFileName}</div>
                        <div className="mt-1">Uploaded on {new Date(document.uploadedAt).toLocaleDateString()}</div>
                      </>
                    ) : (
                      <div>Not uploaded</div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <UploadForm onSubmit={handleUpload} disabled={uploading} initialType={selectedType} />

        <section>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <div className="page-section text-sm text-slate-600">Loading documents...</div>
            ) : visibleDocuments.length === 0 ? (
              <div className="page-section text-sm text-slate-600">No documents uploaded yet.</div>
            ) : (
              visibleDocuments.map((document) => (
                <DocumentCard
                  key={document._id}
                  document={document}
                  onDelete={handleDelete}
                  deleting={deletingId === document._id}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default DocumentsPage;
