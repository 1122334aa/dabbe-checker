import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htmlContent = fs.readFileSync(join(__dirname, 'index.html'), 'utf8');

// Key'leri dosyadan kaydet/oku
const KEYS_FILE = join(__dirname, 'keys.json');
const PREMIUM_KEYS_FILE = join(__dirname, 'premium_keys.json');
const ACCOUNTS_FILE = join(__dirname, 'accounts.txt');
const USED_ACCOUNTS_FILE = join(__dirname, 'used_accounts.txt');

function loadKeys() {
    try {
        if (fs.existsSync(KEYS_FILE)) {
            const data = fs.readFileSync(KEYS_FILE, 'utf8');
            return new Set(JSON.parse(data));
        }
    } catch (error) {
        console.error('Key dosyası okunamadı:', error);
    }
    return new Set(['dehainciadamgottenyedim']);
}

function saveKeys(keys) {
    try {
        fs.writeFileSync(KEYS_FILE, JSON.stringify(Array.from(keys)), 'utf8');
    } catch (error) {
        console.error('Key dosyası yazılamadı:', error);
    }
}

function loadPremiumKeys() {
    try {
        if (fs.existsSync(PREMIUM_KEYS_FILE)) {
            const data = fs.readFileSync(PREMIUM_KEYS_FILE, 'utf8');
            return new Set(JSON.parse(data));
        }
    } catch (error) {
        console.error('Premium key dosyası okunamadı:', error);
    }
    return new Set(['dehaincipremium']);
}

function savePremiumKeys(keys) {
    try {
        fs.writeFileSync(PREMIUM_KEYS_FILE, JSON.stringify(Array.from(keys)), 'utf8');
    } catch (error) {
        console.error('Premium key dosyası yazılamadı:', error);
    }
}

function loadUsedAccounts() {
    try {
        if (fs.existsSync(USED_ACCOUNTS_FILE)) {
            const data = fs.readFileSync(USED_ACCOUNTS_FILE, 'utf8');
            return new Set(data.split('\n').filter(line => line.trim()));
        }
    } catch (error) {
        console.error('Kullanılmış hesaplar dosyası okunamadı:', error);
    }
    return new Set();
}

function saveUsedAccounts(usedAccounts) {
    try {
        fs.writeFileSync(USED_ACCOUNTS_FILE, Array.from(usedAccounts).join('\n'), 'utf8');
    } catch (error) {
        console.error('Kullanılmış hesaplar dosyası yazılamadı:', error);
    }
}

function getRandomAccount() {
    try {
        if (!fs.existsSync(ACCOUNTS_FILE)) {
            // Örnek hesap oluştur
            const sampleAccount = `🌟✧ TABİİ ACCOUNT DETAYLARI ✧🌟
İndex: 1
━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: gulveragvc@gmail.com
🔑 Password: Gmail123.
👤 Ad Soyad: gülvera Güvenç 
⚧ Cinsiyet: Kız
🎂 Doğum Tarihi: 2004-05-05
📌 Hesap Durumu: Subscribed
━━━━━━━━━━━━━━━━━━━━━━━━
💎 Abonelik Bilgileri:
• Paket: Ücretsiz
• Durum: Active
• Bitiş Tarihi: 2025-11-29T01:20:36Z
━━━━━━━━━━━━━━━━━━━━━━━━`;
            fs.writeFileSync(ACCOUNTS_FILE, sampleAccount);
        }

        const data = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
        const accounts = data.split('━━━━━━━━━━━━━━━━━━━━━━━━\n━━━━━━━━━━━━━━━━━━━━━━━━').filter(acc => acc.trim());
        
        const usedAccounts = loadUsedAccounts();
        const availableAccounts = accounts.filter(account => {
            const emailMatch = account.match(/📧 Email:\s*(.+)/);
            return emailMatch && !usedAccounts.has(emailMatch[1].trim());
        });

        if (availableAccounts.length === 0) {
            return null;
        }

        const randomAccount = availableAccounts[Math.floor(Math.random() * availableAccounts.length)];
        
        // Kullanılan hesaplara ekle
        const emailMatch = randomAccount.match(/📧 Email:\s*(.+)/);
        if (emailMatch) {
            usedAccounts.add(emailMatch[1].trim());
            saveUsedAccounts(usedAccounts);
        }

        return parseAccount(randomAccount);
    } catch (error) {
        console.error('Hesap okuma hatası:', error);
        return null;
    }
}

function parseAccount(accountText) {
    const lines = accountText.split('\n').filter(line => line.trim());
    
    const account = {
        index: '',
        email: '',
        password: '',
        fullName: '',
        gender: '',
        birthDate: '',
        status: '',
        subscription: {
            package: '',
            status: '',
            endDate: ''
        }
    };

    lines.forEach(line => {
        if (line.includes('İndex:')) {
            account.index = line.split('İndex:')[1]?.trim() || '';
        } else if (line.includes('📧 Email:')) {
            account.email = line.split('📧 Email:')[1]?.trim() || '';
        } else if (line.includes('🔑 Password:')) {
            account.password = line.split('🔑 Password:')[1]?.trim() || '';
        } else if (line.includes('👤 Ad Soyad:')) {
            account.fullName = line.split('👤 Ad Soyad:')[1]?.trim() || '';
        } else if (line.includes('⚧ Cinsiyet:')) {
            account.gender = line.split('⚧ Cinsiyet:')[1]?.trim() || '';
        } else if (line.includes('🎂 Doğum Tarihi:')) {
            account.birthDate = line.split('🎂 Doğum Tarihi:')[1]?.trim() || '';
        } else if (line.includes('📌 Hesap Durumu:')) {
            account.status = line.split('📌 Hesap Durumu:')[1]?.trim() || '';
        } else if (line.includes('• Paket:')) {
            account.subscription.package = line.split('• Paket:')[1]?.trim() || '';
        } else if (line.includes('• Durum:')) {
            account.subscription.status = line.split('• Durum:')[1]?.trim() || '';
        } else if (line.includes('• Bitiş Tarihi:')) {
            account.subscription.endDate = line.split('• Bitiş Tarihi:')[1]?.trim() || '';
        }
    });

    return account;
}

let adminKeys = loadKeys();
let premiumKeys = loadPremiumKeys();
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
                    saveKeys(adminKeys);
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

    // Premium key oluşturma
    if (req.method === 'POST' && req.url === '/api/admin/create-premium-key') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { key, sessionId } = JSON.parse(body);
                if (activeSessions.has(sessionId)) {
                    premiumKeys.add(key);
                    savePremiumKeys(premiumKeys);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        message: 'Premium key oluşturuldu: ' + key,
                        premiumKeys: Array.from(premiumKeys)
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

    // Key silme
    if (req.method === 'POST' && req.url === '/api/admin/delete-key') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { key, sessionId } = JSON.parse(body);
                if (activeSessions.has(sessionId)) {
                    if (adminKeys.has(key)) {
                        adminKeys.delete(key);
                        saveKeys(adminKeys);
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

    // Premium key silme
    if (req.method === 'POST' && req.url === '/api/admin/delete-premium-key') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { key, sessionId } = JSON.parse(body);
                if (activeSessions.has(sessionId)) {
                    if (premiumKeys.has(key)) {
                        premiumKeys.delete(key);
                        savePremiumKeys(premiumKeys);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: true, 
                            message: 'Premium key silindi: ' + key,
                            premiumKeys: Array.from(premiumKeys)
                        }));
                    } else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Premium key bulunamadı' }));
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

    // Premium key doğrulama
    if (req.method === 'POST' && req.url === '/api/admin/verify-premium-key') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { key } = JSON.parse(body);
                
                if (premiumKeys.has(key)) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Premium key doğru' }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Geçersiz premium key' }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Geçersiz istek' }));
            }
        });
        return;
    }

    // Tabii hesap alma
    if (req.method === 'POST' && req.url === '/api/premium/tabii-account') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { premiumKey } = JSON.parse(body);
                
                if (!premiumKey || !premiumKeys.has(premiumKey)) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Geçersiz premium key' }));
                    return;
                }

                const account = getRandomAccount();
                if (account) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: true, 
                        message: 'Hesap başarıyla alındı',
                        account: account
                    }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        message: 'Mevcut hesap kalmadı' 
                    }));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Sunucu hatası' }));
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
                        keys: Array.from(adminKeys),
                        premiumKeys: Array.from(premiumKeys)
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

    // DISCORD ID SORGUSU
    if (req.url.startsWith('/api/discord') && req.method === 'GET') {
        const urlParts = req.url.split('?');
        const searchParams = new URLSearchParams(urlParts[1] || '');
        const key = searchParams.get('key');
        const id = searchParams.get('id');
        
        if (!key || !adminKeys.has(key)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Geçersiz key' }));
            return;
        }

        if (!id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Discord ID gerekli' }));
            return;
        }

        try {
            const apiUrl = `https://crawllchecker.xyz/crawll/crawlldc.php?id=${id}`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
            
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Discord API hatası' }));
        }
        return;
    }

    // SORGULAMA API'LERİ
    if (req.url.startsWith('/api/') && req.method === 'GET' && !req.url.includes('admin') && !req.url.includes('discord') && !req.url.includes('premium')) {
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
    console.log('🔑 Default Key: DABBE2024VIP');
    console.log('👑 Default Premium Key: PREMIUM2024VIP');
    console.log('💾 Key kayıt sistemi aktif');
    console.log('💎 Premium özellikler aktif');
});

