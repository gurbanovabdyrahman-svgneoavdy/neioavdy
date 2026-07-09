/**
 * Payment Controller
 * ====================================
 * Ödeme işlemleri ve Premium aktivasyon
 */

const paymentService = require('../services/paymentService');

// Temp kullanıcı veritabanı
const users = new Map();

/**
 * Ödeme başlat (iyzico/PayTR/Stripe)
 */
const startPayment = async (req, res) => {
  try {
    const { planType, provider } = req.body;
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Giriş gerekli' 
      });
    }
    
    // Plan kontrol
    if (planType !== 'monthly') {
      return res.status(400).json({ 
        success: false, 
        message: 'Geçersiz plan' 
      });
    }
    
    // Fiyat (15 TL = 1500 kuruş)
    const price = 1500; // kuruş
    const currency = 'TRY';
    
    // Ödeme başlat (provider'a göre)
    let paymentUrl;
    
    if (provider === 'iyzico') {
      paymentUrl = await paymentService.initiateIyzicoPayment({
        userId,
        price,
        currency,
        returnUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/result`
      });
    } else if (provider === 'paytr') {
      paymentUrl = await paymentService.initiatePayTRPayment({
        userId,
        price,
        currency,
        returnUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/payment/result`
      });
    } else if (provider === 'stripe') {
      paymentUrl = await paymentService.initiateStripePayment({
        userId,
        price: price / 100, // Stripe dolar cinsinden
        currency
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Geçersiz ödeme sağlayıcı' 
      });
    }
    
    res.json({ 
      success: true, 
      paymentUrl,
      message: 'Ödeme sayfasına yönlendiriliyorsunuz'
    });
    
  } catch (error) {
    console.error('Payment start error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ödeme başlatılamadı' 
    });
  }
};

/**
 * Ödeme sonucu (Webhook/Callback)
 */
const handlePaymentResult = async (req, res) => {
  try {
    const { status, transactionId, userId } = req.query;
    
    if (status === 'success') {
      // Premium'u aktifleştir
      const user = users.get(userId);
      if (user) {
        const premiumUntil = new Date();
        premiumUntil.setMonth(premiumUntil.getMonth() + 1); // 1 ay ekle
        
        user.plan = 'premium';
        user.premiumUntil = premiumUntil;
        users.set(userId, user);
        
        console.log(`💳 Premium aktivasyonu: ${user.username}`);
        
        res.render('payment-result', {
          success: true,
          message: 'Ödeme başarılı! Premium üyelik aktifleştirildi.',
          premiumUntil
        });
      }
    } else {
      res.render('payment-result', {
        success: false,
        message: 'Ödeme başarısız oldu. Lütfen tekrar deneyin.'
      });
    }
  } catch (error) {
    console.error('Payment result error:', error);
    res.render('payment-result', {
      success: false,
      message: 'Ödeme işleme hatası'
    });
  }
};

/**
 * Ödeme durumu
 */
const getPaymentStatus = async (req, res) => {
  try {
    const userId = req.session?.userId;
    const user = users.get(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    const isPremium = user.plan === 'premium' && user.premiumUntil > new Date();
    
    res.json({ 
      success: true, 
      plan: user.plan,
      isPremium,
      premiumUntil: user.premiumUntil
    });
    
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Durum sorgulanırken hata' 
    });
  }
};

module.exports = {
  startPayment,
  handlePaymentResult,
  getPaymentStatus
};
