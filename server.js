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
    // Puppeteer 실행 (보안, 리소스 제한에 따라 no-sandbox 옵션 적용 권장)
    const browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // 페이지 이동 시 네트워크가 idle 상태일 때까지 대기
    await page.goto(targetURL, { waitUntil: 'networkidle0', timeout: 30000 });
    const content = await page.content();
    await browser.close();
    res.send(content);
  } catch (error) {
    console.error("Error while rendering:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Headless server is listening on port ${PORT}`);
});
