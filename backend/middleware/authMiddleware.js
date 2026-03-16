const jwt = require("jsonwebtoken");

const ZERO_TRUST_MAX_SKEW_MS = 5 * 60 * 1000;

const readZeroTrustHeaders = (req) => {
  const deviceId = String(req.headers["x-civicshield-device-id"] || "").trim();
  const requestTimeHeader = String(req.headers["x-civicshield-request-time"] || "").trim();
  const requestTime = Number(requestTimeHeader);

  return {
    deviceId,
    requestTime,
    requestTimeHeader,
  };
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const zeroTrust = readZeroTrustHeaders(req);

  if (!token) {
    return res.status(401).json({ message: "Access denied. Missing bearer token." });
  }

  if (!zeroTrust.deviceId || !zeroTrust.requestTimeHeader || Number.isNaN(zeroTrust.requestTime)) {
    return res.status(401).json({ message: "Zero-trust validation failed. Missing request context." });
  }

  if (Math.abs(Date.now() - zeroTrust.requestTime) > ZERO_TRUST_MAX_SKEW_MS) {
    return res.status(401).json({ message: "Zero-trust validation failed. Request timestamp expired." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.deviceId || decoded.deviceId !== zeroTrust.deviceId) {
      return res.status(401).json({ message: "Zero-trust validation failed. Session device mismatch." });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };
    req.zeroTrust = {
      deviceId: zeroTrust.deviceId,
      requestTime: zeroTrust.requestTime,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. Insufficient privileges." });
    }

    return next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
