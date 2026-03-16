function StatCard({ label, value, accent = "text-blue-900" }) {
  return (
    <div className="dashboard-card">
      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className={`mt-3 text-3xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

export default StatCard;
