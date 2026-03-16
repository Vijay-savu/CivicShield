const authRoutes = require("../services/authService/routes");
const documentRoutes = require("../services/documentService/routes");
const recordRoutes = require("../services/recordService/routes");
const verificationRoutes = require("../services/verificationService/routes");
const monitoringRoutes = require("../services/monitoringService/routes");
const notificationRoutes = require("../services/notificationService/routes");

const createServiceContext = (service) => (req, res, next) => {
  req.serviceContext = service;
  res.setHeader("x-civicshield-gateway", "api-gateway");
  res.setHeader("x-civicshield-service", service.name);
  res.setHeader("x-civicshield-service-type", service.type);
  next();
};

const serviceRegistry = [
  {
    id: "auth-service",
    name: "Auth Service",
    type: "security",
    basePath: "/auth",
    description: "Handles identity, login, JWT issuance, and zero-trust session binding.",
    routes: authRoutes,
    public: true,
    status: "active",
  },
  {
    id: "document-service",
    name: "Document Service",
    type: "document",
    basePath: "/documents",
    description: "Stores, validates, hashes, and manages citizen government documents.",
    routes: documentRoutes,
    public: false,
    status: "active",
  },
  {
    id: "application-service",
    name: "Application Service",
    type: "workflow",
    basePath: "/records",
    description: "Creates and retrieves scheme applications backed by uploaded documents.",
    routes: recordRoutes,
    public: false,
    status: "active",
  },
  {
    id: "verification-service",
    name: "Verification Service",
    type: "verification",
    basePath: "/verification",
    description: "Runs eligibility checks, OCR-backed validation, and decision logic.",
    routes: verificationRoutes,
    public: false,
    status: "active",
  },
  {
    id: "monitoring-service",
    name: "Monitoring Service",
    type: "monitoring",
    basePath: "/logs",
    description: "Tracks monitoring logs, alerts, and operational events.",
    routes: monitoringRoutes,
    public: false,
    status: "active",
  },
  {
    id: "notification-service",
    name: "Notification Service",
    type: "notification",
    basePath: "/notifications",
    description: "Delivers citizen-facing security and verification notifications.",
    routes: notificationRoutes,
    public: false,
    status: "active",
  },
];

module.exports = {
  serviceRegistry,
  createServiceContext,
};
