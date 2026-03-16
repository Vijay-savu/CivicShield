const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const attempts = new Map();

const getKey = (email, ipAddress) => `${email}|${ipAddress}`;

const getEntry = (key) => {
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing) {
    return { count: 0, blockedUntil: 0 };
  }

  if (existing.blockedUntil && existing.blockedUntil < now) {
    attempts.delete(key);
    return { count: 0, blockedUntil: 0 };
  }

  return existing;
};

const isBlocked = (email, ipAddress) => {
  const entry = getEntry(getKey(email, ipAddress));
  return entry.blockedUntil && entry.blockedUntil > Date.now();
};

const registerFailure = (email, ipAddress) => {
  const key = getKey(email, ipAddress);
  const current = getEntry(key);
  const nextCount = current.count + 1;

  const blocked = nextCount > MAX_FAILED_ATTEMPTS;

  attempts.set(key, {
    count: nextCount,
    blockedUntil: blocked ? Date.now() + WINDOW_MS : 0,
  });

  return blocked;
};

const resetAttempts = (email, ipAddress) => {
  attempts.delete(getKey(email, ipAddress));
};

module.exports = {
  isBlocked,
  registerFailure,
  resetAttempts,
};
