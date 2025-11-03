import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// HTML dosyasını oku
const htmlContent = fs.readFileSync(join(__dirname, 'index.html'), 'utf8');

// Admin key storage
let adminKeys = new Set(['DABBE2024VIP']); // Default key
let adminSessions = new Set();

// Admin credentials (hash'lenmiş)
const ADMIN_HASH = 'd6f0b36f38c84f49f9c38b34f7d0c3a9'; // babaproDEhatuzcu31:DaHİSekerc31

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Admin API endpoints
  if (req.method === 'POST' && req.url === '/api/admin/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { username, password, sessionId } = JSON.parse(body);
        const inputHash = require('crypto').createHash('md5').update(username + ':' + password).digest('hex');
        
        if (inputHash === ADMIN_HASH) {
          adminSessions.add(sessionId);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Giriş başarılı' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Hatalı kullanıcı adı veya şifre' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Geçersiz istek' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/admin/create-key') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { key, sessionId } = JSON.parse(body);
        if (adminSessions.has(sessionId)) {
          adminKeys.add(key);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Key oluşturuldu', key: key }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Yetkisiz erişim' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Geçersiz istek' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/admin/verify-key') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { key } = JSON.parse(body);
        if (adminKeys.has(key)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Key doğru' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Geçersiz key' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Geçersiz istek' }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/admin/check-session') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { sessionId } = JSON.parse(body);
        if (adminSessions.has(sessionId)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Session aktif' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Session geçersiz' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Geçersiz istek' }));
      }
    });
    return;
  }

  // API istekleri
  if (req.url.startsWith('/api/') && req.method === 'GET' && !req.url.includes('admin')) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const path = url.pathname.replace('/api/', '');
      const params = Object.fromEntries(url.searchParams);
      
      // Önce key kontrolü
      const key = url.searchParams.get('key');
      if (!key || !adminKeys.has(key)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Geçersiz key' }));
        return;
      }
      
      // API endpoint'ine göre istek yap
      const apiParams = new URLSearchParams(params);
      apiParams.delete('key'); // Key'i API'ye gönderme
      
      const apiUrl = `https://api.kahin.org/kahinapi/${getApiEndpoint(path)}?${apiParams}`;
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
            body { background: #0a0a0a; color: #ff0000; text-align: center; padding: 50px; }
            h1 { font-size: 4em; }
        </style>
    </head>
    <body>
        <h1>404</h1>
        <p>Sayfa bulunamadı</p>
        <a href="/" style="color: #00ff00;">Ana Sayfaya Dön</a>
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
        let filteredValue = value
          .replace(/kahin\.org/gi, '')
          .replace(/t\.me\/kahinorg/gi, '')
          .replace(/Hata durumunda Telegram kanalımızdan yetkililere ulaşabilirsiniz\.?/gi, '')
          .replace(/Telegram/gi, '')
          .replace(/@kahin/gi, '')
          .replace(/https:\/\/kahin\.org/gi, '')
          .replace(/site":\s*"https:\/\/kahin\.org"/gi, '"site": ""')
          .replace(/telegram":\s*"https:\/\/t\.me\/kahinorg"/gi, '"telegram": ""')
          .replace(/mesaj":\s*"Hata durumunda Telegram kanalımızdan yetkililere ulaşabilirsiniz\."/gi, '"mesaj": ""')
          .trim();
        
        if (filteredValue === '' || filteredValue === '""') {
          continue;
        }
        
        filtered[key] = filteredValue;
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
  console.log(`Default Key: DABBE2024VIP`);
});
