import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest } from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "civicshield-session";

const readStoredSession = () => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  const login = async (credentials) => {
    setLoading(true);

    try {
      const data = await loginRequest(credentials);
      const nextSession = {
        token: data.token,
        user: data.user,
      };

      // Persist immediately so protected routes and API calls can use the token right away.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  const value = useMemo(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.token),
      loading,
      login,
      logout,
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
