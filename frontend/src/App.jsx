import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ApplySubsidyPage from "./pages/ApplySubsidyPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentsPage from "./pages/DocumentsPage";
import LoginPage from "./pages/LoginPage";
import MyRecordsPage from "./pages/MyRecordsPage";
import ProfilePage from "./pages/ProfilePage";
import RecordViewerPage from "./pages/RecordViewerPage";
import SecurityAlertsPage from "./pages/SecurityAlertsPage";
import TaxServicesPage from "./pages/TaxServicesPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute roles={["citizen"]} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/records/:id" element={<RecordViewerPage />} />
        <Route path="/apply" element={<ApplySubsidyPage />} />
        <Route path="/my-applications" element={<MyRecordsPage />} />
        <Route path="/security-alerts" element={<SecurityAlertsPage />} />
        <Route path="/tax-services" element={<TaxServicesPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
