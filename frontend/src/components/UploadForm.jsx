import { useEffect, useState } from "react";

const documentOptions = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "birth_certificate", label: "Birth Certificate" },
  { value: "driving_licence", label: "Driving Licence" },
  { value: "income_certificate", label: "Income Certificate" },
];

function UploadForm({ onSubmit, disabled = false, initialType = "aadhaar" }) {
  const [documentType, setDocumentType] = useState(initialType);
  const [documentFile, setDocumentFile] = useState(null);

  useEffect(() => {
    setDocumentType(initialType);
    setDocumentFile(null);
  }, [initialType]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!documentFile) {
      return;
    }

    await onSubmit({ documentType, documentFile });
    setDocumentFile(null);
    setDocumentType(initialType);
    event.target.reset();
  };

  const clearSelectedFile = () => {
    setDocumentFile(null);
  };

  return (
    <section className="page-section">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Upload</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">Add Document</h2>
        </div>
        <div className="text-sm text-slate-500">PDF or image</div>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <select
          className="field-input"
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value)}
          disabled={disabled}
        >
          {documentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Upload File
          <input
            className="field-input file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700"
            type="file"
            accept=".pdf,image/*"
            onChange={(event) => setDocumentFile(event.target.files?.[0] || null)}
            disabled={disabled}
            required
          />
        </label>
        {documentFile ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div>
              Selected file: <span className="font-semibold text-slate-900">{documentFile.name}</span>
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600"
              onClick={clearSelectedFile}
              aria-label="Remove selected file"
            >
              x
            </button>
          </div>
        ) : null}
        <button className="primary-button" type="submit" disabled={disabled || !documentFile}>
          {disabled ? "Uploading..." : "Upload Document"}
        </button>
      </form>
    </section>
  );
}

export default UploadForm;
