import { Link } from "react-router-dom";

function TamperAlert({ alerts }) {
  if (!alerts.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Security Alert</p>
        <h2 className="text-xl font-bold text-rose-900">Tampering detected in your application data</h2>
        <p className="text-sm text-rose-800">
          Your application no longer matches its stored integrity proof. The portal has raised a citizen-facing alert.
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {alerts.map((record) => (
          <div key={record._id} className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm">
            <div className="font-semibold text-slate-900">{record.name}</div>
            <div className="text-slate-600">{record.schemeType}</div>
            <Link className="mt-2 inline-block text-rose-700 underline" to={`/records/${record._id}`}>
              Review affected application
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TamperAlert;
