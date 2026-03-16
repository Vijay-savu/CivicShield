const CitizenRecord = require("../models/CitizenRecord");
const { generateRecordHash } = require("../utils/hashRecord");

const isInvalidObjectIdError = (error) => error.name === "CastError" && error.path === "_id";

const createRecord = async (req, res) => {
  try {
    const { name, dob, address, certificateId } = req.body;

    if (!name || !dob || !address || !certificateId) {
      return res.status(400).json({ message: "name, dob, address, and certificateId are required" });
    }

    const createdAt = new Date();
    const hash = generateRecordHash({ name, dob, address, certificateId, createdAt });

    const record = await CitizenRecord.create({
      name,
      dob,
      address,
      certificateId,
      hash,
      createdAt,
    });

    return res.status(201).json({
      message: "Citizen record created successfully",
      record,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "certificateId already exists" });
    }

    if (error.message === "Invalid date value") {
      return res.status(400).json({ message: "Invalid dob value" });
    }

    return res.status(500).json({ message: "Failed to create record", error: error.message });
  }
};

const getRecordById = async (req, res) => {
  try {
    const record = await CitizenRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    const recomputedHash = generateRecordHash({
      name: record.name,
      dob: record.dob,
      address: record.address,
      certificateId: record.certificateId,
      createdAt: record.createdAt,
    });

    if (recomputedHash !== record.hash) {
      return res.status(200).json({ alert: "Tampering Detected" });
    }

    return res.status(200).json({
      message: "Record fetched successfully",
      record,
      verified: true,
    });
  } catch (error) {
    if (isInvalidObjectIdError(error)) {
      return res.status(400).json({ message: "Invalid record id" });
    }

    if (error.message === "Invalid date value") {
      return res.status(400).json({ message: "Stored record contains an invalid date" });
    }

    return res.status(500).json({ message: "Failed to fetch record", error: error.message });
  }
};

const updateRecord = async (req, res) => {
  try {
    const record = await CitizenRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    const { name, dob, address, certificateId } = req.body;

    record.name = name ?? record.name;
    record.dob = dob ?? record.dob;
    record.address = address ?? record.address;
    record.certificateId = certificateId ?? record.certificateId;
    record.hash = generateRecordHash({
      name: record.name,
      dob: record.dob,
      address: record.address,
      certificateId: record.certificateId,
      createdAt: record.createdAt,
    });

    await record.save();

    return res.status(200).json({
      message: "Record updated successfully",
      record,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "certificateId already exists" });
    }

    if (isInvalidObjectIdError(error)) {
      return res.status(400).json({ message: "Invalid record id" });
    }

    if (error.message === "Invalid date value") {
      return res.status(400).json({ message: "Invalid dob value" });
    }

    return res.status(500).json({ message: "Failed to update record", error: error.message });
  }
};

module.exports = {
  createRecord,
  getRecordById,
  updateRecord,
};
