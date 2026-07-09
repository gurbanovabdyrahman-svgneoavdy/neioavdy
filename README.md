# RoomFlow - WebRTC Canlı Oda ve Ekran Paylaşım Platformu

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![WebRTC](https://img.shields.io/badge/WebRTC-P2P-blue)

## 🎯 Hakkında

RoomFlow, **WebRTC teknolojisi** kullanarak tarayıcı üzerinden sesli konuşma ve ekran paylaşımı yapılabilen modern bir platformdur. Discord kadar karmaşık değil, ama profesyonel ve güvenilir.

### ✨ Temel Özellikler

- 🎙️ **Sesli Konuşma** - Kristal net ses kalitesi
- 🖥️ **Ekran Paylaşımı** - Tam ekran veya pencere seçimi
- 👥 **Katılımcı Listesi** - Odada kim olduğunu görün
- 🎛️ **Mikrofon Kontrolü** - Ses aç/kapat
- 📊 **Canlı İstatistikler** - Ağ durumu, gecikme vb.
- 🌙 **Koyu Tema** - Gözler için rahat, modern tasarım
- 💳 **Premium Sistem** - Ücretsiz ve Ücretli Planlar

---

## 🚀 Hızlı Başlangıç

### Gereksinimler

```bash
Node.js >= 14
npm >= 6
MongoDB >= 4.4
```

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/gurbanovabdyrahman-svgneoavdy/neioavdy.git
cd neioavdy
git checkout webrtc-room-sharing
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. MongoDB'yi Başlatın

**macOS/Linux:**
```bash
mongod --dbpath /data/db
```

**Windows:**
```bash
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath C:\data\db
```

### 4. Çevre Değişkenlerini Ayarlayın

`.env` dosyasını oluşturun (`.env.example` kopyalayarak):

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=gizli-anahtar-buraya-yazin
MONGODB_URI=mongodb://localhost:27017/roomflow
```

### 5. Sunucuyu Başlatın

**Geliştirme modu (auto-reload):**
```bash
npm run dev
```

**Üretim modu:**
```bash
npm start
```

### 6. Tarayıcıda Açın

```
http://localhost:3000
```

---

## 📁 Proje Yapısı

```
roomflow/
├── server.js                 # Express + Socket.io Ana Sunucu
├── package.json              # Bağımlılıklar
├── .env                      # Gizli anahtarlar (Git'e eklenmez)
├── .env.example              # Örnek çevre değişkenleri
├── README.md                 # Bu dosya
│
├── config/
│   └── database.js           # MongoDB Bağlantısı
│
├── models/                   # Mongoose Şemaları
│   ├── User.js              # Kullanıcı (Ad, Email, Şifre, Plan, Premium Tarihi)
│   └── Room.js              # Oda (ID, Sahibi, Katılımcılar, Maks Kişi)
│
├── middleware/
│   ├── auth.js              # JWT Token Doğrulama
│   └── premium.js           # Premium Plan Kontrolleri
│
├── controllers/
│   ├── authController.js    # Kayıt, Giriş, Profil
│   └── paymentController.js # Ödeme İşlemleri
│
├── services/
│   └── paymentService.js    # Ödeme Sağlayıcı (iyzico/PayTR/Stripe)
│
├── routes/
│   ├── auth.js              # /api/auth/* - Kimlik doğrulama
│   └── payment.js           # /api/payment/* - Ödemeler
│
├── views/                   # EJS Şablonları (HTML)
│   ├── index.ejs            # Ana Sayfa
│   ├── room.ejs             # WebRTC Oda İçeriği
│   ├── premium.ejs          # Premium Özellikler
│   └── payment-result.ejs   # Ödeme Sonucu
│
└── public/                  # Statik Dosyalar
    ├── css/
    │   ├── style.css        # Ana Sayfa Stili
    │   ├── room.css         # Oda Arayüzü Stili
    │   └── premium.css      # Premium Sayfası Stili
    └── js/
        ├── main.js          # Ana Sayfa JavaScript
        ├── room.js          # WebRTC + Socket.io (Oda)
        └── premium.js       # Ödeme Akışı JavaScript
```

---

## 🔐 Özellik Karşılaştırması

| Özellik | Ücretsiz Plan | Premium Plan |
|---------|---------------|---------------|
| **Katılımcı Sayısı** | 5 kişi | 25 kişi |
| **Oda Süresi** | 30 dakika | Sınırsız |
| **Ekran Paylaşımı** | 720p | 1080p |
| **Ses Kalitesi** | 16 kHz | 48 kHz |
| **TURN Sunucu** | ✅ | ✅ |
| **Fiyat** | Ücretsiz | 15 TL/ay |

---

## 💳 Ödeme Sistemi

### Desteklenen Sağlayıcılar

- **iyzico** (Türkiye - Önerilen)
- **PayTR** (Türkiye)
- **Stripe** (Global)

### Test Modunda Çalıştırma

`.env` dosyasında test API anahtarlarını kullanın:

```env
IYZICO_API_KEY=test-api-key
IYZICO_SECRET_KEY=test-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

### Canlıya Geçiş

Canlı ödeme almak için:
1. Ödeme sağlayıcısı ile hesap açın
2. Gerçek API anahtarlarını `.env` dosyasına yapıştırın
3. `IYZICO_BASE_URL` değerini `https://api.iyzipay.com` olarak değiştirin

---

## 🛠️ Teknoloji Stack

### Backend
- **Runtime:** Node.js
- **Web Framework:** Express.js
- **Gerçek Zamanlı İletişim:** Socket.io
- **Veritabanı:** MongoDB + Mongoose
- **Kimlik Doğrulama:** JWT + bcryptjs
- **View Engine:** EJS

### Frontend
- **HTML5:** Semantic markup
- **CSS3:** Modern tasarım, Flexbox, Grid
- **JavaScript (ES6+):** Vanilla JS (Framework yok)
- **WebRTC API:** Peer-to-peer sesli/ekran paylaşımı
- **Socket.io Client:** Gerçek zamanlı olaylar

### Altyapı
- **TURN Sunucusu:** openrelay.metered.ca (Ücretsiz)
- **STUN Sunucu:** Google'ın açık STUN sunucuları

---

## 📝 API Endpoints

### Kimlik Doğrulama

```
POST /api/auth/register      - Kayıt
POST /api/auth/login         - Giriş
POST /api/auth/logout        - Çıkış
GET  /api/auth/profile       - Profil Bilgileri
```

### Ödeme

```
POST /api/payment/start      - Ödeme Başlat
GET  /api/payment/callback   - Ödeme Sonucu (İPN)
GET  /api/payment/status     - Ödeme Durumu
```

---

## 🔌 WebRTC + Socket.io Events

### Socket.io Events

```javascript
// Oda Olayları
'room:create'        - Oda oluştur
'room:join'          - Odaya katıl
'room:leave'         - Odadan ayrıl
'room:participants'  - Katılımcı listesi güncelle

// Peer Olayları
'peer:offer'         - WebRTC Offer gönder
'peer:answer'        - WebRTC Answer gönder
'peer:ice-candidate' - ICE Candidate gönder

// Kontrol Olayları
'control:mic-toggle' - Mikrofon aç/kapat
'control:screen'     - Ekran paylaşımı aç/kapat
```

---

## 🐛 Sorun Giderme

### MongoDB Bağlantısı Başarısız

```bash
# MongoDB'nin çalışıp çalışmadığını kontrol edin
mongosh

# Eğer "localhost" ile çalışmıyorsa
MONGODB_URI=mongodb://127.0.0.1:27017/roomflow
```

### WebRTC Ses Alınmıyor

1. Tarayıcı izni kontrol edin: Ayarlar → Gizlilik → Mikrofon
2. TURN sunucusu bağlantısını kontrol edin
3. Konsoldaki hataları kontrol edin (F12 → Console)

### Ekran Paylaşımı Çalışmıyor

1. Chrome/Edge kullandığınızdan emin olun (Firefox sınırlı destek)
2. HTTPS kullanıyorsanız izin verilir (localhost HTTP'de çalışır)

---

## 📚 Geliştirme Rehberi

### Yeni Özellik Ekleme

1. **Backend:**
   - `models/` - Yeni veri modeli ekleyin
   - `controllers/` - İş mantığını yazın
   - `routes/` - API endpoint'ini tanımlayın

2. **Frontend:**
   - `public/js/` - JavaScript dosyası ekleyin
   - `public/css/` - Stili yazın
   - `views/` - EJS şablonunu güncelleyin

3. **WebRTC:**
   - `server.js` - Socket.io event handler'ı ekleyin
   - `public/js/room.js` - WebRTC PeerConnection kodunu yazın

### Kodlama Standartları

- **Async/await** kullanın (callbacks yerine)
- **Try-catch** ile hata yönetimi yapın
- **Const** ve **let** kullanın (var yerine)
- **Açıklayıcı değişken isimleri** kullanın

---

## 🚀 Deployment

### Heroku'da Deploy

```bash
heroku login
heroku create your-app-name
heroku addons:create mongolab:sandbox
git push heroku main
```

### Docker ile

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📄 Lisans

MIT License - Serbestçe kullanabilirsiniz.

---

## 👨‍💻 Katkıda Bulunun

Bug raporları ve özellik talepleri için issue açabilirsiniz!

---

## 📞 İletişim

Sorularınız için GitHub Issues kullanın.

---

**Made with ❤️ by RoomFlow Team**
