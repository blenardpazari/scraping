// scrape.js
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(StealthPlugin());

async function scrapeWebsite(page, url) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const scrapeContent = await page.evaluate(() => {
      const descriptionContainer = document.querySelector(
        ".std.prod-description"
      );

      let overviewContent = "";
      if (descriptionContainer) {
        const paragraphElement = descriptionContainer.querySelector("p");

        if (paragraphElement) {
          // If there is a <p> element, get only the content of the first paragraph
          overviewContent = paragraphElement.textContent.trim();
        } else {
          // If there is no <p> element, get all content excluding <img> tags
          overviewContent = descriptionContainer.textContent.trim();
        }
      }

      const specificationTableContainer = document.querySelector(
        "#tab-specification table"
      );

      if (!specificationTableContainer) {
        return {
          overviewContent,
          tableContent: "",
          pdfUrl: "",
          specificationTableContent: "",
        };
      }

      const specificationRows = Array.from(
        specificationTableContainer.querySelectorAll("tr")
      ).filter((row) => {
        const colspanValue = row.querySelector("td")?.getAttribute("colspan");
        return !colspanValue || colspanValue !== "2";
      });

      const specificationTableContent = specificationRows
        .map((row) => row.outerHTML)
        .join("");

      const tableContainer = descriptionContainer.querySelector("table");
      const tableContent = tableContainer ? tableContainer.innerHTML : "";

      const pdfElements = document.querySelectorAll("ul.download-list");
      const lastPdfElement = pdfElements[pdfElements.length - 1];
      const pdfUrl = lastPdfElement
        ? "https://www.router-switch.com/pdf2html/" +
          (lastPdfElement.querySelector("a")?.getAttribute("href") || "")
        : "";

      return {
        overviewContent,
        tableContent,
        pdfUrl,
        specificationTableContent,
      };
    });

    if (!scrapeContent) {
      return null;
    }

    return scrapeContent;
  } catch (error) {
    return null;
  }
}

module.exports = { scrapeWebsite };
