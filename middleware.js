import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS ayarları
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Kahin verilerini filtreleme fonksiyonu
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

// API endpoint'leri
const apiEndpoints = {
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
  'telegram': 'telegram.php'
};

// Tüm API endpoint'lerini oluştur
for (const [route, endpoint] of Object.entries(apiEndpoints)) {
  app.get(`/api/${route}`, async (req, res) => {
    try {
      console.log(`API isteği: ${endpoint}`, req.query);
      const params = new URLSearchParams(req.query);
      const response = await fetch(`https://api.kahin.org/kahinapi/${endpoint}?${params}`);
      const data = await response.json();
      const filteredData = filterKahinData(data);
      res.json(filteredData);
    } catch (error) {
      console.error('API hatası:', error);
      res.status(500).json({ error: 'API hatası' });
    }
  });
}

// Gelişmiş IP sorgu
app.get('/api/gelismisip', async (req, res) => {
  try {
    const { ip } = req.query;
    const response = await fetch(`https://api.kahin.org/kahinapi/ip?domain=${ip}`);
    const data = await response.json();
    const filteredData = filterKahinData(data);
    res.json(filteredData);
  } catch (error) {
    console.error('IP sorgu hatası:', error);
    res.status(500).json({ error: 'IP sorgu hatası' });
  }
});

// Text indirme
app.post('/api/download', (req, res) => {
  const { data, filename } = req.body;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
  res.send(data);
});

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 sayfası
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '404.html'));
});

// Server başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

export default app;
