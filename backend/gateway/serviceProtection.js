const { logEvent } = require("../utils/logEvent");

const protectionState = {};

const ensureServiceState = (serviceId) => {
  if (!protectionState[serviceId]) {
    protectionState[serviceId] = {
      openUntil: 0,
      consecutiveErrors: 0,
      lastTripReason: "",
      ipWindows: new Map(),
    };
  }

  return protectionState[serviceId];
};

const cleanupExpiredRequests = (timestamps, windowMs, now) =>
  timestamps.filter((timestamp) => now - timestamp < windowMs);

const getServiceProtectionSnapshot = (service) => {
  const state = ensureServiceState(service.id);

  return {
    mode: "isolated-service-guard",
    openUntil: state.openUntil,
    isolated: state.openUntil > Date.now(),
    consecutiveErrors: state.consecutiveErrors,
    lastTripReason: state.lastTripReason || null,
    rateLimit: service.protection?.rateLimit || null,
    breaker: {
      maxConsecutiveErrors: service.protection?.maxConsecutiveErrors ?? null,
      cooldownMs: service.protection?.cooldownMs ?? null,
    },
  };
};

const tripServiceIsolation = async (service, reason, req) => {
  const state = ensureServiceState(service.id);
  const cooldownMs = service.protection?.cooldownMs || 30000;
  state.openUntil = Date.now() + cooldownMs;
  state.consecutiveErrors = 0;
  state.lastTripReason = reason;

  try {
    await logEvent({
      action: "service_isolated",
      user: req?.user?.email || "system",
      userId: req?.user?.id || null,
      status: "warning",
      details: `${service.name} isolated by gateway: ${reason}`,
      ipAddress: req?.ip || "unknown",
    });
  } catch (error) {
    // Best effort only. Gateway protection should not fail because logging failed.
  }
};

const createServiceShield = (service) => {
  return async (req, res, next) => {
    const state = ensureServiceState(service.id);
    const now = Date.now();
    const ipAddress = req.ip || "unknown";
    const rateLimit = service.protection?.rateLimit;

    if (state.openUntil > now) {
      return res.status(503).json({
        message: `${service.name} is temporarily isolated by the API gateway.`,
        service: service.name,
        status: "degraded",
        reason: state.lastTripReason || "Service protection active",
      });
    }

    if (rateLimit) {
      const currentWindow = cleanupExpiredRequests(state.ipWindows.get(ipAddress) || [], rateLimit.windowMs, now);
      currentWindow.push(now);
      state.ipWindows.set(ipAddress, currentWindow);

      if (currentWindow.length > rateLimit.maxRequests) {
        try {
          await logEvent({
            action: "service_rate_limited",
            user: req?.user?.email || "anonymous",
            userId: req?.user?.id || null,
            status: "blocked",
            details: `${service.name} rate limit exceeded from ${ipAddress}`,
            ipAddress,
          });
        } catch (error) {
          // Best effort only.
        }

        return res.status(429).json({
          message: `${service.name} rate limit exceeded. Try again later.`,
          service: service.name,
          status: "rate_limited",
        });
      }
    }

    res.on("finish", async () => {
      if (res.statusCode >= 500) {
        state.consecutiveErrors += 1;

        if (state.consecutiveErrors >= (service.protection?.maxConsecutiveErrors || 5)) {
          await tripServiceIsolation(service, "Consecutive service failures detected", req);
        }
        return;
      }

      if (res.statusCode < 500) {
        state.consecutiveErrors = 0;
      }
    });

    next();
  };
};

module.exports = {
  createServiceShield,
  getServiceProtectionSnapshot,
  tripServiceIsolation,
};
