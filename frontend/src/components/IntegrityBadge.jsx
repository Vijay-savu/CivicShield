function IntegrityBadge({ status }) {
  const isSafe = status === "VERIFIED";
  const classes = isSafe
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-800";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>
      {status}
    </span>
  );
}

export default IntegrityBadge;
