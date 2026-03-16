const authRoutes = require("../services/authService/routes");
const documentRoutes = require("../services/documentService/routes");
const recordRoutes = require("../services/recordService/routes");
const schemeRoutes = require("../services/schemeService/routes");
const verificationRoutes = require("../services/verificationService/routes");
const monitoringRoutes = require("../services/monitoringService/routes");
const notificationRoutes = require("../services/notificationService/routes");
const taxRoutes = require("../services/taxService/routes");
const ledgerRoutes = require("../services/ledgerService/routes");
const { recordServiceRequest } = require("./serviceMetrics");
const { createServiceShield } = require("./serviceProtection");

const createServiceContext = (service) => (req, res, next) => {
  const startedAt = Date.now();
  req.serviceContext = service;
  res.setHeader("x-civicshield-gateway", "api-gateway");
  res.setHeader("x-civicshield-service", service.name);
  res.setHeader("x-civicshield-service-type", service.type);

  res.on("finish", () => {
    recordServiceRequest(service.id, {
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
};

const serviceRegistry = [
  {
    id: "auth-service",
    name: "Auth Service",
    type: "security",
    basePath: "/auth",
    description: "Handles identity, login, JWT issuance, and zero-trust session binding.",
    dependencies: ["User Model", "JWT Secret"],
    routes: authRoutes,
    public: true,
    status: "active",
    protection: {
      rateLimit: { windowMs: 60 * 1000, maxRequests: 20 },
      maxConsecutiveErrors: 4,
      cooldownMs: 20 * 1000,
    },
  },
  {
    id: "document-service",
    name: "Document Service",
    type: "document",
    basePath: "/documents",
    description: "Stores, validates, hashes, and manages citizen government documents.",
    dependencies: ["MongoDB", "OCR Service", "Hashing Utility"],
    routes: documentRoutes,
    public: false,
    status: "active",
    protection: {
      rateLimit: { windowMs: 60 * 1000, maxRequests: 15 },
      maxConsecutiveErrors: 4,
      cooldownMs: 20 * 1000,
    },
  },
  {
    id: "application-service",
    name: "Application Service",
    type: "workflow",
    basePath: "/records",
    description: "Creates and retrieves scheme applications backed by uploaded documents.",
    dependencies: ["Document Service", "Verification Service", "MongoDB"],
    routes: recordRoutes,
    public: false,
    status: "active",
    protection: {
      rateLimit: { windowMs: 60 * 1000, maxRequests: 20 },
      maxConsecutiveErrors: 5,
      cooldownMs: 20 * 1000,
    },
  },
  {
    id: "scheme-service",
    name: "Scheme Service",
    type: "scheme",
    basePath: "/schemes",
    description: "Provides dynamic scheme configuration and rule management for government programs.",
    dependencies: ["MongoDB", "Scheme Store"],
    routes: schemeRoutes,
    public: false,
    status: "active",
    protection: {
      rateLimit: { windowMs: 60 * 1000, maxRequests: 20 },
      maxConsecutiveErrors: 4,
      cooldownMs: 20 * 1000,
    },
  },
  {
    id: "verification-service",
    name: "Verification Service",
    type: "verification",
    basePath: "/verification",
    description: "Runs eligibility checks, OCR-backed validation, and decision logic.",
    dependencies: ["Government Income Records", "Circuit Breaker", "MongoDB"],
    routes: verificationRoutes,
    public: false,
    status: "active",
    protection: {
      rateLimit: { windowMs: 20 * 1000, maxRequests: 8 },
      maxConsecutiveErrors: 3,
      cooldownMs: 30 * 1000,
    },
  },
  {
    id: "tax-service",
    name: "Tax Service",
    type: "tax",
    basePath: "/tax",
    description: "Provides PAN-linked tax status checks with service-level circuit breaker protection.",
    dependencies: ["PAN Document", "Circuit Breaker", "MongoDB"],
    routes: taxRoutes,
    public: false,
    status: "active",
    protection: {
      rateLimit: { windowMs: 20 * 1000, maxRequests: 8 },
      maxConsecutiveErrors: 3,
      cooldownMs: 30 * 1000,
    },
  },
  {
    id: "ledger-service",
    name: "Ledger Service",
    type: "integrity",
    basePath: "/ledger",
    description: "Maintains a tamper-evident hash chain for records and documents.",
    dependencies: ["Ledger Store", "Hashing Utility", "MongoDB"],
    routes: ledgerRoutes,
    public: false,
    status: "active",
    protection: {
      rateLimit: { windowMs: 60 * 1000, maxRequests: 20 },
      maxConsecutiveErrors: 4,
      cooldownMs: 20 * 1000,
    },
  },
  {
    id: "monitoring-service",
    name: "Security Service",
    type: "security-monitoring",
    basePath: "/logs",
    description: "Tracks monitoring logs, threat scores, alerts, and operational security events.",
    dependencies: ["Activity Logs", "MongoDB"],
    routes: monitoringRoutes,
    public: false,
    status: "active",
    protection: {
      rateLimit: { windowMs: 60 * 1000, maxRequests: 10 },
      maxConsecutiveErrors: 4,
      cooldownMs: 20 * 1000,
    },
  },
  {
    id: "notification-service",
    name: "Notification Service",
    type: "notification",
    basePath: "/notifications",
    description: "Delivers citizen-facing security and verification notifications.",
    dependencies: ["Notification Store", "MongoDB"],
    routes: notificationRoutes,
    public: false,
    status: "active",
    protection: {
      rateLimit: { windowMs: 60 * 1000, maxRequests: 20 },
      maxConsecutiveErrors: 4,
      cooldownMs: 20 * 1000,
    },
  },
];

module.exports = {
  serviceRegistry,
  createServiceContext,
  createServiceShield,
};
