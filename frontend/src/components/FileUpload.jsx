import { useEffect, useState } from "react";

function FileUpload({ fileName, file, onChange, disabled = false }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file || file.type === "application/pdf") {
      setPreviewUrl("");
      return undefined;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);

    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [file]);

  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      Upload Income Certificate
      <div className="rounded-3xl border border-dashed border-blue-200 bg-blue-50/70 p-4">
        <input
          className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#1E3A8A] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          type="file"
          accept=".pdf,image/*"
          onChange={(event) => onChange(event.target.files?.[0] || null)}
          disabled={disabled}
          required
        />
        <p className="mt-3 text-xs text-slate-500">
          Accepted formats: PDF, JPG, JPEG, PNG. Upload the income certificate issued by the government authority.
        </p>
        {fileName ? <p className="mt-3 text-sm text-slate-700">Selected file: {fileName}</p> : null}
        {file?.type === "application/pdf" ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            PDF selected. Preview will be available after upload.
          </div>
        ) : null}
        {previewUrl ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
            <img src={previewUrl} alt="Income certificate preview" className="max-h-56 w-full rounded-xl object-contain" />
          </div>
        ) : null}
      </div>
    </label>
  );
}

export default FileUpload;
