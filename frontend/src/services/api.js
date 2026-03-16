import axios from "axios";

const STORAGE_KEY = "civicshield-session";
const DEVICE_KEY = "civicshield-device-id";

const createDeviceId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `device-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};

const readDeviceId = () => {
  const existingDeviceId = localStorage.getItem(DEVICE_KEY);

  if (existingDeviceId) {
    return existingDeviceId;
  }

  const nextDeviceId = createDeviceId();
  localStorage.setItem(DEVICE_KEY, nextDeviceId);
  return nextDeviceId;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

api.interceptors.request.use((config) => {
  config.headers["x-civicshield-device-id"] = readDeviceId();
  config.headers["x-civicshield-request-time"] = Date.now().toString();

  const rawSession = localStorage.getItem(STORAGE_KEY);

  if (!rawSession) {
    return config;
  }

  const session = JSON.parse(rawSession);

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

export default api;
