const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { serviceRegistry, createServiceContext } = require("./serviceRegistry");

const router = express.Router();

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
      "Verification Service",
      "Monitoring Service",
      "MongoDB",
    ],
    note: "All protected service traffic is routed through the API gateway with zero-trust validation.",
  });
});

// The API gateway routes traffic to each backend service module.
for (const service of serviceRegistry) {
  router.use(service.basePath, createServiceContext(service), service.routes);
}

module.exports = router;
