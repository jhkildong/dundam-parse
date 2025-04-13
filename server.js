// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

// CORS 설정 (테스트용)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
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
    // 환경 변수 또는 기본 경로에서 Chrome 실행 파일 경로 결정
    const executablePath = process.env.GOOGLE_CHROME_BIN || '/app/.apt/usr/bin/google-chrome-stable';
    console.log('Using executablePath:', executablePath);
    
    const browser = await puppeteer.launch({
      executablePath: executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    // 페이지 로딩 타임아웃을 조금 늘려보세요.
    await page.goto(targetURL, { waitUntil: 'networkidle0', timeout: 45000 });
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
