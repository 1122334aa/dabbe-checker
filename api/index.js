<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dabbe Checker</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #0a0a0a;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }

        /* Yağmur efekti */
        .rain {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        }

        .rain-drop {
            position: absolute;
            width: 1px;
            height: 20px;
            background: linear-gradient(transparent, #00ff00);
            animation: rainFall linear infinite;
        }

        @keyframes rainFall {
            0% {
                transform: translateY(-100px);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(100vh);
                opacity: 0;
            }
        }

        /* Glow efekti */
        .glow {
            text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            text-align: center;
            padding: 40px 0;
            border-bottom: 2px solid #00ff00;
            margin-bottom: 40px;
        }

        h1 {
            font-size: 3em;
            margin-bottom: 10px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .nav-tabs {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
            margin-bottom: 30px;
        }

        .tab-btn {
            background: transparent;
            border: 1px solid #00ff00;
            color: #00ff00;
            padding: 12px 24px;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 5px;
        }

        .tab-btn:hover {
            background: #00ff00;
            color: #000;
            box-shadow: 0 0 15px #00ff00;
        }

        .tab-btn.active {
            background: #00ff00;
            color: #000;
            box-shadow: 0 0 20px #00ff00;
        }

        .tab-content {
            display: none;
            background: rgba(0, 255, 0, 0.05);
            border: 1px solid #00ff00;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
        }

        .tab-content.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }

        input, select {
            width: 100%;
            padding: 12px;
            background: transparent;
            border: 1px solid #00ff00;
            color: #00ff00;
            border-radius: 5px;
            font-size: 16px;
        }

        input:focus, select:focus {
            outline: none;
            box-shadow: 0 0 10px #00ff00;
        }

        button {
            background: transparent;
            border: 1px solid #00ff00;
            color: #00ff00;
            padding: 12px 30px;
            cursor: pointer;
            border-radius: 5px;
            transition: all 0.3s ease;
            font-size: 16px;
            margin-right: 10px;
            margin-bottom: 10px;
        }

        button:hover {
            background: #00ff00;
            color: #000;
            box-shadow: 0 0 15px #00ff00;
        }

        .result {
            margin-top: 30px;
            padding: 20px;
            background: rgba(0, 255, 0, 0.1);
            border: 1px solid #00ff00;
            border-radius: 10px;
            display: none;
        }

        .result.active {
            display: block;
            animation: slideUp 0.5s ease;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .result pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: 'Courier New', monospace;
        }

        .loading {
            display: none;
            text-align: center;
            padding: 20px;
        }

        .loading.active {
            display: block;
        }

        .spinner {
            border: 3px solid #333;
            border-top: 3px solid #00ff00;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .download-btn {
            background: #006600;
            border-color: #00cc00;
        }

        .download-btn:hover {
            background: #00cc00;
            box-shadow: 0 0 20px #00cc00;
        }

        @media (max-width: 768px) {
            .nav-tabs {
                flex-direction: column;
            }
            
            .tab-btn {
                width: 100%;
            }
            
            h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <!-- Yağmur efekti -->
    <div class="rain" id="rain"></div>

    <div class="container">
        <header>
            <h1 class="glow">Dabbe Checker</h1>
            <p>Gelişmiş Oyun Platformu</p>
        </header>

        <div class="nav-tabs">
            <button class="tab-btn active" onclick="openTab('tc-tab')">TC Sorgu</button>
            <button class="tab-btn" onclick="openTab('adsoyad-tab')">Ad Soyad</button>
            <button class="tab-btn" onclick="openTab('gsm-tab')">GSM Sorgu</button>
            <button class="tab-btn" onclick="openTab('aile-tab')">Aile Sorgu</button>
            <button class="tab-btn" onclick="openTab('ip-tab')">IP & Domain</button>
            <button class="tab-btn" onclick="openTab('gelismisip-tab')">Gelişmiş IP</button>
            <button class="tab-btn" onclick="openTab('other-tab')">Diğer Sorgular</button>
        </div>

        <!-- TC Sorgu Tab -->
        <div id="tc-tab" class="tab-content active">
            <h2>TC Kimlik Sorgulama</h2>
            <div class="form-group">
                <label>TC Kimlik No:</label>
                <input type="text" id="tc" maxlength="11" placeholder="TC kimlik numarasını girin">
            </div>
            <button onclick="sorgula('tc')">TC Sorgula</button>
            <button onclick="sorgula('tcpro')">TC Pro Sorgula</button>
            <button onclick="sorgula('hayathikayesi')">Hayat Hikayesi</button>
            <button onclick="sorgula('yas')">Yaş Sorgula</button>
        </div>

        <!-- Ad Soyad Tab -->
        <div id="adsoyad-tab" class="tab-content">
            <h2>Ad Soyad Sorgulama</h2>
            <div class="form-group">
                <label>Ad:</label>
                <input type="text" id="ad" placeholder="Ad">
            </div>
            <div class="form-group">
                <label>Soyad:</label>
                <input type="text" id="soyad" placeholder="Soyad">
            </div>
            <div class="form-group">
                <label>İl:</label>
                <input type="text" id="il" placeholder="İl">
            </div>
            <div class="form-group">
                <label>İlçe:</label>
                <input type="text" id="ilce" placeholder="İlçe">
            </div>
            <button onclick="sorgula('adsoyad')">Ad Soyad Sorgula</button>
            <button onclick="sorgula('adsoyadpro')">Ad Soyad Pro</button>
            <button onclick="sorgula('adililce')">Ad İl İlçe Sorgula</button>
        </div>

        <!-- GSM Tab -->
        <div id="gsm-tab" class="tab-content">
            <h2>GSM Sorgulama</h2>
            <div class="form-group">
                <label>TC Kimlik No:</label>
                <input type="text" id="tcGsm" maxlength="11" placeholder="TC kimlik numarasını girin">
            </div>
            <button onclick="sorgula('tcgsm')">TC'den GSM Sorgula</button>
            
            <div class="form-group" style="margin-top: 30px;">
                <label>GSM Numarası:</label>
                <input type="text" id="gsm" placeholder="GSM numarasını girin">
            </div>
            <button onclick="sorgula('gsmtc')">GSM'den TC Sorgula</button>
        </div>

        <!-- Aile Tab -->
        <div id="aile-tab" class="tab-content">
            <h2>Aile ve Akraba Sorgulama</h2>
            <div class="form-group">
                <label>TC Kimlik No:</label>
                <input type="text" id="tcAile" maxlength="11" placeholder="TC kimlik numarasını girin">
            </div>
            <button onclick="sorgula('aile')">Aile Sorgula</button>
            <button onclick="sorgula('ailepro')">Aile Pro Sorgula</button>
            <button onclick="sorgula('es')">Eş Sorgula</button>
            <button onclick="sorgula('sulale')">Sülale Sorgula</button>
        </div>

        <!-- IP Tab -->
        <div id="ip-tab" class="tab-content">
            <h2>IP ve Domain Sorgulama</h2>
            <div class="form-group">
                <label>IP/Domain:</label>
                <input type="text" id="domain" placeholder="IP adresi veya domain girin">
            </div>
            <button onclick="sorgula('ip')">IP Sorgula</button>
            <button onclick="sorgula('dns')">DNS Sorgula</button>
            <button onclick="sorgula('whois')">WHOIS Sorgula</button>
            <button onclick="sorgula('subdomain')">Subdomain Sorgula</button>
            
            <div class="form-group" style="margin-top: 30px;">
                <label>E-posta:</label>
                <input type="text" id="leakQuery" placeholder="E-posta adresi girin">
            </div>
            <button onclick="sorgula('leak')">Leak Sorgula</button>
            
            <div class="form-group" style="margin-top: 30px;">
                <label>Telegram Kullanıcı Adı:</label>
                <input type="text" id="telegramUser" placeholder="Telegram kullanıcı adı">
            </div>
            <button onclick="sorgula('telegram')">Telegram Sorgula</button>
        </div>

        <!-- Gelişmiş IP Tab -->
        <div id="gelismisip-tab" class="tab-content">
            <h2>Gelişmiş IP Sorgulama</h2>
            <div class="form-group">
                <label>IP Adresi:</label>
                <input type="text" id="gelismisIp" placeholder="IPv4 adresi girin">
            </div>
            <button onclick="sorgula('gelismisip')">Detaylı IP Sorgula</button>
        </div>

        <!-- Diğer Sorgular Tab -->
        <div id="other-tab" class="tab-content">
            <h2>Diğer Sorgular</h2>
            
            <div class="form-group">
                <label>TC Kimlik No:</label>
                <input type="text" id="tcOther" maxlength="11" placeholder="TC kimlik numarasını girin">
            </div>
            <button onclick="sorgula('tapu')">Tapu Sorgula</button>
            <button onclick="sorgula('isyeri')">İşyeri Sorgula</button>
            <button onclick="sorgula('adres')">Adres Sorgula</button>
            <button onclick="sorgula('hane')">Hane Sorgula</button>
            <button onclick="sorgula('apartman')">Apartman Sorgula</button>
            
            <div class="form-group" style="margin-top: 30px;">
                <label>Vergi No:</label>
                <input type="text" id="vergiNo" placeholder="Vergi numarası girin">
            </div>
            <button onclick="sorgula('vergino')">Vergi No Sorgula</button>
            
            <div class="form-group" style="margin-top: 30px;">
                <label>Ada Parsel:</label>
                <input type="text" id="ilAda" placeholder="İl">
                <input type="text" id="ada" placeholder="Ada" style="margin-top: 10px;">
                <input type="text" id="parsel" placeholder="Parsel" style="margin-top: 10px;">
            </div>
            <button onclick="sorgula('adaparsel')">Ada Parsel Sorgula</button>
        </div>

        <!-- Loading -->
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Sorgulanıyor...</p>
        </div>

        <!-- Result -->
        <div class="result" id="result">
            <h3>Sorgu Sonucu:</h3>
            <pre id="resultData"></pre>
            <button class="download-btn" onclick="downloadResult()">Sonucu İndir (TXT)</button>
        </div>
    </div>

    <script>
        // Yağmur efekti oluştur
        function createRain() {
            const rain = document.getElementById('rain');
            const drops = 100;
            
            for (let i = 0; i < drops; i++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = Math.random() * 100 + 'vw';
                drop.style.animationDuration = (Math.random() * 2 + 1) + 's';
                drop.style.animationDelay = Math.random() * 2 + 's';
                rain.appendChild(drop);
            }
        }

        // Tab değiştirme
        function openTab(tabName) {
            const tabs = document.getElementsByClassName('tab-content');
            for (let i = 0; i < tabs.length; i++) {
                tabs[i].classList.remove('active');
            }
            
            const buttons = document.getElementsByClassName('tab-btn');
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove('active');
            }
            
            document.getElementById(tabName).classList.add('active');
            event.currentTarget.classList.add('active');
        }

        // Sorgu yapma
        async function sorgula(type) {
            const loading = document.getElementById('loading');
            const result = document.getElementById('result');
            const resultData = document.getElementById('resultData');
            
            loading.classList.add('active');
            result.classList.remove('active');
            
            let url = `/api/${type}`;
            let params = {};
            
            switch(type) {
                case 'tc':
                case 'tcpro':
                case 'hayathikayesi':
                case 'yas':
                case 'tapu':
                case 'isyeri':
                case 'adres':
                case 'hane':
                case 'apartman':
                case 'aile':
                case 'ailepro':
                case 'es':
                case 'sulale':
                case 'tcgsm':
                    params.tc = document.getElementById('tc' + (type === 'tcgsm' ? 'Gsm' : '')).value;
                    break;
                case 'gsmtc':
                    params.gsm = document.getElementById('gsm').value;
                    break;
                case 'adsoyad':
                case 'adsoyadpro':
                    params.ad = document.getElementById('ad').value;
                    params.soyad = document.getElementById('soyad').value;
                    params.il = document.getElementById('il').value;
                    params.ilce = document.getElementById('ilce').value;
                    break;
                case 'adililce':
                    params.ad = document.getElementById('ad').value;
                    params.il = document.getElementById('il').value;
                    break;
                case 'ip':
                case 'dns':
                case 'whois':
                case 'subdomain':
                    params.domain = document.getElementById('domain').value;
                    break;
                case 'leak':
                    params.query = document.getElementById('leakQuery').value;
                    break;
                case 'telegram':
                    params.kullanici = document.getElementById('telegramUser').value;
                    break;
                case 'gelismisip':
                    params.ip = document.getElementById('gelismisIp').value;
                    break;
                case 'vergino':
                    params.vergi = document.getElementById('vergiNo').value;
                    break;
                case 'adaparsel':
                    params.il = document.getElementById('ilAda').value;
                    params.ada = document.getElementById('ada').value;
                    params.parsel = document.getElementById('parsel').value;
                    break;
            }
            
            try {
                const queryString = new URLSearchParams(params).toString();
                const response = await fetch(`${url}?${queryString}`);
                const data = await response.json();
                
                resultData.textContent = JSON.stringify(data, null, 2);
                currentResult = data;
            } catch (error) {
                resultData.textContent = 'Hata: ' + error.message;
            } finally {
                loading.classList.remove('active');
                result.classList.add('active');
            }
        }

        // Sonuç indirme
        let currentResult = null;
        
        function downloadResult() {
            if (!currentResult) return;
            
            const text = JSON.stringify(currentResult, null, 2);
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sorgu_sonucu.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Sayfa yüklendiğinde
        document.addEventListener('DOMContentLoaded', function() {
            createRain();
        });
    </script>
</body>
</html>
