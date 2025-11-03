import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htmlContent = fs.readFileSync(join(__dirname, 'index.html'), 'utf8');

let adminKeys = new Set(['dehainciadamgottenyedim']);
let activeSessions = new Set();

const server = http.createServer(async (req, res) => {
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

  // Key oluşturma
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
            keys: Array.from(adminKeys)
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

  // KEY SİLME - YENİ EKLENDİ
  if (req.method === 'POST' && req.url === '/api/admin/delete-key') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { key, sessionId } = JSON.parse(body);
        if (activeSessions.has(sessionId)) {
          if (adminKeys.has(key)) {
            adminKeys.delete(key);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              success: true, 
              message: 'Key silindi: ' + key,
              keys: Array.from(adminKeys)
            }));
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'Key bulunamadı' }));
          }
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

  // Get keys
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

  // SORGULAMA API'LERİ - TÜMÜ AKTİF
  if (req.url.startsWith('/api/') && req.method === 'GET' && !req.url.includes('admin')) {
    const urlParts = req.url.split('?');
    const path = urlParts[0].replace('/api/', '');
    
    const searchParams = new URLSearchParams(urlParts[1] || '');
    const key = searchParams.get('key');
    
    if (!key || !adminKeys.has(key)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Geçersiz key' }));
      return;
    }

    try {
      searchParams.delete('key');
      const apiUrl = `https://api.kahin.org/kahinapi/${path}?${searchParams}`;
      
      const response = await fetch(apiUrl);
      let data = await response.json();
      
      data = deepFilterKahinData(data);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API hatası' }));
    }
    return;
  }

  // Ana sayfa
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 
      'Content-Type': 'text/html; charset=utf-8'
    });
    res.end(htmlContent);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Sayfa bulunamadı' }));
});

function deepFilterKahinData(data) {
  if (typeof data === 'string') {
    return data
      .replace(/kahin\.org/gi, '')
      .replace(/t\.me\/kahinorg/gi, '')
      .replace(/Hata durumunda Telegram kanalımızdan yetkililere ulaşabilirsiniz\.?/gi, '')
      .replace(/Telegram/gi, '')
      .replace(/@kahin/gi, '')
      .replace(/https:\/\/kahin\.org/gi, '')
      .replace(/"site":\s*"https:\/\/kahin\.org"/gi, '"site": ""')
      .replace(/"telegram":\s*"https:\/\/t\.me\/kahinorg"/gi, '"telegram": ""')
      .replace(/"mesaj":\s*"Hata durumunda Telegram kanalımızdan yetkililere ulaşabilirsiniz\."/gi, '"mesaj": ""')
      .trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(item => deepFilterKahinData(item)).filter(item => 
      item !== '' && item !== null && item !== undefined && !(typeof item === 'object' && Object.keys(item).length === 0)
    );
  }
  
  if (typeof data === 'object' && data !== null) {
    const filtered = {};
    for (const [key, value] of Object.entries(data)) {
      const filteredValue = deepFilterKahinData(value);
      if (filteredValue !== '' && filteredValue !== null && filteredValue !== undefined && 
          !(typeof filteredValue === 'object' && Object.keys(filteredValue).length === 0)) {
        filtered[key] = filteredValue;
      }
    }
    return Object.keys(filtered).length > 0 ? filtered : undefined;
  }
  
  return data;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('🚀 Server çalışıyor: http://localhost:' + PORT);
  console.log('🔑 Default Key: discorddan alcan keyi yarramin başı');
});
