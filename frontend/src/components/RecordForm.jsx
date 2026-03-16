import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { documentTypeConfig, schemeConfig } from "../data/portalConfig";

const emptyForm = {
  name: "",
  address: "",
  schemeType: "Subsidy Support",
  aadhaarNumber: "",
  aadhaarDocumentId: "",
  panDocumentId: "",
  incomeCertificateDocumentId: "",
};

const toFormState = (initialValues) => ({
  name: initialValues?.name ?? "",
  address: initialValues?.address ?? "",
  schemeType: initialValues?.schemeType ?? "Subsidy Support",
  aadhaarNumber: initialValues?.aadhaarNumber ?? "",
  aadhaarDocumentId: initialValues?.aadhaarDocumentId ?? "",
  panDocumentId: initialValues?.panDocumentId ?? "",
  incomeCertificateDocumentId: initialValues?.incomeCertificateDocumentId ?? "",
});

const extractAadhaarNumber = (text) => {
  const normalized = String(text ?? "").replace(/\D/g, "");
  const match = normalized.match(/\d{12}/);
  return match ? match[0] : "";
};

function RecordForm({
  title,
  submitLabel,
  initialValues,
  documents = [],
  onSubmit,
  disabled = false,
  resetOnSubmit = false,
}) {
  const [form, setForm] = useState(() => toFormState(initialValues));

  const documentsByType = useMemo(
    () =>
      documents.reduce((accumulator, document) => {
        if (!accumulator[document.documentType]) {
          accumulator[document.documentType] = [];
        }

        accumulator[document.documentType].push(document);
        return accumulator;
      }, {}),
    [documents]
  );

  useEffect(() => {
    setForm(toFormState(initialValues));
  }, [initialValues]);

  useEffect(() => {
    const aadhaarDocument = (documentsByType.aadhaar || []).find((document) => document._id === form.aadhaarDocumentId);
    const extractedAadhaar = extractAadhaarNumber(aadhaarDocument?.ocrText);

    if (form.aadhaarDocumentId && extractedAadhaar) {
      setForm((current) => ({ ...current, aadhaarNumber: extractedAadhaar }));
    }
  }, [documentsByType.aadhaar, form.aadhaarDocumentId]);

  const selectedScheme = schemeConfig[form.schemeType];
  const missingRequiredDocuments = selectedScheme.requiredDocuments.filter(
    (type) => !(documentsByType[type] || []).length
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);

    if (resetOnSubmit) {
      setForm(emptyForm);
    }
  };

  return (
    <section className="page-section">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="text-xl font-bold text-slate-900">{title}</div>
        <div className="text-sm text-slate-500">{form.schemeType}</div>
      </div>

      {missingRequiredDocuments.length ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Missing:{" "}
          <span className="font-semibold">
            {missingRequiredDocuments.map((type) => documentTypeConfig[type].shortLabel).join(", ")}
          </span>
          <div className="mt-4 flex flex-wrap gap-3">
            {missingRequiredDocuments.map((type) => (
              <Link
                key={type}
                className="secondary-button"
                to={`/documents?type=${type}`}
              >
                Upload {documentTypeConfig[type].shortLabel}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="field-input"
            name="name"
            placeholder="Applicant name"
            value={form.name}
            onChange={handleChange}
            disabled={disabled}
            required
          />
          <select
            className="field-input"
            name="schemeType"
            value={form.schemeType}
            onChange={handleChange}
            disabled={disabled}
            required
          >
            {Object.keys(schemeConfig).map((schemeName) => (
              <option key={schemeName} value={schemeName}>
                {schemeName}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className="field-input min-h-28 resize-none"
          name="address"
          placeholder="Residential address"
          value={form.address}
          onChange={handleChange}
          disabled={disabled}
          required
        />
        <input type="hidden" name="aadhaarNumber" value={form.aadhaarNumber || ""} readOnly />
        <div className="grid gap-4 md:grid-cols-3">
          <select
            className="field-input"
            name="aadhaarDocumentId"
            value={form.aadhaarDocumentId}
            onChange={handleChange}
            disabled={disabled}
            required
          >
            <option value="">Select Aadhaar</option>
            {(documentsByType.aadhaar || []).map((document) => (
              <option key={document._id} value={document._id}>
                {document.originalFileName}
              </option>
            ))}
          </select>
          <select
            className="field-input"
            name="panDocumentId"
            value={form.panDocumentId}
            onChange={handleChange}
            disabled={disabled}
            required
          >
            <option value="">Select PAN</option>
            {(documentsByType.pan || []).map((document) => (
              <option key={document._id} value={document._id}>
                {document.originalFileName}
              </option>
            ))}
          </select>
          <select
            className="field-input"
            name="incomeCertificateDocumentId"
            value={form.incomeCertificateDocumentId}
            onChange={handleChange}
            disabled={disabled}
            required
          >
            <option value="">Select Income Certificate</option>
            {(documentsByType.income_certificate || []).map((document) => (
              <option key={document._id} value={document._id}>
                {document.originalFileName}
              </option>
            ))}
          </select>
        </div>
        <button className="primary-button" type="submit" disabled={disabled || missingRequiredDocuments.length > 0}>
          {submitLabel}
        </button>
      </form>
    </section>
  );
}

export default RecordForm;
