// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

// 모든 요청에 대해 CORS 허용
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");  // 모든 도메인 허용, 필요에 따라 도메인을 제한할 수 있습니다.
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/render', async (req, res) => {
  const targetURL = req.query.url;
  if (!targetURL) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }
  
  try {
    // 환경 변수나 기본 경로를 통한 Chrome 실행 파일 경로 설정
    const executablePath = process.env.GOOGLE_CHROME_BIN || process.env.GOOGLE_CHROME_SHIM || '/app/.apt/usr/bin/google-chrome';
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
