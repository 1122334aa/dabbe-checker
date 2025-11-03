import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Static files - MEVCUT DİZİNİ KULLAN
app.use(express.static(__dirname));

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API çalışıyor!' });
});

// Tüm diğer sayfalar
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '404.html'));
});

export default app;