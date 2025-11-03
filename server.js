import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// HTML dosyasını oku
const htmlContent = fs.readFileSync(join(__dirname, 'index.html'), 'utf8');

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // API istekleri
  if (req.url.startsWith('/api/') && req.method === 'GET') {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const path = url.pathname.replace('/api/', '');
      const params = Object.fromEntries(url.searchParams);
      
      // API endpoint'ine göre istek yap
      const apiUrl = `https://api.kahin.org/kahinapi/${getApiEndpoint(path)}?${new URLSearchParams(params)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      // Kahin verilerini filtrele
      const filteredData = filterKahinData(data);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(filteredData));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API hatası' }));
    }
    return;
  }

  // Ana sayfa
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
    return;
  }

  // 404 sayfası
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>404 - Sayfa Bulunamadı</title>
        <style>
            body { background: #000; color: #f00; text-align: center; padding: 50px; }
            h1 { font-size: 4em; }
        </style>
    </head>
    <body>
        <h1>404</h1>
        <p>Sayfa bulunamadı</p>
        <a href="/" style="color: #0f0;">Ana Sayfaya Dön</a>
    </body>
    </html>
  `);
});

// API endpoint mapping
function getApiEndpoint(path) {
  const endpoints = {
    'tc': 'tc',
    'tcpro': 'tcpro',
    'hayathikayesi': 'hayathikayesi.php',
    'adsoyad': 'adsoyad',
    'adsoyadpro': 'adsoyadpro',
    'tapu': 'tapu',
    'isyeri': 'isyeri',
    'vergino': 'vergino',
    'yas': 'yas',
    'tcgsm': 'tcgsm',
    'gsmtc': 'gsmtc',
    'adres': 'adres.php',
    'hane': 'hane',
    'apartman': 'apartman',
    'adaparsel': 'adaparsel',
    'adililce': 'adililce.php',
    'aile': 'aile',
    'ailepro': 'ailepro',
    'es': 'es',
    'sulale': 'sulale',
    'ip': 'ip',
    'dns': 'dns',
    'whois': 'whois',
    'subdomain': 'subdomain.php',
    'leak': 'leak.php',
    'telegram': 'telegram.php',
    'gelismisip': 'ip'
  };
  
  return endpoints[path] || path;
}

// Kahin verilerini filtreleme
function filterKahinData(data) {
  if (typeof data === 'object' && data !== null) {
    const filtered = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        filtered[key] = value
          .replace(/kahin\.org/gi, '')
          .replace(/t\.me\/kahinorg/gi, '')
          .replace(/Hata durumunda Telegram kanalımızdan yetkililere ulaşabilirsiniz\.?/gi, '')
          .replace(/Telegram/gi, '')
          .replace(/@kahin/gi, '')
          .trim();
      } else {
        filtered[key] = value;
      }
    }
    return filtered;
  }
  return data;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});