/**
 * RoomFlow - Ana JavaScript
 * ====================================
 * Ana sayfa işlemleri
 */

const API_URL = 'http://localhost:3000/api';

// ===== MODAL YÖNETIMI =====
function showLoginModal() {
  document.getElementById('loginModal').classList.add('active');
}

function showRegisterModal() {
  document.getElementById('registerModal').classList.add('active');
}

function showJoinModal() {
  document.getElementById('joinModal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function switchModal(fromId, toId) {
  closeModal(fromId);
  showModal = toId.replace('Modal', '');
  if (showModal === 'login') showLoginModal();
  if (showModal === 'register') showRegisterModal();
}

// ===== AUTHENTICATION =====
async function handleRegister(event) {
  event.preventDefault();
  
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirm').value;
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, confirmPassword })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('✅ Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      closeModal('registerModal');
      document.getElementById('registerForm').reset();
      location.reload();
    } else {
      alert('❌ ' + data.message);
    }
  } catch (error) {
    console.error('Register error:', error);
    alert('❌ Bir hata oluştu. Lütfen tekrar deneyin.');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.token);
      alert('✅ Giriş başarılı!');
      closeModal('loginModal');
      location.reload();
    } else {
      alert('❌ ' + data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('❌ Bir hata oluştu. Lütfen tekrar deneyin.');
  }
}

function logout() {
  if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
    localStorage.removeItem('token');
    fetch(`${API_URL}/auth/logout`, { method: 'POST' });
    location.reload();
  }
}

// ===== ROOM OPERATIONS =====
function createRoom() {
  const roomName = prompt('Oda adı girin:', 'Benim Odam');
  if (roomName) {
    // Oda oluştur ve yönlendir
    window.location.href = '/room/demo_room_' + Date.now();
  }
}

function goToPremium() {
  window.location.href = '/premium';
}

function handleJoin(event) {
  event.preventDefault();
  const roomLink = document.getElementById('roomLink').value;
  
  // Link'ten room ID'sini çıkar
  const roomId = roomLink.split('/room/').pop();
  
  if (roomId) {
    window.location.href = `/room/${roomId}`;
  } else {
    alert('❌ Geçersiz oda linki');
  }
}

// ===== MODAL KAPANMASI (Dışarı tıklanırsa) =====
window.addEventListener('click', (event) => {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
  }
});

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 RoomFlow Ana Sayfa Yüklendi');
});
