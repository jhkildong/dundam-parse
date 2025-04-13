// server.js
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');
app.use(cors());

app.get('/scrape', async (req, res) => {
  const targetURL = req.query.url;  // URL 파라미터로 크롤링할 페이지 주소를 받음
  if (!targetURL) {
    return res.status(400).json({ error: "Missing 'url' parameter" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(targetURL, { waitUntil: 'networkidle0', timeout: 30000 });

    // 페이지에서 원하는 데이터 추출 (예: 페이지 제목)
    const title = await page.title();

    await browser.close();
    res.json({ title });  // 결과를 JSON 형태로 클라이언트에 반환
  } catch (error) {
    console.error("Error scraping:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const path = require('path');

// React 앱 서빙
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});