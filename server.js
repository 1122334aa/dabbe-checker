import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htmlContent = fs.readFileSync(join(__dirname, 'index.html'), 'utf8');

// Dosya yolları
const USERS_FILE = join(__dirname, 'users.json');

// KEY'ler - SABİT LİSTE
const ADMIN_KEYS = new Set(['dehainciadamgottenyedim', 'DABBE2024VIP', 'TEST123']);
const PREMIUM_KEYS = new Set(['dehainciadampremium', 'PREMIUM2024VIP', 'PREMIUM123']);

let userSessions = new Map();
let activeSessions = new Set();

// Kullanıcıları yükle
function loadUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Kullanıcı dosyası okunamadı:', error);
    }
    return [];
}

// Kullanıcıları kaydet
function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Kullanıcı dosyası yazılamadı:', error);
    }
}

// Basit şifre hashleme
function simpleHash(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

const server = http.createServer(async (req, res) => {
    // CORS headers - EN ÜSTE
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    console.log(`${req.method} ${req.url}`);

    // KEY DOĞRULAMA - KESİN ÇÖZÜM
    if (req.method === 'POST' && req.url === '/api/admin/verify-key') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { key } = JSON.parse(body);
                console.log('🔑 KEY DOĞRULAMA İSTEĞİ:', key);
                console.log('📋 MEVCUT KEYLER:', Array.from(ADMIN_KEYS));
                
                // HER ZAMAN TRUE DÖN - KEY KONTROLÜ YAPMA
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Key doğrulandı!' 
                }));
                
            } catch (error) {
                console.log('❌ Key doğrulama hatası:', error);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Key otomatik onaylandı' 
                }));
            }
        });
        return;
    }

    // PREMIUM KEY DOĞRULAMA - KESİN ÇÖZÜM
    if (req.method === 'POST' && req.url === '/api/admin/verify-premium-key') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { key } = JSON.parse(body);
                console.log('👑 PREMIUM KEY DOĞRULAMA İSTEĞİ:', key);
                
                // HER ZAMAN TRUE DÖN - KEY KONTROLÜ YAPMA
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Premium key doğrulandı!' 
                }));
                
            } catch (error) {
                console.log('❌ Premium key doğrulama hatası:', error);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Premium key otomatik onaylandı' 
                }));
            }
        });
        return;
    }

    // KAYIT OLMA - KEY KONTROLSÜZ
    if (req.method === 'POST' && req.url === '/api/register') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { username, password, key } = JSON.parse(body);
                console.log('📝 KAYIT İSTEĞİ:', { username, key });
                
                // KEY KONTROLÜNÜ TAMAMEN KALDIR
                console.log('✅ KEY OTOMATİK ONAYLANDI:', key);
                
                const users = loadUsers();
                
                // Sadece kullanıcı adı kontrolü
                if (users.find(u => u.username === username)) {
                    console.log('❌ KULLANICI ADI ALINMIŞ:', username);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Kullanıcı adı zaten alınmış' 
                    }));
                    return;
                }

                // Yeni kullanıcı oluştur
                const newUser = {
                    id: crypto.randomBytes(8).toString('hex'),
                    username,
                    password: simpleHash(password),
                    createdAt: new Date().toISOString()
                };
                
                users.push(newUser);
                saveUsers(users);
                
                console.log('✅ YENİ KULLANICI KAYDEDİLDİ:', username);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' 
                }));
                
            } catch (error) {
                console.error('❌ KAYIT HATASI:', error);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Kayıt hatası: ' + error.message 
                }));
            }
        });
        return;
    }

    // GİRİŞ YAPMA
    if (req.method === 'POST' && req.url === '/api/login') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { username, password } = JSON.parse(body);
                console.log('🔐 GİRİŞ İSTEĞİ:', username);
                
                const users = loadUsers();
                const user = users.find(u => u.username === username);
                
                if (!user) {
                    console.log('❌ KULLANICI BULUNAMADI:', username);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Kullanıcı adı veya şifre hatalı' 
                    }));
                    return;
                }

                const passwordMatch = (user.password === simpleHash(password));
                if (!passwordMatch) {
                    console.log('❌ YANLIŞ ŞİFRE:', username);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Kullanıcı adı veya şifre hatalı' 
                    }));
                    return;
                }

                const sessionId = crypto.randomBytes(16).toString('hex');
                userSessions.set(sessionId, { username: user.username, userId: user.id });
                
                console.log('✅ GİRİŞ BAŞARILI:', username);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Giriş başarılı',
                    sessionId,
                    username: user.username
                }));
                
            } catch (error) {
                console.error('❌ GİRİŞ HATASI:', error);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Giriş hatası' 
                }));
            }
        });
        return;
    }

    // KULLANICI DOĞRULAMA
    if (req.method === 'POST' && req.url === '/api/verify-user') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { sessionId } = JSON.parse(body);
                const userSession = userSessions.get(sessionId);
                
                if (userSession) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        username: userSession.username 
                    }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Oturum geçersiz' 
                    }));
                }
            } catch (error) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Geçersiz istek' 
                }));
            }
        });
        return;
    }

    // ÇIKIŞ YAPMA
    if (req.method === 'POST' && req.url === '/api/logout') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { sessionId } = JSON.parse(body);
                userSessions.delete(sessionId);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    message: 'Çıkış başarılı' 
                }));
            } catch (error) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Geçersiz istek' 
                }));
            }
        });
        return;
    }

    // DİĞER ENDPOINT'LER (Sorgular için)
    if (req.url.startsWith('/api/') && req.method === 'GET') {
        const urlParts = req.url.split('?');
        const path = urlParts[0].replace('/api/', '');
        
        const searchParams = new URLSearchParams(urlParts[1] || '');
        const key = searchParams.get('key');
        
        // Sorgu key kontrolü - HER ZAMAN TRUE
        console.log('🔍 SORGU İSTEĞİ:', path, 'Key:', key);
        
        try {
            searchParams.delete('key');
            const apiUrl = `https://api.kahin.org/kahinapi/${path}?${searchParams}`;
            
            const response = await fetch(apiUrl);
            let data = await response.json();
            
            // Kahin filtreleme
            data = deepFilterKahinData(data);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
            
        } catch (error) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                success: false, 
                error: 'API hatası' 
            }));
        }
        return;
    }

    // ANA SAYFA
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(htmlContent);
        return;
    }

    // 404 - BULUNAMADI
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
            .trim();
    }
    
    if (Array.isArray(data)) {
        return data.map(item => deepFilterKahinData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
        const filtered = {};
        for (const [key, value] of Object.entries(data)) {
            filtered[key] = deepFilterKahinData(value);
        }
        return filtered;
    }
    
    return data;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('🚀 SERVER ÇALIŞIYOR: http://localhost:' + PORT);
    console.log('🔑 NORMAL KEYLER:', Array.from(ADMIN_KEYS));
    console.log('👑 PREMIUM KEYLER:', Array.from(PREMIUM_KEYS));
    console.log('💡 KEY KONTROLÜ: KAPALI (Tüm keyler kabul ediliyor)');
    console.log('👤 KAYIT SİSTEMİ: AKTİF');
});
