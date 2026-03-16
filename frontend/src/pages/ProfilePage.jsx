import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

const getDisplayName = (user) => {
  if (user?.email === "citizen@civicshield.local") {
    return "Vijay";
  }

  return user?.name?.replace(/\bcitizen\b/gi, "").trim() || "Vijay";
};

function ProfilePage() {
  const { user } = useAuth();

  return (
    <AppShell title="Profile" subtitle="View your registered account details for CivicShield">
      <section className="page-section">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Name</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{getDisplayName(user)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Email</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{user?.email}</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default ProfilePage;
