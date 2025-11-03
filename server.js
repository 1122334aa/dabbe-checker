import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htmlContent = fs.readFileSync(join(__dirname, 'index.html'), 'utf8');

// Key sistemi
let adminKeys = new Set(['DABBE2024VIP']);
let activeSessions = new Set();

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  // Admin login
  if (req.method === 'POST' && req.url === '/api/admin/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        
        if (username === 'babaproDEhatuzcu31' && password === 'DaHİSekerc31') {
          const sessionId = crypto.randomBytes(16).toString('hex');
          activeSessions.add(sessionId);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, sessionId, message: 'Giriş başarılı' }));
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

  // Key oluşturma - DÜZELTİLDİ
  if (req.method === 'POST' && req.url === '/api/admin/create-key') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { key, sessionId } = JSON.parse(body);
        if (activeSessions.has(sessionId)) {
          adminKeys.add(key);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Key oluşturuldu: ' + key,
            keys: Array.from(adminKeys) // Key listesini de döndür
          }));
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

  // Key doğrulama - DÜZELTİLDİ
  if (req.method === 'POST' && req.url === '/api/admin/verify-key') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { key } = JSON.parse(body);
        console.log('Key verification request:', key);
        console.log('Available keys:', Array.from(adminKeys));
        
        if (adminKeys.has(key)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Key doğru' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Geçersiz key' }));
        }
      } catch (error) {
        console.error('Key verification error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Geçersiz istek' }));
      }
    });
    return;
  }

  // Session kontrol
  if (req.method === 'POST' && req.url === '/api/admin/check-session') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { sessionId } = JSON.parse(body);
        if (activeSessions.has(sessionId)) {
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

  // Get keys - DÜZELTİLDİ
  if (req.method === 'POST' && req.url === '/api/admin/keys') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { sessionId } = JSON.parse(body);
        if (activeSessions.has(sessionId)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            keys: Array.from(adminKeys) 
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Yetkisiz' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Geçersiz istek' }));
      }
    });
    return;
  }

  // SORGULAMA API'LERİ - KEY KONTROLÜ EKLENDİ
  if (req.url.startsWith('/api/') && req.method === 'GET' && !req.url.includes('admin')) {
    const urlParts = req.url.split('?');
    const path = urlParts[0].replace('/api/', '');
    
    // Key kontrolü
    const searchParams = new URLSearchParams(urlParts[1] || '');
    const key = searchParams.get('key');
    
    console.log('API Request - Path:', path, 'Key:', key);
    console.log('Available keys:', Array.from(adminKeys));
    
    if (!key || !adminKeys.has(key)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Geçersiz key', received: key }));
      return;
    }

    try {
      // Key'i kaldır ve API'ye gönder
      searchParams.delete('key');
      const apiUrl = `https://api.kahin.org/kahinapi/${path}?${searchParams}`;
      
      console.log('Forwarding to:', apiUrl);
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      // Filtreleme
      const filteredData = filterKahinData(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(filteredData));
      
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API hatası: ' + error.message }));
    }
    return;
  }

  // Ana sayfa
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    res.end(htmlContent);
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Sayfa bulunamadı' }));
});

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
          .trim();
        
        if (filteredValue === '' || filteredValue === '""') continue;
        filtered[key] = filteredValue;
      } else {
        filtered[key] = value;
      }
    }
    return Object.keys(filtered).length > 0 ? filtered : data;
  }
  return data;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('🚀 Server çalışıyor: http://localhost:' + PORT);
  console.log('🔑 Default Key: DABBE2024VIP');
  console.log('👤 Admin: babaproDEhatuzcu31');
  console.log('🔐 Şifre: DaHİSekerc31');
  console.log('📋 Mevcut Keyler:', Array.from(adminKeys));
});
