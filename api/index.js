export default async function handler(req, res) {
  // CORS - HERKESE AÇIK
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
  const isim = searchParams.get('isim');
  const email = searchParams.get('email');
  const ara = searchParams.get('ara');
  const limit = parseInt(searchParams.get('limit')) || 50;

  try {
    console.log('📥 Google Drive\'dan SQL çekiliyor...');
    
    // SENİN DRIVE LINK'İN
    const driveUrl = 'https://drive.google.com/uc?export=download&id=1XbuVEQDUqOe16owtKfZR59jN0uAf8iBe';
    
    const response = await fetch(driveUrl);
    
    if (!response.ok) {
      throw new Error(`Drive'dan dosya çekilemedi: ${response.status}`);
    }

    const sqlContent = await response.text();
    console.log(`✅ SQL dosyası alındı (${sqlContent.length} karakter)`);

    // HIZLI SQL PARSING
    const users = [];
    const lines = sqlContent.split('\n');
    
    console.log(`🔍 ${lines.length} satır işleniyor...`);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Sadece INSERT satırlarını işle
      if (line.includes('INSERT INTO') && line.includes('VALUES')) {
        try {
          // VALUES kısmını bul
          const valuesStart = line.indexOf('VALUES') + 6;
          let valuesPart = line.slice(valuesStart).trim();
          
          // Sonundaki noktalı virgülü temizle
          if (valuesPart.endsWith(';')) {
            valuesPart = valuesPart.slice(0, -1);
          }
          
          // Parantez gruplarını ayır
          const valueGroups = valuesPart.split('),(');
          
          for (let j = 0; j < valueGroups.length; j++) {
            let group = valueGroups[j];
            
            // İlk grupta ( varsa temizle
            if (j === 0 && group.startsWith('(')) {
              group = group.slice(1);
            }
            // Son grupta ) varsa temizle  
            if (j === valueGroups.length - 1 && group.endsWith(')')) {
              group = group.slice(0, -1);
            }
            
            // Değerleri ayır
            const values = group.split(',').map(v => {
              let val = v.trim();
              // Tırnakları temizle
              if (val.startsWith("'") && val.endsWith("'")) {
                val = val.slice(1, -1);
              }
              return val;
            });
            
            if (values.length >= 3 && values[0] && values[1] && values[2]) {
              users.push({
                kullanici_adi: values[0],
                sifre: values[1],
                email: values[2]
              });
            }
            
            // Performans için 200K kayıt limit
            if (users.length >= 200000) break;
          }
        } catch (groupError) {
          console.log('Gruplama hatası:', groupError);
          continue;
        }
      }
      
      // İlerleme göstergesi
      if (i % 50000 === 0) {
        console.log(`📊 ${i}/${lines.length} satır işlendi, ${users.length} kayıt bulundu`);
      }
      
      if (users.length >= 200000) break;
    }

    console.log(`🎉 ${users.length} kayıt hazır!`);

    // ARAMA YAP
    let results = users;
    
    if (isim) {
      const searchTerm = isim.toLowerCase();
      results = users.filter(user => 
        user.kullanici_adi && user.kullanici_adi.toLowerCase().includes(searchTerm)
      );
    } else if (email) {
      const searchTerm = email.toLowerCase();
      results = users.filter(user => 
        user.email && user.email.toLowerCase().includes(searchTerm)
      );
    } else if (ara) {
      const searchTerm = ara.toLowerCase();
      results = users.filter(user => 
        (user.kullanici_adi && user.kullanici_adi.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm))
      );
    }

    results = results.slice(0, limit);

    res.json({
      status: 'success',
      sonuc_sayisi: results.length,
      toplam_kayit: users.length,
      data: results
    });

  } catch (error) {
    console.error('❌ HATA:', error);
    res.status(500).json({ 
      error: 'API hatası',
      detay: error.message,
      cozum: 'Drive linkini kontrol et veya dosyayı tekrar yükle'
    });
  }
}
