const crypto = require("crypto");
const rateLimit = require("express-rate-limit");

const createRequestId = () => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const requestShield = (req, res, next) => {
  const requestId = createRequestId();
  req.requestId = requestId;

  res.setHeader("x-civicshield-request-id", requestId);
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("x-frame-options", "DENY");
  res.setHeader("referrer-policy", "no-referrer");
  res.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("cross-origin-resource-policy", "same-origin");
  res.setHeader("cross-origin-opener-policy", "same-origin");

  if (req.path.startsWith("/api")) {
    res.setHeader("cache-control", "no-store");
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const isSecure = req.secure || forwardedProto === "https";

  if (isSecure) {
    res.setHeader("strict-transport-security", "max-age=31536000; includeSubDomains");
  }

  next();
};

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again shortly.",
    layer: "API Gateway Rate Limiter",
  },
});

module.exports = {
  requestShield,
  apiRateLimiter,
};
