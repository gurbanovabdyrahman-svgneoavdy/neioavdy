/**
 * Payment Service
 * ====================================
 * Ödeme sağlayıcılarıyla entegrasyon
 * Desteklenen: iyzico, PayTR, Stripe
 */

const axios = require('axios');

/**
 * iyzico Ödeme Başlat
 */
const initiateIyzicoPayment = async (paymentData) => {
  try {
    const { userId, price, currency, returnUrl } = paymentData;
    
    console.log('💳 iyzico ödeme başlatılıyor...');
    console.log(`   Kullanıcı: ${userId}`);
    console.log(`   Tutar: ${price} ${currency}`);
    console.log('\n📝 Gerçek uygulamada iyzico API çağrısı yapılacak');
    
    // Gerçek iyzico API kodu (örnek):
    /*
    const response = await axios.post(
      `${process.env.IYZICO_BASE_URL}/payment/iyzipos/checkoutforminitialization`,
      {
        locale: 'tr',
        conversationId: userId,
        price: price / 100,
        currency: currency,
        basketId: 'basket_' + userId + '_' + Date.now(),
        paymentGroup: 'PRODUCT',
        callbackUrl: returnUrl,
        enabledInstallments: [2, 3, 6, 9],
        buyer: {
          id: userId,
          identityNumber: '12345678901',
          name: 'Kullanıcı',
          surname: 'Adı',
          gsmNumber: '+905551234567',
          email: 'user@example.com',
          registrationAddress: 'İstanbul, Türkiye',
          city: 'İstanbul',
          country: 'Türkiye',
          zipCode: '34000'
        },
        basketItems: [
          {
            id: '1',
            name: 'Premium Üyelik 1 Ay',
            category1: 'Subscription',
            itemType: 'VIRTUAL',
            price: price / 100
          }
        ]
      },
      {
        auth: {
          username: process.env.IYZICO_API_KEY,
          password: process.env.IYZICO_SECRET_KEY
        }
      }
    );
    
    return response.data.checkoutFormContent;
    */
    
    // Demo modu - test sayfası döndür
    return `/payment/demo?userId=${userId}&amount=${price}`;
    
  } catch (error) {
    console.error('iyzico error:', error.message);
    throw error;
  }
};

/**
 * PayTR Ödeme Başlat
 */
const initiatePayTRPayment = async (paymentData) => {
  try {
    const { userId, price, currency, returnUrl } = paymentData;
    
    console.log('💳 PayTR ödeme başlatılıyor...');
    console.log(`   Kullanıcı: ${userId}`);
    console.log(`   Tutar: ${price} ${currency}`);
    console.log('\n📝 Gerçek uygulamada PayTR API çağrısı yapılacak');
    
    // Gerçek PayTR API kodu (örnek):
    /*
    const merchantId = process.env.PAYTR_MERCHANT_ID;
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const invoiceId = 'invoice_' + userId + '_' + Date.now();
    
    const response = await axios.post(
      'https://www.paytr.com/odeme/api/get-token',
      {
        merchant_id: merchantId,
        user_ip: req.ip,
        merchant_oid: invoiceId,
        email: 'user@example.com',
        payment_amount: price,
        currency: 'TL',
        test_mode: 0,
        no_installment: 1,
        max_installment: 12,
        user_name: 'Kullanıcı',
        user_address: 'İstanbul, Türkiye',
        user_phone: '+905551234567',
        merchant_ok_url: returnUrl + '?status=success',
        merchant_fail_url: returnUrl + '?status=fail',
        user_basket: 'Basket ID',
        debug_on: 0,
        timeout_limit: 30,
        hash: generatePaytrHash(merchantId, merchantKey, invoiceId, price)
      }
    );
    
    return `https://www.paytr.com/odeme/${response.data.token}`;
    */
    
    // Demo modu
    return `/payment/demo?userId=${userId}&amount=${price}`;
    
  } catch (error) {
    console.error('PayTR error:', error.message);
    throw error;
  }
};

/**
 * Stripe Ödeme Başlat
 */
const initiateStripePayment = async (paymentData) => {
  try {
    const { userId, price, currency } = paymentData;
    
    console.log('💳 Stripe ödeme başlatılıyor...');
    console.log(`   Kullanıcı: ${userId}`);
    console.log(`   Tutar: ${price} ${currency}`);
    console.log('\n📝 Gerçek uygulamada Stripe API çağrısı yapılacak');
    
    // Gerçek Stripe API kodu (örnek):
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: 'Premium Üyelik 1 Ay'
            },
            unit_amount: Math.round(price * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/payment/result?status=success',
      cancel_url: 'http://localhost:3000/payment/result?status=fail',
      client_reference_id: userId
    });
    
    return session.url;
    */
    
    // Demo modu
    return `/payment/demo?userId=${userId}&amount=${price}`;
    
  } catch (error) {
    console.error('Stripe error:', error.message);
    throw error;
  }
};

/**
 * PayTR Hash Oluştur
 */
const generatePaytrHash = (merchantId, merchantKey, invoiceId, amount) => {
  // PayTR'de SHA256 hash kullanılır
  // Bu örnek bir işaretçi
  return 'hash_example';
};

module.exports = {
  initiateIyzicoPayment,
  initiatePayTRPayment,
  initiateStripePayment
};
