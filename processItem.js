const puppeteer = require("puppeteer-extra");
const fs = require("fs");
const fetch = require("node-fetch");
const path = require("path");
const csvWriter = require("csv-writer").createObjectCsvWriter;
const BASED_FOLDER = 'PRODUCTS';

async function processItem(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  try {
    // Navigate to the provided URL
    await page.goto(url);
    await page.waitForSelector('.primary-images ol.js-swiper-wrapper img', { visible: true });

    // Scrape product name
    const productName = await page.evaluate(() => {
      return document.querySelector('.product-name.secondary-xxl').textContent.trim();
    });

    // Scrape product description
    const description = await page.evaluate(() => {
      return document.querySelector('.product-description').textContent.trim();
    });

    // Create main folder with product name
    const mainFolderName = BASED_FOLDER + '/' + productName.replace(/[/\\?%*:|"<>]/g, '-');
    fs.mkdirSync(mainFolderName, { recursive: true });

    // Create gallery folder
    const galleryFolderPath = `${mainFolderName}/gallery`;
    fs.mkdirSync(galleryFolderPath, { recursive: true });

    // Scrape product image gallery and download images
    const imageUrls = await page.evaluate(() => {
      const baseImageUrl = 'https://staging-eu01-angelini.demandware.net'; // Base URL of the website
      const imageElements = document.querySelectorAll('.primary-images ol.js-swiper-wrapper img');
      const imageUrls = [];
      imageElements.forEach(img => {
        // Check if the image has src attribute, otherwise use data-src
        const imageUrl = img.src || img.getAttribute('data-src');
        if (imageUrl) {
          // Convert relative URL to absolute URL
          const absoluteUrl = imageUrl.startsWith('/') ? baseImageUrl + imageUrl : imageUrl;
          imageUrls.push(absoluteUrl.trim());
        }
      });
      return imageUrls;
    });

    // Output the scraped image URLs
    console.log("Image URLs:", imageUrls);

    // Download images
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const imageName = `image_${i + 1}${path.extname(imageUrl)}`;
      const imagePath = `${galleryFolderPath}/${imageName}`;
      try {
        console.log(`Downloading image ${i + 1} from ${imageUrl}`);
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image ${i + 1}: ${response.status} ${response.statusText}`);
        }
        const buffer = await response.buffer();
        fs.writeFileSync(imagePath, buffer);
        console.log(`Image ${i + 1} downloaded successfully`);
      } catch (error) {
        console.error(`Error downloading image ${i + 1}: ${error.message}`);
      }
    }

    // Write product data to CSV file
    const csvWriterInstance = csvWriter({
      path: `${mainFolderName}/product.csv`,
      header: [
        { id: 'productName', title: 'Product Name' },
        { id: 'description', title: 'Description' },
      ]
    });
    const records = [];
    records.push({
      productName: productName,
      description: description,
    });
    await csvWriterInstance.writeRecords(records);

    console.log("Images downloaded and data saved successfully.");

    // items
    const data = await page.evaluate(() => {
      const items = [];
      const elements = document.querySelectorAll('.box-carousel-swiper .swiper-slide');
      elements.forEach((element, index) => {
        const imageElement = element.querySelector('img');
        const descriptionElement = element.querySelector('.box-editorial p');
        const imageUrl = imageElement.src;
        const description = descriptionElement.textContent.trim();
        items.push({
          imageUrl: imageUrl,
          description: description
        });
      });
      return items;
    });

    const csvPath = BASED_FOLDER + '/' + productName + '/items.csv';
    const csvWriterInstance2 = csvWriter({
      path: csvPath,
      header: [
        { id: 'imageUrl', title: 'Image URL' },
        { id: 'description', title: 'Description' }
      ],
    });

    const records2 = [];
    const basePath = BASED_FOLDER + '/' + productName + '/items/';
    fs.mkdirSync(basePath, { recursive: true });
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const imageName = path.basename(item.imageUrl);
      const imagePath = basePath + `${imageName}`;
      try {
        console.log(`Downloading image ${i + 1} from ${item.imageUrl}`);
        const response = await fetch(item.imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to download image ${i + 1}: ${response.status} ${response.statusText}`);
        }
        const buffer = await response.buffer();
        fs.writeFileSync(imagePath, buffer);
        console.log(`Image ${i + 1} downloaded successfully`);
        records2.push({
          imageUrl: imageName,
          description: item.description
        });
      } catch (error) {
        console.error(`Error downloading image ${i + 1}: ${error.message}`);
      }
    }
    await csvWriterInstance2.writeRecords(records2);

  } catch (mainError) {
    console.error("Error:", mainError.message);
  } finally {
    await browser.close();
  }
}

module.exports = { processItem };
