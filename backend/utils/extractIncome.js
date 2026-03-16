const normalizeCurrencyValue = (value) => Number(String(value || "").replace(/[^\d]/g, ""));

const normalizeSource = (text) =>
  String(text || "")
    .replace(/[â‚¹₹]/g, " Rs. ")
    .replace(/\s+/g, " ")
    .trim();

const incomePatterns = [
  /annual\s+income\s*[:\-]?\s*(?:rs\.?|inr)?\s*([\d,]+)/i,
  /income\s*[:\-]?\s*(?:rs\.?|inr)?\s*([\d,]+)/i,
  /annual\s+income[\s\S]{0,140}?(?:rs\.?|inr)\s*([\d,]+)/i,
  /income\s+from\s+all\s+sources[\s\S]{0,140}?(?:rs\.?|inr)\s*([\d,]+)/i,
  /this\s+is\s+to\s+certify[\s\S]{0,220}?(?:rs\.?|inr)\s*([\d,]+)/i,
  /revenue\s+department[\s\S]{0,240}?(?:rs\.?|inr)\s*([\d,]+)/i,
  /\brs\.?\s*([\d,]{4,})\s*(?:\(|rupees|only|\b)/i,
];

const extractIncomeFromText = (text) => {
  const source = normalizeSource(text);

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
