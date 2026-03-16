const ApplicationRecord = require("../../models/ApplicationRecord");
const { DocumentRecord } = require("../../models/DocumentRecord");
const { getLedgerForEntity } = require("../../utils/tamperLedger");

const getRecordLedger = async (req, res, next) => {
  try {
    const record = await ApplicationRecord.findById(req.params.id).select("createdBy");

    if (!record) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (record.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "You cannot access this ledger." });
    }

    const { entries, chain } = await getLedgerForEntity("application_record", record._id);

    return res.status(200).json({
      entityType: "application_record",
      entityId: record._id,
      chainValid: chain.chainValid,
      brokenAt: chain.brokenAt,
      entries: entries.map((entry) => ({
        id: entry._id,
        action: entry.action,
        actorEmail: entry.actorEmail,
        payloadHash: entry.payloadHash,
        previousHash: entry.previousHash,
        ledgerHash: entry.ledgerHash,
        createdAt: entry.createdAt,
        metadata: entry.metadata,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const getDocumentLedger = async (req, res, next) => {
  try {
    const document = await DocumentRecord.findOne({ _id: req.params.id, userId: req.user.id }).select("_id");

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    const { entries, chain } = await getLedgerForEntity("document_record", document._id);

    return res.status(200).json({
      entityType: "document_record",
      entityId: document._id,
      chainValid: chain.chainValid,
      brokenAt: chain.brokenAt,
      entries: entries.map((entry) => ({
        id: entry._id,
        action: entry.action,
        actorEmail: entry.actorEmail,
        payloadHash: entry.payloadHash,
        previousHash: entry.previousHash,
        ledgerHash: entry.ledgerHash,
        createdAt: entry.createdAt,
        metadata: entry.metadata,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getRecordLedger,
  getDocumentLedger,
};
