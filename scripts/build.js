#!/usr/bin/env node

/**
 * RoomFlow - Build Script
 * ====================================
 * Üretim ortamı için derleme ve hazırlık
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 Build process başlıyor...\n');

// 1. Gerekli dizinleri kontrol et
const dirs = ['config', 'models', 'controllers', 'middleware', 'routes', 'public', 'views'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Dizin eksik: ${dir}`);
  } else {
    console.log(`✅ Dizin kontrol: ${dir}`);
  }
});

// 2. .env dosyasını kontrol et
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.warn('\n⚠️  .env dosyası bulunamadı!');
  console.warn('   → .env.example dosyasını .env olarak kopyalayın');
  console.warn('   → Gerekli değişkenleri doldurun');
  process.exit(1);
}
console.log('✅ .env dosyası bulundu\n');

// 3. Public klasörü kontrol et
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
  const publicFiles = fs.readdirSync(publicPath, { recursive: true });
  console.log(`✅ Public dosyaları: ${publicFiles.length} dosya`);
} else {
  console.error('❌ public/ klasörü bulunamadı!');
  process.exit(1);
}

// 4. Node modules kontrol et
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error('❌ node_modules bulunamadı!');
  console.error('   → npm install komutını çalıştırın');
  process.exit(1);
}
console.log('✅ Node modules bulundu\n');

console.log('✨ Build hazırlanması tamamlandı!');
console.log('🚀 npm start komutunu çalıştırabilirsiniz.\n');
