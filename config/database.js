/**
 * MongoDB Veritabanı Bağlantısı
 * ====================================
 * Mongoose kullanarak MongoDB'ye bağlanır
 */

const mongoose = require('mongoose');

/**
 * MongoDB'ye bağlan
 * @param {string} mongoUri - MongoDB connection string
 * @returns {Promise}
 */
const connectDB = async (mongoUri) => {
  try {
    // Şimdilik console.log ile demo
    console.log('📊 MongoDB bağlantı simüle edildi (Demo modu)');
    console.log(`   URI: ${mongoUri}`);
    console.log('\n💡 Gerçek uygulamada Mongoose kullanılacak');
    
    // Gerçek mongoose kodu (yorum olarak):
    /*
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB bağlantısı başarılı');
    */
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };
