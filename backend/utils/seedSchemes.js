const Scheme = require("../models/Scheme");
const { defaultSchemeDefinitions } = require("./defaultSchemes");

const ensureDefaultSchemes = async () => {
  for (const scheme of defaultSchemeDefinitions) {
    const existingScheme = await Scheme.findOne({ name: scheme.name });

    if (existingScheme) {
      existingScheme.description = scheme.description;
      existingScheme.eligibilityHint = scheme.eligibilityHint;
      existingScheme.requiredDocuments = scheme.requiredDocuments;
      existingScheme.ruleType = scheme.ruleType;
      existingScheme.incomeThreshold = scheme.incomeThreshold ?? null;
      existingScheme.minimumAge = scheme.minimumAge ?? null;
      existingScheme.inclusive = scheme.inclusive;
      existingScheme.approvalReason = scheme.approvalReason;
      existingScheme.rejectionReason = scheme.rejectionReason;
      existingScheme.active = true;
      await existingScheme.save();
      continue;
    }

    await Scheme.create(scheme);
  }
};

module.exports = {
  ensureDefaultSchemes,
};
