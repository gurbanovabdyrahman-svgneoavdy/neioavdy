/**
 * RoomFlow - Premium JavaScript
 * ====================================
 * Premium sayfası işlemleri
 */

const API_URL = 'http://localhost:3000/api';

async function startPayment(planType, provider) {
  try {
    console.log(`💳 ${provider} ödeme başlatılıyor...`);
    
    const response = await fetch(`${API_URL}/payment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ planType, provider })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Ödeme sayfasına yönlendiriliyor...');
      window.location.href = data.paymentUrl;
    } else {
      alert('❌ ' + data.message);
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('❌ Ödeme başlatılamadı. Lütfen tekrar deneyin.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('💎 Premium Sayfası Yüklendi');
});
