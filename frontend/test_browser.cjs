const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  try {
    console.log('Navigating...');
    await page.goto('http://localhost:5173/problems/6a8193267ce7ebf6ddd2c460', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('Done.');
  } catch (e) {
    console.error('Error navigating:', e);
  } finally {
    await browser.close();
  }
})();
