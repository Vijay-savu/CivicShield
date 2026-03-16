const GovernmentIncomeRecord = require("../models/GovernmentIncomeRecord");

const demoRecords = [
  {
    aadhaar: process.env.DEMO_CITIZEN_AADHAAR || "123456789012",
    annualIncome: Number(process.env.DEMO_CITIZEN_GOVT_INCOME || 250000),
    lastVerified: process.env.DEMO_CITIZEN_LAST_VERIFIED || "2026-03-01",
  },
  {
    aadhaar: process.env.DEMO_SECOND_AADHAAR || "987654321098",
    annualIncome: Number(process.env.DEMO_SECOND_GOVT_INCOME || 700000),
    lastVerified: process.env.DEMO_SECOND_LAST_VERIFIED || "2026-03-01",
  },
];

const ensureGovernmentIncomeRecords = async () => {
  for (const record of demoRecords) {
    const existingRecord = await GovernmentIncomeRecord.findOne({ aadhaar: record.aadhaar });

    if (existingRecord) {
      existingRecord.annualIncome = record.annualIncome;
      existingRecord.lastVerified = new Date(record.lastVerified);
      await existingRecord.save();
      continue;
    }

    await GovernmentIncomeRecord.create({
      aadhaar: record.aadhaar,
      annualIncome: record.annualIncome,
      lastVerified: new Date(record.lastVerified),
    });
  }
};

module.exports = {
  ensureGovernmentIncomeRecords,
};
