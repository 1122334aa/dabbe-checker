const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS ayarları
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// API proxy endpoint'leri
const createApiHandler = (endpoint) => async (req, res) => {
  try {
    const params = new URLSearchParams(req.query);
    const response = await fetch(`https://api.kahin.org/kahinapi/${endpoint}?${params}`);
    const data = await response.json();
    
    // Kahin ile ilgili bilgileri filtrele
    const filteredData = filterKahinData(data);
    
    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ error: 'API hatası' });
  }
};

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

// Tüm API endpoint'lerini oluştur
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

for (const [route, endpoint] of Object.entries(apiEndpoints)) {
  app.get(`/api/${route}`, createApiHandler(endpoint));
}

// Gelişmiş IP sorgu endpoint'i
app.get('/api/gelismisip', async (req, res) => {
  try {
    const { ip } = req.query;
    const response = await fetch(`https://api.kahin.org/kahinapi/ip?domain=${ip}`);
    const data = await response.json();
    
    const filteredData = filterKahinData(data);
    res.json(filteredData);
  } catch (error) {
    res.status(500).json({ error: 'IP sorgu hatası' });
  }
});

// Text indirme endpoint'i
app.post('/api/download', (req, res) => {
  const { data, filename } = req.body;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
  res.send(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

module.exports = app;