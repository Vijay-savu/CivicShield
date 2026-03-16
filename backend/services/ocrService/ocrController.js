const fs = require("fs/promises");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

const scanDocumentText = async (file) => {
  const buffer = await fs.readFile(file.path);

  if (file.mimetype === "application/pdf") {
    const parsed = await pdfParse(buffer);
    const extractedText = parsed.text?.trim();

    if (extractedText) {
      return {
        text: extractedText,
        engine: "pdf-parse",
      };
    }
  }

  const result = await Tesseract.recognize(file.path, "eng", {
    tessedit_pageseg_mode: Tesseract.PSM.AUTO,
    preserve_interword_spaces: "1",
  });

  return {
    text: result.data?.text?.trim() || "",
    engine: "tesseract.js",
  };
};

const scanIncomeCertificate = async (file) => scanDocumentText(file);

module.exports = {
  scanDocumentText,
  scanIncomeCertificate,
};
