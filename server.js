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
    const browser = await puppeteer.launch({
      // heroku-buildpack-chrome-for-testing으로 설치된 Chrome 경로를 사용
      executablePath: process.env.GOOGLE_CHROME_BIN || '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // 네트워크가 idle 상태일 때까지 대기
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
