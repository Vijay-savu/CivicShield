import DashboardPage from "./DashboardPage";
import MonitoringPage from "./MonitoringPage";
import OfficerVerificationPage from "./OfficerVerificationPage";
import { useAuth } from "../context/AuthContext";

function RoleDashboardPage() {
  const { user } = useAuth();

  if (user?.role === "officer") {
    return <OfficerVerificationPage />;
  }

  if (user?.role === "admin") {
    return <MonitoringPage />;
  }

  return <DashboardPage />;
}

export default RoleDashboardPage;
