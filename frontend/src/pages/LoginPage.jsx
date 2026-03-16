import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const demoProfile = {
  email: "citizen@civicshield.local",
  password: "Citizen@123",
};

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, logout } = useAuth();
  const [form, setForm] = useState(demoProfile);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const user = await login(form);
      if (user.role !== "citizen") {
        logout();
        setError("This portal is available only for citizen self-service access.");
        return;
      }

      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
          <div className="bg-[#1E3A8A] px-6 py-3 text-xs font-medium uppercase tracking-[0.32em] text-blue-50">
            CivicShield Secure Government Services
          </div>
          <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-[#1E3A8A]">
                CS
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">CivicShield</h1>
                <p className="text-sm text-slate-600">Government Service Portal</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mt-10 flex min-h-[calc(100vh-220px)] items-center justify-center">
          <section className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-[#1E3A8A]">
                CS
              </div>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Portal Sign In</h2>
              <p className="mt-2 text-sm text-slate-600">Secure Government Digital Service Portal</p>
            </div>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Email Address
                <input
                  className="field-input"
                  type="email"
                  placeholder="Enter registered email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Password
                <input
                  className="field-input"
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  required
                />
              </label>

              {error ? <div className="status-danger px-4 py-3 text-sm">{error}</div> : null}

              <button className="primary-button mt-2" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
              Citizen: citizen@civicshield.local / Citizen@123
            </div>

          </section>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
