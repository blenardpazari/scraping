// download.js
const fs = require("fs");
const axios = require("axios");

async function downloadPDF(pdfUrl, localPath) {
  try {
    const response = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
      maxRedirects: 5,
    });
    fs.writeFileSync(localPath, response.data);
    console.log(`PDF downloaded successfully at ${localPath}`);
  } catch (error) {
    console.error("Error downloading PDF:", error.message);
  }
}

module.exports = { downloadPDF };
