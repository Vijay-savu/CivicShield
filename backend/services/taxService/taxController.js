const { DocumentRecord } = require("../../models/DocumentRecord");
const { logEvent } = require("../../utils/logEvent");
const circuitBreaker = require("./circuitBreaker");

const maskPan = (value) => {
  const normalized = String(value || "").trim().toUpperCase();

  if (!normalized) {
    return "Unavailable";
  }

  if (normalized.length <= 4) {
    return normalized;
  }

  return `${normalized.slice(0, 3)}***${normalized.slice(-3)}`;
};

const extractPan = (text) => {
  const match = String(text || "").toUpperCase().match(/[A-Z]{5}\d{4}[A-Z]/);
  return match ? match[0] : "";
};

const getTaxStatus = async (req, res, next) => {
  try {
    const simulateOverload = String(req.query.simulateOverload || "").toLowerCase() === "true";

    if (simulateOverload) {
      circuitBreaker.trip();
    } else {
      circuitBreaker.recordLoad();
    }

    if (circuitBreaker.isOpen()) {
      const breakerState = circuitBreaker.getState();

      await logEvent({
        action: "tax_service_degraded",
        user: req.user.email,
        userId: req.user.id,
        status: "warning",
        details: "Tax service temporarily unavailable due to overload protection.",
        ipAddress: req.ip || "unknown",
      });

      return res.status(503).json({
        message: "Tax service temporarily unavailable.",
        service: "Tax Service",
        status: "degraded",
        otherServicesAvailable: true,
        circuitBreaker: breakerState,
      });
    }

    const panDocument = await DocumentRecord.findOne({
      userId: req.user.id,
      documentType: "pan",
    }).sort({ createdAt: -1 });

    const maskedPan = maskPan(extractPan(panDocument?.ocrText));

    return res.status(200).json({
      service: "Tax Service",
      status: "active",
      taxProfile: {
        pan: maskedPan,
        filingStatus: panDocument ? "Ready" : "PAN document required",
        lastCheckedAt: new Date().toISOString(),
      },
      circuitBreaker: circuitBreaker.getState(),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTaxStatus,
};
