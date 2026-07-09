/**
 * RoomFlow - Test ve Kontrol Listesi
 * ====================================
 * Canlı ortamda test edilecek özellikler
 */

const tests = {
  temelIslemler: [
    {
      ad: 'Ana Sayfa Açılıyor',
      url: 'https://roomflow.vercel.app',
      beklenen: 'Hero section, Features, Pricing görünüyor',
      status: '⏳'
    },
    {
      ad: 'Kayıt Formu Çalışıyor',
      url: 'https://roomflow.vercel.app',
      adimlar: [
        '1. "Kayıt" butonuna tıkla',
        '2. Email, şifre gir',
        '3. Kayıt Ol butonuna tıkla'
      ],
      beklenen: 'Başarılı mesajı, ana sayfaya dön',
      status: '⏳'
    },
    {
      ad: 'Giriş Yapılıyor',
      url: 'https://roomflow.vercel.app',
      adimlar: [
        '1. "Giriş" butonuna tıkla',
        '2. Email, şifre gir',
        '3. Giriş Yap butonuna tıkla'
      ],
      beklenen: 'Giriş başarılı, kullanıcı adı navbar'da görünüyor',
      status: '⏳'
    },
    {
      ad: 'Kullanıcı Profili',
      url: 'https://roomflow.vercel.app',
      adimlar: ['Giriş yap', 'Navbar'da kullanıcı adına tıkla'],
      beklenen: 'Profil bilgileri gösteriliyor',
      status: '⏳'
    }
  ],

  odaIslemleri: [
    {
      ad: 'Oda Oluşturuluyor',
      adimlar: ['Giriş yap', '"Oda Oluştur" butonuna tıkla'],
      beklenen: 'Oda oluşturuluyor, WebRTC arayüzü açılıyor',
      status: '⏳'
    },
    {
      ad: 'Oda Linki Kopyalanıyor',
      adimlar: ['Odada "Kopyala" butonuna tıkla'],
      beklenen: 'Link kopyalandı mesajı gösteriliyor',
      status: '⏳'
    },
    {
      ad: 'Başka Kullanıcı Odaya Katılıyor',
      adimlar: [
        '1. Başka tarayıcı açıkla (incognito)',
        '2. Kopyalanan linki yapıştır',
        '3. "Katıl" butonuna tıkla'
      ],
      beklenen: '2. kullanıcı odaya katılıyor, her iki tarafta video gösteriliyor',
      status: '⏳'
    },
    {
      ad: 'Katılımcı Listesi Güncelleniyor',
      adimlar: ['Her iki kullanıcıyı gözlemle'],
      beklenen: 'Sağ panelde her iki kullanıcı listeleniyor',
      status: '⏳'
    }
  ],

  webrtcIslemleri: [
    {
      ad: 'Lokal Video Başlıyor',
      beklenen: 'Kendi videonuz video grid\'de görünüyor',
      status: '⏳'
    },
    {
      ad: 'Mikrofon Açılıp Kapanıyor',
      adimlar: ['Mikrofon butonuna tıkla'],
      beklenen: 'Buton rengi değişiyor (yeşil/gri)',
      status: '⏳'
    },
    {
      ad: 'Kamera Açılıp Kapanıyor',
      adimlar: ['Kamera butonuna tıkla'],
      beklenen: 'Video kapatılıyor/açılıyor',
      status: '⏳'
    },
    {
      ad: 'Remote Video Alınıyor',
      beklenen: 'İkinci kullanıcının videosu görünüyor',
      status: '⏳'
    },
    {
      ad: 'Ses İşitiliyor',
      adimlar: ['Bir kullanıcı konuşuyor'],
      beklenen: 'Diğer kullanıcı sesi işitiyor',
      status: '⏳'
    }
  ],

  ekranPaylasimiIslemleri: [
    {
      ad: 'Ekran Paylaşımı Başlıyor',
      adimlar: ['Ekran butonuna tıkla', 'Ekranı seç', 'Paylaş butonuna tıkla'],
      beklenen: 'Ekran paylaşımı başlıyor, görüntü alınıyor',
      status: '⏳'
    },
    {
      ad: 'Ekran 720p/1080p Kalitesinde İletiliyor',
      beklenen: 'Ekran açık ve net görünüyor',
      status: '⏳'
    },
    {
      ad: 'Ekran Paylaşımı Durduruluyor',
      adimlar: ['Ekran butonuna tekrar tıkla'],
      beklenen: 'Ekran paylaşımı durduruluyor, kamera geri geliyor',
      status: '⏳'
    },
    {
      ad: 'Kamera Geri Alınıyor',
      beklenen: 'Kamera otomatik olarak geri geliyor',
      status: '⏳'
    }
  ],

  premiumOdemeIslemleri: [
    {
      ad: 'Premium Sayfası Açılıyor',
      url: 'https://roomflow.vercel.app/premium',
      beklenen: 'Fiyatlandırma tablosu ve ödeme seçenekleri görünüyor',
      status: '⏳'
    },
    {
      ad: 'iyzico Ödeme Başlıyor',
      adimlar: [
        '1. "iyzico ile Öde" butonuna tıkla',
        '2. Ödeme formunu doldur',
        '3. Ödeme tamamla'
      ],
      beklenen: 'iyzico ödeme sayfasına yönlendiriliyor',
      status: '⏳'
    },
    {
      ad: 'Ödeme Tamamlanıyor',
      beklenen: 'Başarılı mesajı gösteriliyor',
      status: '⏳'
    },
    {
      ad: 'Premium Planı Aktifleştiyor',
      beklenen: 'Profilde plan "Premium" olarak güncelleniyor',
      status: '⏳'
    },
    {
      ad: 'Premium Limitleri Güncelleniyor',
      adimlar: ['Yeni oda oluştur'],
      beklenen: 'Maksimum katılımcı 25, süre sınırsız',
      status: '⏳'
    }
  ],

  uretimKontrolleri: [
    {
      ad: 'HTTPS Bağlantısı Çalışıyor',
      url: 'https://roomflow.vercel.app',
      beklenen: 'URL https:// ile başlıyor, kilit işareti var',
      status: '⏳'
    },
    {
      ad: 'CORS Hatası Yok',
      beklenen: 'Tarayıcı console\'da CORS hatası yok',
      status: '⏳'
    },
    {
      ad: 'MongoDB\'ye Bağlantı Var',
      beklenen: 'Veritabanı işlemleri (kayıt, giriş) çalışıyor',
      status: '⏳'
    },
    {
      ad: 'JWT Token İşlev Görüyor',
      beklenen: 'Oturumlar kalıcı, logout sonra giriş gerekli',
      status: '⏳'
    },
    {
      ad: 'Socket.io Bağlantısı Stabil',
      beklenen: 'WebRTC bağlantısı kesintisiz, mesajlar anlık',
      status: '⏳'
    },
    {
      ad: 'Loading Performansı',
      beklenen: 'Sayfa 3 saniyede açılıyor',
      status: '⏳'
    }
  ],

  guvenlikKontrolleri: [
    {
      ad: '.env Dosyası Git\'e Eklenmemiş',
      adimlar: ['GitHub repository\'de .env ara'],
      beklenen: '.env dosyası yok',
      status: '⏳'
    },
    {
      ad: 'JWT_SECRET Güvenli',
      beklenen: 'JWT_SECRET 32+ karakter, güçlü',
      status: '⏳'
    },
    {
      ad: 'Veritabanı Şifresi Güçlü',
      beklenen: 'MongoDB password güçlü ve karmaşık',
      status: '⏳'
    },
    {
      ad: 'CORS Sadece İzin Verilen Domain\'lerle',
      beklenen: 'CORS_ORIGIN sadece frontend URL\'sini içeriyor',
      status: '⏳'
    },
    {
      ad: 'HTTPS Kullanılıyor',
      beklenen: 'Tüm bağlantılar HTTPS',
      status: '⏳'
    }
  ]
};

// Sonuçları yazdır
console.log('\n✅ RoomFlow - Test Kontrol Listesi\n');
console.log('=' .repeat(80));

Object.entries(tests).forEach(([kategori, testler]) => {
  console.log(`\n📋 ${kategori.replace(/([A-Z])/g, ' $1').toUpperCase()}`);
  console.log('-' .repeat(80));

  testler.forEach((test, index) => {
    console.log(`\n${index + 1}. ${test.ad}`);
    if (test.url) console.log(`   🔗 URL: ${test.url}`);
    if (test.adimlar) {
      console.log('   📝 Adımlar:');
      test.adimlar.forEach(adim => console.log(`      ${adim}`));
    }
    console.log(`   ✓ Beklenen: ${test.beklenen}`);
    console.log(`   ${test.status}`);
  });
});

console.log('\n' + '=' .repeat(80));
console.log('\n✅ Tüm testleri tamamladıktan sonra sonuçları güncelleyin');
console.log('   - ⏳ Yapılmadı');
console.log('   - ✅ Başarılı');
console.log('   - ❌ Başarısız\n');

module.exports = tests;
