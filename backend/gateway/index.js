const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { serviceRegistry, createServiceContext, createServiceShield } = require("./serviceRegistry");
const { getGatewayMetricsSnapshot } = require("./serviceMetrics");
const verificationCircuitBreaker = require("../services/verificationService/circuitBreaker");
const taxCircuitBreaker = require("../services/taxService/circuitBreaker");
const { getServiceProtectionSnapshot } = require("./serviceProtection");

const router = express.Router();

const buildAvailabilitySnapshot = (metricsSnapshot) => {
  const services = serviceRegistry.map((service) => {
    const protection = getServiceProtectionSnapshot(service);
    const breakerState =
      service.id === "verification-service"
        ? verificationCircuitBreaker.getState()
        : service.id === "tax-service"
          ? taxCircuitBreaker.getState()
          : null;

    return {
      id: service.id,
      name: service.name,
      basePath: service.basePath,
      protection,
      breakerState,
      metrics: metricsSnapshot.find((entry) => entry.serviceId === service.id) || null,
    };
  });

  const degradedServices = services.filter(
    (service) => service.protection?.isolated || service.breakerState?.isOpen
  );
  const availableServices = services.filter(
    (service) => !service.protection?.isolated && !service.breakerState?.isOpen
  );
  const nodeBuckets = [
    { nodeId: "edge-node-1", zone: "north", services: [], status: "healthy" },
    { nodeId: "edge-node-2", zone: "south", services: [], status: "healthy" },
    { nodeId: "edge-node-3", zone: "west", services: [], status: "healthy" },
  ];

  services.forEach((service, index) => {
    const node = nodeBuckets[index % nodeBuckets.length];
    node.services.push(service.id);

    if (service.protection?.isolated || service.breakerState?.isOpen) {
      node.status = "degraded";
    }
  });

  return {
    status: degradedServices.length ? "degraded" : "healthy",
    strategy: "rate limiting + service isolation + circuit breaker + degraded mode",
    citizenImpact: degradedServices.length
      ? "Affected services return temporary unavailable while the rest of CivicShield continues."
      : "All core services are currently available.",
    degradedServices: degradedServices.map((service) => service.name),
    availableServices: availableServices.map((service) => service.name),
    loadBalancer: {
      mode: degradedServices.length ? "degraded-routing" : "balanced-routing",
      nodes: nodeBuckets,
    },
  };
};

router.get("/gateway/services", authenticateToken, (req, res) => {
  res.status(200).json({
    gateway: "CivicShield API Gateway",
    architecture: "microservice-oriented modular backend",
    services: serviceRegistry.map((service) => ({
      id: service.id,
      name: service.name,
      type: service.type,
      basePath: service.basePath,
      description: service.description,
      dependencies: service.dependencies,
      protection: getServiceProtectionSnapshot(service),
      public: service.public,
      status: service.status,
    })),
  });
});

router.get("/gateway/blueprint", authenticateToken, (req, res) => {
  res.status(200).json({
    flow: [
      "Citizen Portal",
      "API Gateway",
      "Auth Service",
      "Document Service",
      "Application Service",
      "Scheme Service",
      "Ledger Service",
      "Verification Service",
      "Tax Service",
      "Security Service",
      "MongoDB",
    ],
    note: "All protected service traffic is routed through the API gateway with zero-trust validation.",
  });
});

router.get("/gateway/status", authenticateToken, (req, res) => {
  const metricsSnapshot = getGatewayMetricsSnapshot(serviceRegistry);

  res.status(200).json({
    gateway: {
      name: "CivicShield API Gateway",
      status: "active",
      mode: "microservice-oriented modular backend",
    },
    availability: buildAvailabilitySnapshot(metricsSnapshot),
    services: serviceRegistry.map((service) => ({
      id: service.id,
      name: service.name,
      type: service.type,
      basePath: service.basePath,
      status: service.status,
      dependencies: service.dependencies,
      metrics: metricsSnapshot.find((entry) => entry.serviceId === service.id),
      protection: getServiceProtectionSnapshot(service),
      circuitBreaker:
        service.id === "verification-service"
          ? verificationCircuitBreaker.getState()
          : service.id === "tax-service"
            ? taxCircuitBreaker.getState()
            : null,
    })),
  });
});

router.get("/gateway/availability", authenticateToken, (req, res) => {
  const metricsSnapshot = getGatewayMetricsSnapshot(serviceRegistry);

  res.status(200).json({
    gateway: "CivicShield API Gateway",
    availability: buildAvailabilitySnapshot(metricsSnapshot),
  });
});

router.get("/gateway/security-posture", authenticateToken, (req, res) => {
  res.status(200).json({
    requestId: req.requestId,
    model: "defense-in-depth",
    layers: [
      {
        name: "Transport Security",
        status: "https-ready",
        evidence: "Security headers are applied at the API edge and HSTS is enabled when traffic arrives over HTTPS.",
      },
      {
        name: "Authentication",
        status: "active",
        evidence: "JWT bearer validation is enforced for protected API routes.",
      },
      {
        name: "Authorization",
        status: "active",
        evidence: "Role checks and record ownership checks restrict who can access which resources.",
      },
      {
        name: "Zero-Trust Request Binding",
        status: "active",
        evidence: "Protected requests are bound to device identity and request timestamp validation.",
      },
      {
        name: "Input Validation",
        status: "active",
        evidence: "Login, document upload, and scheme application payloads are validated before processing.",
      },
      {
        name: "Rate Limiting",
        status: "active",
        evidence: "Gateway-wide API throttling and service-specific rate limits reduce abuse and overload.",
      },
      {
        name: "Monitoring and Logging",
        status: "active",
        evidence: "Security events, uploads, mismatches, isolation, and tampering are logged for audit visibility.",
      },
      {
        name: "Tamper Detection",
        status: "active",
        evidence: "SHA-256 integrity checks and the tamper-evident ledger detect silent record or document changes.",
      },
    ],
  });
});

// The API gateway routes traffic to each backend service module.
for (const service of serviceRegistry) {
  router.use(service.basePath, createServiceContext(service), createServiceShield(service), service.routes);
}

module.exports = router;
