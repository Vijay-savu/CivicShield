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
  birthCertificateDocumentId: "",
};

const toFormState = (initialValues) => ({
  name: initialValues?.name ?? "",
  address: initialValues?.address ?? "",
  schemeType: initialValues?.schemeType ?? "Subsidy Support",
  aadhaarNumber: initialValues?.aadhaarNumber ?? "",
  aadhaarDocumentId: initialValues?.aadhaarDocumentId ?? "",
  panDocumentId: initialValues?.panDocumentId ?? "",
  incomeCertificateDocumentId: initialValues?.incomeCertificateDocumentId ?? "",
  birthCertificateDocumentId: initialValues?.birthCertificateDocumentId ?? "",
});

const documentFieldMap = {
  aadhaar: {
    field: "aadhaarDocumentId",
    placeholder: "Select Aadhaar",
  },
  pan: {
    field: "panDocumentId",
    placeholder: "Select PAN",
  },
  income_certificate: {
    field: "incomeCertificateDocumentId",
    placeholder: "Select Income Certificate",
  },
  birth_certificate: {
    field: "birthCertificateDocumentId",
    placeholder: "Select Birth Certificate",
  },
};

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
  schemes = schemeConfig,
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

  const availableSchemes = Object.keys(schemes).length ? schemes : schemeConfig;
  const selectedScheme = availableSchemes[form.schemeType] || Object.values(availableSchemes)[0];
  const missingRequiredDocuments = selectedScheme.requiredDocuments.filter(
    (type) => !(documentsByType[type] || []).length
  );
  const requiredDocumentTypes = selectedScheme.requiredDocuments.filter((type) => documentFieldMap[type]);

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
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="section-title">Application Form</div>
          <div className="mt-2 text-xl font-bold text-slate-900">{title}</div>
        </div>
        <div className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-semibold text-[#1E3A8A]">{form.schemeType}</div>
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

      {!missingRequiredDocuments.length ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          Required documents are available. You can submit this application now.
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
            {Object.keys(availableSchemes).map((schemeName) => (
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
        <div className={`grid gap-4 ${requiredDocumentTypes.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {requiredDocumentTypes.map((type) => {
            const config = documentFieldMap[type];

            return (
              <select
                key={type}
                className="field-input"
                name={config.field}
                value={form[config.field]}
                onChange={handleChange}
                disabled={disabled}
                required
              >
                <option value="">{config.placeholder}</option>
                {(documentsByType[type] || []).map((document) => (
                  <option key={document._id} value={document._id}>
                    {document.originalFileName}
                  </option>
                ))}
              </select>
            );
          })}
        </div>
        <button className="primary-button" type="submit" disabled={disabled || missingRequiredDocuments.length > 0}>
          {submitLabel}
        </button>
      </form>
    </section>
  );
}

export default RecordForm;
