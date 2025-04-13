// server.js
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();

app.get('/render', async (req, res) => {
  const targetURL = req.query.url;
  if (!targetURL) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }
  
  try {
    // 환경 변수 GOOGLE_CHROME_BIN이나 GOOGLE_CHROME_SHIM가 있다면 사용,
    // 없다면 기본값으로 '/app/.apt/usr/bin/google-chrome-stable' 시도.
    const executablePath = process.env.GOOGLE_CHROME_BIN || process.env.GOOGLE_CHROME_SHIM || '/app/.apt/usr/bin/google-chrome-stable';
    console.log('Using executablePath:', executablePath);
    
    const browser = await puppeteer.launch({
      executablePath: executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(targetURL, { waitUntil: 'networkidle0', timeout: 30000 });
    const content = await page.content();
    await browser.close();
    res.send(content);
  } catch (error) {
    console.error("Error rendering the page:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Headless server is listening on port ${PORT}`);
});
