const normalizeCurrencyValue = (value) => Number(String(value || "").replace(/[^\d]/g, ""));

const incomePatterns = [
  /annual\s+income\s*[:\-]?\s*(?:rs\.?|inr|₹)?\s*([\d,]+)/i,
  /income\s*[:\-]?\s*(?:rs\.?|inr|₹)?\s*([\d,]+)/i,
];

const extractIncomeFromText = (text) => {
  const source = String(text || "");

  for (const pattern of incomePatterns) {
    const match = source.match(pattern);

    if (match?.[1]) {
      const value = normalizeCurrencyValue(match[1]);

      if (!Number.isNaN(value) && value > 0) {
        return value;
      }
    }
  }

  return null;
};

module.exports = {
  extractIncomeFromText,
};
