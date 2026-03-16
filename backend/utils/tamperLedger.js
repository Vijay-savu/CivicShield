const crypto = require("crypto");
const LedgerEntry = require("../models/LedgerEntry");

const stableSerialize = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(",")}}`;
  }

  return JSON.stringify(value);
};

const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

const appendLedgerEntry = async ({
  entityType,
  entityId = null,
  action,
  actorEmail,
  actorId = null,
  payload = {},
  metadata = {},
}) => {
  const previousEntry = await LedgerEntry.findOne({ entityType, entityId }).sort({ createdAt: -1, _id: -1 });
  const previousHash = previousEntry?.ledgerHash || "GENESIS";
  const recordedAt = new Date().toISOString();
  const payloadHash = sha256(stableSerialize(payload));
  const ledgerHash = sha256(
    stableSerialize({
      entityType,
      entityId: entityId ? String(entityId) : null,
      action,
      actorEmail,
      actorId: actorId ? String(actorId) : null,
      payloadHash,
      previousHash,
      recordedAt,
    })
  );

  return LedgerEntry.create({
    entityType,
    entityId,
    action,
    actorEmail,
    actorId,
    payloadHash,
    previousHash,
    ledgerHash,
    metadata: {
      ...metadata,
      recordedAt,
    },
  });
};

const verifyLedgerChain = (entries) => {
  let previousHash = "GENESIS";

  for (const entry of entries) {
    if (entry.previousHash !== previousHash) {
      return {
        chainValid: false,
        brokenAt: entry._id,
      };
    }

    const expectedHash = sha256(
      stableSerialize({
        entityType: entry.entityType,
        entityId: entry.entityId ? String(entry.entityId) : null,
        action: entry.action,
        actorEmail: entry.actorEmail,
        actorId: entry.actorId ? String(entry.actorId) : null,
        payloadHash: entry.payloadHash,
        previousHash: entry.previousHash,
        recordedAt: entry.metadata?.recordedAt || null,
      })
    );

    if (expectedHash !== entry.ledgerHash) {
      return {
        chainValid: false,
        brokenAt: entry._id,
      };
    }

    previousHash = entry.ledgerHash;
  }

  return {
    chainValid: true,
    brokenAt: null,
  };
};

const getLedgerForEntity = async (entityType, entityId, limit = 25) => {
  const entries = await LedgerEntry.find({ entityType, entityId }).sort({ createdAt: 1, _id: 1 }).limit(limit);
  const chain = verifyLedgerChain(entries);

  return {
    entries,
    chain,
  };
};

module.exports = {
  appendLedgerEntry,
  getLedgerForEntity,
  verifyLedgerChain,
};
