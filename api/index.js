import express from 'express';

const app = express();

app.use(express.json());

// ANA SAYFA HTML
const indexHTML = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sorgu Sistemi</title>
    <style>
        body {
            background: #000;
            color: #0f0;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
        }
        h1 {
            font-size: 3em;
            text-shadow: 0 0 10px #0f0;
        }
    </style>
</head>
<body>
    <h1>🚀 SİTE ÇALIŞIYOR!</h1>
    <p>Ana sayfa başarıyla yüklendi.</p>
    <button onclick="testApi()">API Test</button>
    <div id="result"></div>

    <script>
        async function testApi() {
            try {
                const response = await fetch('/api/test');
                const data = await response.json();
                document.getElementById('result').innerHTML = 'API Yanıtı: ' + data.message;
            } catch (error) {
                document.getElementById('result').innerHTML = 'API Hatası: ' + error;
            }
        }
    </script>
</body>
</html>
`;

// 404 SAYFA HTML
const notFoundHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>404 - Sayfa Bulunamadı</title>
    <style>
        body { background: #000; color: #f00; text-align: center; padding: 50px; }
        h1 { font-size: 4em; }
    </style>
</head>
<body>
    <h1>404</h1>
    <p>Sayfa bulunamadı</p>
    <a href="/" style="color: #0f0;">Ana Sayfaya Dön</a>
</body>
</html>
`;

// ROUTE'LAR
app.get('/', (req, res) => {
  res.send(indexHTML);
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API çalışıyor!' });
});

app.get('*', (req, res) => {
  res.status(404).send(notFoundHTML);
});

export default app;