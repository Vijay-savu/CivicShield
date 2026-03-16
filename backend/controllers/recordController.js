const CitizenRecord = require("../models/CitizenRecord");
const { generateRecordHash } = require("../utils/hashRecord");
const { getRecordIntegrity } = require("../utils/recordIntegrity");
const { logEvent } = require("../utils/logEvent");

const isOwnerOrAdmin = (user, record) => {
  return user.role === "admin" || record.createdBy.toString() === user.id;
};

const buildRecordResponse = (record) => {
  const integrity = getRecordIntegrity(record);

  return {
    ...record.toObject(),
    integrityStatus: integrity.integrityStatus,
  };
};

const emitTamperLog = async (record, req) => {
  await logEvent({
    action: "tampering_detected",
    user: req.user.email,
    userId: req.user.id,
    status: "alert",
    details: `Tampering detected for certificate ${record.certificateId}`,
    ipAddress: req.ip || "unknown",
  });
};

const createRecord = async (req, res, next) => {
  try {
    const { name, dob, address, certificateId } = req.validatedBody;
    const createdAt = new Date();
    const hash = generateRecordHash({ name, dob, address, certificateId, createdAt });

    const record = await CitizenRecord.create({
      name,
      dob,
      address,
      certificateId,
      hash,
      createdBy: req.user.id,
      createdAt,
      updatedAt: createdAt,
    });

    await logEvent({
      action: "record_created",
      user: req.user.email,
      userId: req.user.id,
      status: "success",
      details: `Created certificate ${certificateId}`,
      ipAddress: req.ip || "unknown",
    });

    return res.status(201).json({
      message: "Citizen record created successfully",
      record: buildRecordResponse(record),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "certificateId already exists." });
    }

    return next(error);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? {} : { createdBy: req.user.id };
    const records = await CitizenRecord.find(query).sort({ createdAt: -1 });
    const mappedRecords = [];

    for (const record of records) {
      const enrichedRecord = buildRecordResponse(record);

      if (enrichedRecord.integrityStatus === "TAMPERING DETECTED") {
        await emitTamperLog(record, req);
      }

      mappedRecords.push(enrichedRecord);
    }

    return res.status(200).json({ records: mappedRecords });
  } catch (error) {
    return next(error);
  }
};

const getRecordById = async (req, res, next) => {
  try {
    const record = await CitizenRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    if (!isOwnerOrAdmin(req.user, record)) {
      return res.status(403).json({ message: "You cannot view this record." });
    }

    const responseRecord = buildRecordResponse(record);

    if (responseRecord.integrityStatus === "TAMPERING DETECTED") {
      await emitTamperLog(record, req);

      return res.status(200).json({
        integrityStatus: "TAMPERING DETECTED",
        record: responseRecord,
      });
    }

    return res.status(200).json({
      integrityStatus: "VERIFIED",
      record: responseRecord,
    });
  } catch (error) {
    return next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await CitizenRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    const integrity = getRecordIntegrity(record);

    if (integrity.isTampered) {
      await emitTamperLog(record, req);

      return res.status(200).json({
        integrityStatus: "TAMPERING DETECTED",
        record: buildRecordResponse(record),
      });
    }

    const updates = req.validatedBody;
    record.name = updates.name ?? record.name;
    record.dob = updates.dob ?? record.dob;
    record.address = updates.address ?? record.address;
    record.certificateId = updates.certificateId ?? record.certificateId;
    record.updatedBy = req.user.id;
    record.hash = generateRecordHash({
      name: record.name,
      dob: record.dob,
      address: record.address,
      certificateId: record.certificateId,
      createdAt: record.createdAt,
    });

    await record.save();

    await logEvent({
      action: "record_modified",
      user: req.user.email,
      userId: req.user.id,
      status: "success",
      details: `Updated certificate ${record.certificateId}`,
      ipAddress: req.ip || "unknown",
    });

    return res.status(200).json({
      message: "Record updated successfully",
      record: buildRecordResponse(record),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "certificateId already exists." });
    }

    return next(error);
  }
};

// This admin-only route intentionally skips hash refresh so the demo can show alerts.
const simulateTamper = async (req, res, next) => {
  try {
    const record = await CitizenRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    const updates = req.validatedBody;
    record.name = updates.name ?? record.name;
    record.dob = updates.dob ?? record.dob;
    record.address = updates.address ?? record.address;
    record.certificateId = updates.certificateId ?? record.certificateId;
    record.updatedBy = req.user.id;

    await record.save();

    await logEvent({
      action: "record_modified",
      user: req.user.email,
      userId: req.user.id,
      status: "warning",
      details: `Demo tamper simulation on certificate ${record.certificateId}`,
      ipAddress: req.ip || "unknown",
    });

    return res.status(200).json({
      message: "Tamper simulation applied",
      record: buildRecordResponse(record),
      integrityStatus: "TAMPERING DETECTED",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "certificateId already exists." });
    }

    return next(error);
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  simulateTamper,
};
