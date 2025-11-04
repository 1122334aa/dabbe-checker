const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Veritabanı dosyaları
const ACCOUNTS_FILE = path.join(__dirname, 'tabii_cleaned.txt');
const USED_ACCOUNTS_FILE = path.join(__dirname, 'data', 'used_accounts.json');
const PREMIUM_KEYS_FILE = path.join(__dirname, 'data', 'premium_keys.json');
const SYSTEM_KEYS_FILE = path.join(__dirname, 'data', 'system_keys.json');

// Klasörleri oluştur
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Premium keys dosyasını oluştur (eğer yoksa)
if (!fs.existsSync(PREMIUM_KEYS_FILE)) {
    const defaultPremiumKeys = [
        { key: "PREMIUM2025", used: false },
        { key: "TABII123", used: false },
        { key: "VIPACCESS", used: false },
        { key: "GOLD2025", used: false },
        { key: "DIAMOND123", used: false }
    ];
    fs.writeFileSync(PREMIUM_KEYS_FILE, JSON.stringify(defaultPremiumKeys, null, 2));
}

// System keys dosyasını oluştur (eğer yoksa)
if (!fs.existsSync(SYSTEM_KEYS_FILE)) {
    const defaultSystemKeys = [
        { key: "DABBE2024VIP", used: false },
        { key: "DEHADAM2024", used: false },
        { key: "BABAPRO31", used: false }
    ];
    fs.writeFileSync(SYSTEM_KEYS_FILE, JSON.stringify(defaultSystemKeys, null, 2));
}

// Kullanılmış hesaplar dosyasını oluştur (eğer yoksa)
if (!fs.existsSync(USED_ACCOUNTS_FILE)) {
    fs.writeFileSync(USED_ACCOUNTS_FILE, JSON.stringify([]));
}

// Hesapları parse etme fonksiyonu
function parseAccountsFromTxt(content) {
    const accounts = [];
    const accountBlocks = content.split('🌟✧ TABİİ ACCOUNT DETAYLARI ✧🌟').filter(block => block.trim());
    
    for (const block of accountBlocks) {
        const lines = block.split('\n').filter(line => line.trim());
        
        const account = {
            index: null,
            email: null,
            password: null,
            name: null,
            gender: null,
            birthDate: null,
            status: null,
            package: null,
            packageStatus: null,
            endDate: null
        };
        
        for (const line of lines) {
            if (line.includes('İndex:')) {
                account.index = parseInt(line.split('İndex:')[1].trim());
            } else if (line.includes('📧 Email:')) {
                account.email = line.split('📧 Email:')[1].trim();
            } else if (line.includes('🔑 Password:')) {
                account.password = line.split('🔑 Password:')[1].trim();
            } else if (line.includes('👤 Ad Soyad:')) {
                account.name = line.split('👤 Ad Soyad:')[1].trim();
            } else if (line.includes('⚧ Cinsiyet:')) {
                account.gender = line.split('⚧ Cinsiyet:')[1].trim();
            } else if (line.includes('🎂 Doğum Tarihi:')) {
                account.birthDate = line.split('🎂 Doğum Tarihi:')[1].trim();
            } else if (line.includes('📌 Hesap Durumu:')) {
                account.status = line.split('📌 Hesap Durumu:')[1].trim();
            } else if (line.includes('• Paket:')) {
                account.package = line.split('• Paket:')[1].trim();
            } else if (line.includes('• Durum:')) {
                account.packageStatus = line.split('• Durum:')[1].trim();
            } else if (line.includes('• Bitiş Tarihi:')) {
                account.endDate = line.split('• Bitiş Tarihi:')[1].trim();
            }
        }
        
        // Tüm alanlar doluysa hesabı ekle
        if (Object.values(account).every(value => value !== null)) {
            accounts.push(account);
        }
    }
    
    return accounts;
}

// Kullanılmış hesapları yükle
function getUsedAccounts() {
    try {
        return JSON.parse(fs.readFileSync(USED_ACCOUNTS_FILE, 'utf8'));
    } catch (error) {
        return [];
    }
}

// Kullanılmış hesap ekle
function addUsedAccount(accountIndex) {
    const usedAccounts = getUsedAccounts();
    if (!usedAccounts.includes(accountIndex)) {
        usedAccounts.push(accountIndex);
        fs.writeFileSync(USED_ACCOUNTS_FILE, JSON.stringify(usedAccounts, null, 2));
    }
}

// System key kontrolü
function validateSystemKey(key) {
    try {
        const systemKeys = JSON.parse(fs.readFileSync(SYSTEM_KEYS_FILE, 'utf8'));
        const keyObj = systemKeys.find(k => k.key === key && !k.used);
        return !!keyObj;
    } catch (error) {
        return false;
    }
}

// Premium key kontrolü
function validatePremiumKey(key) {
    try {
        const premiumKeys = JSON.parse(fs.readFileSync(PREMIUM_KEYS_FILE, 'utf8'));
        const keyObj = premiumKeys.find(k => k.key === key && !k.used);
        
        if (keyObj) {
            // Key'i kullanılmış olarak işaretle
            keyObj.used = true;
            fs.writeFileSync(PREMIUM_KEYS_FILE, JSON.stringify(premiumKeys, null, 2));
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

// Admin giriş kontrolü
function adminLogin(username, password) {
    return username === 'babaproDEhatuzcu31' && password === 'DaHİSekerc31';
}

// Kahin API veri filtresi
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

// Rotalar

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// System key doğrulama
app.post('/api/verify-system-key', (req, res) => {
    const { key } = req.body;
    
    if (!key) {
        return res.status(400).json({ success: false, message: 'System key gereklidir' });
    }
    
    const isValid = validateSystemKey(key);
    
    if (isValid) {
        res.json({ success: true, message: 'System key başarıyla doğrulandı' });
    } else {
        res.status(400).json({ success: false, message: 'Geçersiz system key' });
    }
});

// Premium key doğrulama
app.post('/api/validate-premium', (req, res) => {
    const { key } = req.body;
    
    if (!key) {
        return res.status(400).json({ success: false, message: 'Premium key gereklidir' });
    }
    
    const isValid = validatePremiumKey(key);
    
    if (isValid) {
        res.json({ success: true, message: 'Premium key başarıyla doğrulandı' });
    } else {
        res.status(400).json({ success: false, message: 'Geçersiz premium key' });
    }
});

// Hesap alma
app.get('/api/get-account', (req, res) => {
    try {
        // tabii_cleaned.txt dosyasını oku
        if (!fs.existsSync(ACCOUNTS_FILE)) {
            return res.status(404).json({ success: false, message: 'Hesap dosyası bulunamadı' });
        }
        
        const content = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
        const accounts = parseAccountsFromTxt(content);
        
        if (accounts.length === 0) {
            return res.status(404).json({ success: false, message: 'Hesap bulunamadı' });
        }
        
        // Kullanılmış hesapları al
        const usedAccounts = getUsedAccounts();
        
        // Kullanılmamış hesapları filtrele
        const availableAccounts = accounts.filter(acc => !usedAccounts.includes(acc.index));
        
        if (availableAccounts.length === 0) {
            return res.status(404).json({ success: false, message: 'Tüm hesaplar kullanılmış' });
        }
        
        // Rastgele bir hesap seç
        const randomAccount = availableAccounts[Math.floor(Math.random() * availableAccounts.length)];
        
        // Hesabı kullanılmış olarak işaretle
        addUsedAccount(randomAccount.index);
        
        res.json({ success: true, account: randomAccount });
        
    } catch (error) {
        console.error('Hesap alma hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

// Kullanılabilir hesap sayısını getir
app.get('/api/available-accounts', (req, res) => {
    try {
        if (!fs.existsSync(ACCOUNTS_FILE)) {
            return res.json({ available: 0, total: 0 });
        }
        
        const content = fs.readFileSync(ACCOUNTS_FILE, 'utf8');
        const accounts = parseAccountsFromTxt(content);
        const usedAccounts = getUsedAccounts();
        const availableAccounts = accounts.filter(acc => !usedAccounts.includes(acc.index));
        
        res.json({ 
            available: availableAccounts.length, 
            total: accounts.length 
        });
        
    } catch (error) {
        console.error('Hesap sayısı alma hatası:', error);
        res.status(500).json({ available: 0, total: 0 });
    }
});

// Admin giriş
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gereklidir' });
    }
    
    const isValid = adminLogin(username, password);
    
    if (isValid) {
        // Basit session ID oluştur
        const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        res.json({ success: true, sessionId, message: 'Admin girişi başarılı' });
    } else {
        res.status(401).json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre' });
    }
});

// System key oluşturma
app.post('/api/admin/create-system-key', (req, res) => {
    const { key } = req.body;
    
    if (!key) {
        return res.status(400).json({ success: false, message: 'Key gereklidir' });
    }
    
    try {
        const systemKeys = JSON.parse(fs.readFileSync(SYSTEM_KEYS_FILE, 'utf8'));
        systemKeys.push({ key, used: false });
        fs.writeFileSync(SYSTEM_KEYS_FILE, JSON.stringify(systemKeys, null, 2));
        
        res.json({ success: true, message: 'System key oluşturuldu', keys: systemKeys });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Key oluşturma hatası' });
    }
});

// Premium key oluşturma
app.post('/api/admin/create-premium-key', (req, res) => {
    const { key } = req.body;
    
    if (!key) {
        return res.status(400).json({ success: false, message: 'Key gereklidir' });
    }
    
    try {
        const premiumKeys = JSON.parse(fs.readFileSync(PREMIUM_KEYS_FILE, 'utf8'));
        premiumKeys.push({ key, used: false });
        fs.writeFileSync(PREMIUM_KEYS_FILE, JSON.stringify(premiumKeys, null, 2));
        
        res.json({ success: true, message: 'Premium key oluşturuldu', keys: premiumKeys });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Key oluşturma hatası' });
    }
});

// Mevcut keyleri getir
app.get('/api/admin/keys', (req, res) => {
    try {
        const systemKeys = JSON.parse(fs.readFileSync(SYSTEM_KEYS_FILE, 'utf8'));
        const premiumKeys = JSON.parse(fs.readFileSync(PREMIUM_KEYS_FILE, 'utf8'));
        
        res.json({ 
            success: true, 
            systemKeys: systemKeys.map(k => k.key),
            premiumKeys: premiumKeys.map(k => k.key)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Keyler yüklenemedi' });
    }
});

// Discord ID sorgulama
app.get('/api/discord', async (req, res) => {
    const { id, key } = req.query;
    
    if (!key || !validateSystemKey(key)) {
        return res.status(401).json({ error: 'Geçersiz system key' });
    }
    
    if (!id) {
        return res.status(400).json({ error: 'Discord ID gerekli' });
    }
    
    try {
        // Örnek discord verisi
        const discordData = {
            id: id,
            username: "kullanici_" + id,
            discriminator: "1234",
            avatar: null,
            public_flags: 0,
            flags: 0,
            banner: null,
            accent_color: null,
            global_name: "Kullanıcı " + id,
            avatar_decoration: null,
            display_name: "Kullanıcı " + id,
            banner_color: "#000000"
        };
        
        res.json(discordData);
    } catch (error) {
        res.status(500).json({ error: 'Discord API hatası' });
    }
});

// Diğer sorgular için endpoint
app.get('/api/:type', async (req, res) => {
    const { type } = req.params;
    const { key, ...queryParams } = req.query;
    
    if (!key || !validateSystemKey(key)) {
        return res.status(401).json({ error: 'Geçersiz system key' });
    }
    
    try {
        // Kahin API'ye istek at
        const apiUrl = `https://api.kahin.org/kahinapi/${type}?${new URLSearchParams(queryParams)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        let data = await response.json();
        
        // Kahin verilerini filtrele
        data = deepFilterKahinData(data);
        
        res.json(data);
        
    } catch (error) {
        console.error('API sorgu hatası:', error);
        
        // Fallback: Örnek veri döndür
        const sampleResults = {
            tc: {
                tc: queryParams.tc,
                ad: "Ahmet",
                soyad: "Yılmaz",
                dogum_tarihi: "1990-01-01",
                anne_adi: "Fatma",
                baba_adi: "Mehmet",
                dogum_yeri: "İstanbul",
                nufus_il: "İstanbul",
                nufus_ilce: "Kadıköy"
            },
            adsoyad: {
                ad: queryParams.ad,
                soyad: queryParams.soyad,
                kayitlar: [
                    {
                        tc: "12345678901",
                        il: queryParams.il,
                        ilce: queryParams.ilce,
                        anne_adi: "Fatma",
                        baba_adi: "Mehmet"
                    }
                ]
            },
            aile: {
                tc: queryParams.tc,
                aile_uyeleri: [
                    { ad: "Ayşe", soyad: "Yılmaz", yakinlik: "Anne", tc: "12345678902" },
                    { ad: "Mehmet", soyad: "Yılmaz", yakinlik: "Baba", tc: "12345678903" },
                    { ad: "Zeynep", soyad: "Yılmaz", yakinlik: "Kardeş", tc: "12345678904" }
                ]
            },
            gsmtc: {
                gsm: queryParams.gsm,
                tc: "12345678901",
                ad: "Ahmet",
                soyad: "Yılmaz",
                operator: "Turkcell"
            },
            tcgsm: {
                tc: queryParams.tc,
                gsm: "5551234567",
                operator: "Turkcell",
                hat_durumu: "Aktif"
            }
        };
        
        const result = sampleResults[type] || { 
            message: `${type} sorgusu tamamlandı`, 
            data: queryParams,
            timestamp: new Date().toISOString()
        };
        
        res.json(result);
    }
});

// Vercel için özel route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server çalışıyor',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Sunucuyu başlat
const server = app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT} portunda çalışıyor`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`🔑 System Keys: DABBE2024VIP, DEHADAM2024, BABAPRO31`);
    console.log(`👑 Premium Keys: PREMIUM2025, TABII123, VIPACCESS`);
    console.log(`👤 Admin: babaproDEhatuzcu31 / DaHİSekerc31`);
    console.log(`📁 Hesap Dosyası: tabii_cleaned.txt`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app;
