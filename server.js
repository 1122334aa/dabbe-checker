import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htmlContent = fs.readFileSync(join(__dirname, 'index.html'), 'utf8');

// Admin sistemi
let adminKeys = new Set(['DABBE2024VIP']);
let adminSessions = new Map();

// Admin hash: babaproDEhatuzcu31:DaHİSekerc31
const ADMIN_HASH = crypto.createHash('md5').update('babaproDEhatuzcu31:DaHİSekerc31').digest('hex');

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS istekleri için
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Admin login
  if (req.method === 'POST' && req.url === '/api/admin/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        const inputHash = crypto.createHash('md5').update(username + ':' + password).digest('hex');
        
        console.log('Login attempt:', username, inputHash, ADMIN_HASH);
        
        if (inputHash === ADMIN_HASH) {
          const sessionId = crypto.randomBytes(16).toString('hex');
          adminSessions.set(sessionId, Date.now());
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, sessionId, message: 'Giriş başarılı' }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Hatalı kullanıcı adı veya şifre' }));
        }
      } catch (error) {
        console.error('Login error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Geçersiz istek' }));
      }
    });
    return;
  }

  // Key oluşturma
  if (req.method === 'POST' && req.url === '/api/admin/create-key') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { key, sessionId } = JSON.parse(body);
        if (adminSessions.has(sessionId)) {
          adminKeys.add(key);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Key oluşturuldu: ' + key }));
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

  // Key doğrulama
  if (req.method === 'POST' && req.url === '/api/admin/verify-key') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { key } = JSON.parse(body);
        console.log('Key verification:', key, adminKeys);
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

  // Session kontrol
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

  // Get keys
  if (req.method === 'POST' && req.url === '/api/admin/keys') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { sessionId } = JSON.parse(body);
        if (adminSessions.has(sessionId)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, keys: Array.from(adminKeys) }));
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

  // Sorgu API'leri - DÜZELTİLDİ
  if (req.url.startsWith('/api/') && req.method === 'GET' && !req.url.includes('admin')) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const path = url.pathname.replace('/api/', '');
      const searchParams = new URLSearchParams(url.search);
      
      // Key kontrolü - query parametresinden al
      const key = searchParams.get('key');
      console.log('API Request:', path, 'Key:', key);
      
      if (!key || !adminKeys.has(key)) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Geçersiz key', received: key }));
        return;
      }
      
      // API isteği - key'i çıkar
      searchParams.delete('key');
      const apiUrl = `https://api.kahin.org/kahinapi/${getApiEndpoint(path)}?${searchParams}`;
      
      console.log('Forwarding to:', apiUrl);
      const response = await fetch(apiUrl);
      const data = await response.json();
      
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
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Sayfa bulunamadı' }));
});

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
    return filtered;
  }
  return data;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`🔑 Default Key: DABBE2024VIP`);
  console.log(`🔐 Admin Hash: ${ADMIN_HASH}`);
});
