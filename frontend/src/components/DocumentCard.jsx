import IntegrityBadge from "./IntegrityBadge";

function DocumentCard({ document, onDelete, deleting = false }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
      <div className="h-1 bg-gradient-to-r from-[#1E3A8A] via-[#3B82F6] to-[#93C5FD]" />
      <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-title">{document.documentLabel}</p>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">{document.documentLabel}</h3>
          <p className="mt-1 text-sm text-slate-500">{document.originalFileName}</p>
        </div>
        <div className="flex items-center gap-3">
          <IntegrityBadge status={document.integrityStatus} />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600"
            onClick={() => onDelete?.(document)}
            disabled={deleting}
            aria-label={`Remove ${document.documentLabel}`}
          >
            x
          </button>
        </div>
      </div>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Uploaded</dt>
          <dd className="mt-2 text-slate-900">{new Date(document.uploadedAt).toLocaleDateString()}</dd>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Format</dt>
          <dd className="mt-2 text-slate-900">{document.mimeType}</dd>
        </div>
        {document.extractedIncome !== null && document.extractedIncome !== undefined ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Extracted Income</dt>
            <dd className="mt-2 text-slate-900">Rs. {Number(document.extractedIncome).toLocaleString()}</dd>
          </div>
        ) : null}
      </dl>
      </div>
    </article>
  );
}

export default DocumentCard;
