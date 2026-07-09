# RoomFlow - Deployment Guide

## 🚀 Deployment Adımları

### 1️⃣ MongoDB Atlas (Veritabanı)

#### A. MongoDB Atlas Hesabı Oluştur
1. https://www.mongodb.com/cloud/atlas adresine git
2. "Sign Up" butonuna tıkla
3. E-mail, şifre ve bilgileri gir
4. Doğrulama linki e-maile gelir

#### B. Cluster Oluştur
1. "Create a Deployment" seçeneğini tıkla
2. **Tier Seçimi:**
   - ✅ **M0 Sandbox (Ücretsiz)** - İlk test için ideal
   - Sonra M2 veya M5 (Ücretli) - Üretim için
3. Cloud Provider: **AWS**
4. Region: **EU-West (İrlanda)** - Avrupa'ya yakın
5. "Create Cluster" tıkla (5-10 dakika beklenir)

#### C. Connection String Al
1. "Connect" butonuna tıkla
2. "Connect your application" seçeneğini tıkla
3. **Driver:** Node.js, **Version:** 4.0 and later
4. Connection string kopyala:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/roomflow?retryWrites=true&w=majority
   ```
5. `username` ve `password` yerine kendi değerlerini yaz

#### D. IP Whitelist Ekle
1. "Network Access" → "Add IP Address"
2. "Allow Access from Anywhere" seçeneğini tıkla (0.0.0.0/0)
3. ✅ Confirm

**→ MongoDB URI'ni not al (.env dosyasında kullanacaksın)**

---

### 2️⃣ Render Backend Deployment

#### A. Render.com Hesabı Oluştur
1. https://render.com adresine git
2. "Sign up" → GitHub ile giriş yap
3. Repository erişim izni ver

#### B. Backend Yayınla
1. Dashboard'dan "New +" → "Web Service"
2. Repository seç: `gurbanovabdyrahman-svgneoavdy/neioavdy`
3. **Ayarları Doldur:**
   - **Name:** `roomflow-backend`
   - **Branch:** `webrtc-room-sharing`
   - **Root Directory:** `/` (boş bırak)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free` (Üretim için Paid)
   - **Node Version:** `18`

#### C. Environment Variables Ekle
1. "Environment" sekmesine git
2. Aşağıdaki değişkenleri ekle:

```env
NODE_ENV=production
PORT=3000
BASE_URL=https://roomflow-backend.onrender.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roomflow?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
FRONTEND_URL=https://roomflow.vercel.app
CORS_ORIGIN=https://roomflow.vercel.app
TURN_SERVER_URL=turn:openrelay.metered.ca:80
TURN_USERNAME=openrelayproject
TURN_PASSWORD=openrelayproject
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com
```

3. "Create Web Service" tıkla
4. Deployment başlar (3-5 dakika)

#### D. Backend URL'ini Not Al
```
Backend URL: https://roomflow-backend.onrender.com
```

---

### 3️⃣ Vercel Frontend Deployment

#### A. Vercel Hesabı Oluştur
1. https://vercel.com adresine git
2. "Sign Up" → GitHub ile giriş
3. Repository erişim izni ver

#### B. Frontend Projesi Oluştur
1. Dashboard'dan "New Project" → "Import Git Repository"
2. Repository seç: `gurbanovabdyrahman-svgneoavdy/neioavdy`
3. **Ayarları Doldur:**
   - **Project Name:** `roomflow`
   - **Framework Preset:** `Other` (Custom)
   - **Root Directory:** `/` (boş bırak)
   - **Build Command:** `npm run build` (varsa) veya boş bırak
   - **Output Directory:** `public` (Static files için)
   - **Install Command:** `npm install`

#### C. Environment Variables Ekle
1. "Environment Variables" sekmesine git
2. Ekle:

```env
REACT_APP_API_URL=https://roomflow-backend.onrender.com
VITE_API_URL=https://roomflow-backend.onrender.com
NEXT_PUBLIC_API_URL=https://roomflow-backend.onrender.com
ALL_BACKEND_URL=https://roomflow-backend.onrender.com
```

3. "Deploy" tıkla
4. Deployment tamamlanır (2-3 dakika)

#### D. Frontend URL'ini Not Al
```
Frontend URL: https://roomflow.vercel.app
```

---

### 4️⃣ Server.js Güncellemeleri

```javascript
// CORS ayarı
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://roomflow.vercel.app',
  credentials: true
}));

// MongoDB bağlantısı
const { connectDB } = require('./config/database');
connectDB(process.env.MONGODB_URI);
```

---

### 5️⃣ Public/js/main.js ve room.js Güncellemeleri

```javascript
// API URL'i güncelle
const API_URL = process.env.REACT_APP_API_URL || 'https://roomflow-backend.onrender.com/api';

// Socket.io bağlantısı
const socket = io(process.env.REACT_APP_API_URL || 'https://roomflow-backend.onrender.com');
```

---

## 🧪 Test Listesi

### ✅ Temel İşlemler
- [ ] Ana sayfa açılıyor
- [ ] Kayıt formu çalışıyor
- [ ] Giriş yapılıyor
- [ ] Kullanıcı profili görünüyor

### ✅ Oda İşlemleri
- [ ] Yeni oda oluşturuluyor
- [ ] Oda linki kopyalanıyor
- [ ] Başka kullanıcı odaya katılıyor
- [ ] Katılımcı listesi güncelleniyor

### ✅ WebRTC İşlemleri
- [ ] Lokal video başlıyor
- [ ] Mikrofon açılıp kapanıyor
- [ ] Kamera açılıp kapanıyor
- [ ] Remote video alınıyor (2 kullanıcı)
- [ ] Ses işitiliyor

### ✅ Ekran Paylaşımı
- [ ] Ekran paylaşımı başlıyor
- [ ] Ekran 720p/1080p kalitesinde iletiliyor
- [ ] Ekran paylaşımı durduruluyor
- [ ] Kamera geri geliyorekleyiyor

### ✅ Premium & Ödeme
- [ ] Premium sayfası açılıyor
- [ ] iyzico ödeme başlıyor
- [ ] Ödeme tamamlanıyor
- [ ] Premium planı aktifleştiyor
- [ ] Limit değerleri güncelleniyor (25 kişi, sınırsız süre)

### ✅ Üretim Kontrolleri
- [ ] HTTPS bağlantısı çalışıyor
- [ ] CORS hatası yok
- [ ] MongoDB'ye bağlantı var
- [ ] JWT token işlev görüyor
- [ ] Socket.io bağlantısı stabil

---

## 🔒 Güvenlik Kontrol Listesi

- [ ] `.env` dosyası `.gitignore`'da var
- [ ] JWT_SECRET güvenli (32+ karakter)
- [ ] Veritabanı şifresi güçlü
- [ ] CORS sadece izin verilen domain'lerle
- [ ] HTTPS kullanılıyor
- [ ] Rate limiting ayarlandı
- [ ] Input validation yapılıyor
- [ ] XSS koruması var
- [ ] CSRF token var
- [ ] Özel verileri hash'leme işlemi var

---

## 📊 İzleme & Logging

### Render Logs
```bash
# Logs görüntüleme
Render Dashboard → Logs sekmesi
```

### MongoDB Atlas Monitoring
```
Cluster → Monitoring → Charts
```

### Vercel Analytics
```
Vercel Dashboard → Analytics
```

---

## 🐛 Sorun Giderme

### Bağlantı Hatası
```
ERROR: Cannot connect to MongoDB
→ MONGODB_URI kontrol et
→ IP Whitelist kontrol et
→ Network bağlantısı kontrol et
```

### CORS Hatası
```
ERROR: CORS policy blocked
→ CORS_ORIGIN kontrol et
→ Vercel frontend URL'ini Backend'e ekle
```

### Socket.io Hatası
```
ERROR: Socket connection failed
→ Backend URL kontrol et
→ WebSocket izni var mı kontrol et
```

---

## 📈 Performans Optimizasyonları

1. **CDN Kullan:** Cloudflare Free
2. **Image Compression:** Sharp
3. **Caching:** Redis (Premium)
4. **Database Index:** MongoDB indexes
5. **Code Splitting:** Webpack
6. **Lazy Loading:** JavaScript

---

## 💾 Backup & Disaster Recovery

### MongoDB Backup
```bash
# Otomatik backup (Atlas ile ücretsiz)
# Settings → Backup → Automated Backups
```

### Source Code Backup
```bash
# GitHub otomatik backup sağlıyor
# Repository → Settings → Archive
```

---

## 📞 Destek Kaynakları

- MongoDB Atlas: https://docs.mongodb.com/
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Socket.io: https://socket.io/docs/
- WebRTC: https://webrtc.org/

---

**🎉 Deployment tamamlandı! Aşama aşama test listesini çalıştırın.**
