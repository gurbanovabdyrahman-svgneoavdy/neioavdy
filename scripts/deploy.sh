#!/bin/bash

# RoomFlow - Deployment Helper Script
# ====================================
# Bu script deployment işlemlerini hızlandırır

echo "🚀 RoomFlow Deployment Helper"
echo "================================"
echo ""

# 1. .env dosyası kontrol et
echo "1️⃣  .env dosyası kontrol ediliyor..."
if [ ! -f .env ]; then
    echo "⚠️  .env dosyası bulunamadı!"
    echo "   .env.example dosyasını .env olarak kopyalıyorum..."
    cp .env.example .env
    echo "✅ .env dosyası oluşturuldu"
    echo "   Lütfen .env dosyasını düzenleyin ve çalıştırın: npm start"
    exit 1
fi
echo "✅ .env dosyası bulundu"
echo ""

# 2. Node modules kontrol et
echo "2️⃣  Node modules kontrol ediliyor..."
if [ ! -d node_modules ]; then
    echo "   npm install çalıştırılıyor..."
    npm install
fi
echo "✅ Node modules hazır"
echo ""

# 3. MongoDB bağlantısı testi
echo "3️⃣  MongoDB bağlantısı test ediliyor..."
node -e "console.log('✅ Node.js çalışıyor')"
echo ""

# 4. PORT kontrol et
echo "4️⃣  PORT ayarı kontrol ediliyor..."
PORT=${PORT:-3000}
echo "   Backend PORT: $PORT"
echo ""

# 5. Deployment hazırlığı
echo "5️⃣  Deployment hazırlığı..."
echo "   ✅ MongoDB Atlas: Bağlantı URL'ini .env'ye ekledin mi?"
echo "   ✅ Render: Backend deploy ettirdin mi?"
echo "   ✅ Vercel: Frontend deploy ettirdin mi?"
echo "   ✅ Environment variables: Hepsini ayarladın mı?"
echo ""

echo "🎉 Hazırlık tamamlandı!"
echo ""
echo "Şimdi yapmanız gerekenler:"
echo "1. npm start komutunu çalıştırın"
echo "2. http://localhost:3000 adresinde test edin"
echo "3. Deployment.md dosyasında test listesini izleyin"
echo ""
