function ActivityLogPanel({ logs, loading }) {
  return (
    <section className="page-section">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Monitoring Logs</h2>
        <p className="mt-1 text-sm text-slate-600">
          Login attempts, record changes, and tampering alerts are recorded here.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-slate-600">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          Activity logs will appear after login and record actions.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <article key={log._id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold capitalize text-slate-900">
                    {log.action.replaceAll("_", " ")}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{log.details || "No details recorded."}</div>
                </div>
                <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs uppercase tracking-wide text-slate-600">
                  {log.status}
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                {log.user} | {new Date(log.timestamp).toLocaleString()}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ActivityLogPanel;
