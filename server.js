/**
 * RoomFlow - Ana Sunucu
 * =====================================================
 * WebRTC tabanlı canlı oda ve ekran paylaşım platformu
 * 
 * Özellikler:
 * - Express.js web sunucusu
 * - Socket.io gerçek zamanlı iletişim
 * - MongoDB veritabanı entegrasyonu
 * - JWT kimlik doğrulama
 * - WebRTC peer connection yönetimi
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Çevre değişkenlerini yükle
dotenv.config();

// =====================================================
// KONFIGÜRASYON
// =====================================================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'super-gizli-anahtar';

// =====================================================
// EXPRESS UYGULAMASI
// =====================================================
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// =====================================================
// MIDDLEWARE
// =====================================================

// Static dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Session
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün
  }
}));

// View engine - EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =====================================================
// VERİ YAPILARI (Gerçek uygulamada MongoDB kullanılacak)
// =====================================================

// Kullanıcılar (hafızada - temp)
const users = new Map();

// Odalar (hafızada)
const rooms = new Map();

// Socket ID -> User ID
const socketUsers = new Map();

// =====================================================
// ROUTES - ANA SAYFA
// =====================================================

app.get('/', (req, res) => {
  res.render('index', { 
    isLoggedIn: !!req.session.userId,
    user: req.session.user || null
  });
});

// =====================================================
// ROUTES - ODA SAYFASI
// =====================================================

app.get('/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).render('error', { message: 'Oda bulunamadı' });
  }
  
  res.render('room', {
    roomId,
    roomName: room.name,
    isLoggedIn: !!req.session.userId,
    user: req.session.user || null,
    maxParticipants: room.maxParticipants,
    currentParticipants: room.participants.size
  });
});

// =====================================================
// ROUTES - AUTHENTICATION (Basit demo)
// =====================================================

app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validasyon
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Tüm alanları doldurun' });
    }
    
    // Kullanıcı zaten var mı?
    if (Array.from(users.values()).some(u => u.email === email)) {
      return res.status(400).json({ success: false, message: 'Bu email zaten kayıtlı' });
    }
    
    // Yeni kullanıcı oluştur
    const userId = 'user_' + Date.now();
    const user = {
      id: userId,
      username,
      email,
      password, // Gerçek uygulamada hash'lenecek
      plan: 'free',
      premiumUntil: null,
      createdAt: new Date()
    };
    
    users.set(userId, user);
    
    // Token oluştur
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    
    // Session'a kaydet
    req.session.userId = userId;
    req.session.user = { username, email, plan: 'free' };
    
    res.json({ 
      success: true, 
      message: 'Kayıt başarılı', 
      token,
      user: { id: userId, username, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Kullanıcı bul
    let user = null;
    for (const u of users.values()) {
      if (u.email === email && u.password === password) {
        user = u;
        break;
      }
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email veya şifre yanlış' });
    }
    
    // Token oluştur
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Session'a kaydet
    req.session.userId = user.id;
    req.session.user = { username: user.username, email: user.email, plan: user.plan };
    
    res.json({ 
      success: true, 
      message: 'Giriş başarılı',
      token,
      user: { id: user.id, username: user.username, plan: user.plan }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Çıkış başarılı' });
});

// =====================================================
// SOCKET.IO - GERÇEK ZAMANLI İLETİŞİM
// =====================================================

io.on('connection', (socket) => {
  console.log(`\n✅ Yeni kullanıcı bağlandı: ${socket.id}`);
  
  // =====================================================
  // ODA OLAYLARI
  // =====================================================
  
  /**
   * ODA OLUŞTUR
   * İstemci: emit('room:create', { roomName, maxParticipants })
   * Sunucu: emit('room:created', { roomId, ... })
   */
  socket.on('room:create', (data) => {
    try {
      const { roomName, maxParticipants, userId } = data;
      
      // Yeni oda ID'si
      const roomId = 'room_' + Math.random().toString(36).substr(2, 9);
      
      // Oda oluştur
      const room = {
        id: roomId,
        name: roomName || 'Adsız Oda',
        ownerId: userId,
        participants: new Set([socket.id]),
        maxParticipants: maxParticipants || 5,
        createdAt: new Date(),
        screenSharing: false
      };
      
      rooms.set(roomId, room);
      socketUsers.set(socket.id, { userId, roomId });
      
      // Socket'i odaya ekle
      socket.join(roomId);
      
      console.log(`📍 Oda oluşturuldu: ${roomId} (Sahibi: ${userId})`);
      
      socket.emit('room:created', {
        roomId,
        joinUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/room/${roomId}`
      });
      
    } catch (error) {
      console.error('room:create error:', error);
      socket.emit('error', { message: 'Oda oluştururken hata' });
    }
  });
  
  /**
   * ODAYA KATIL
   * İstemci: emit('room:join', { roomId, userId, username })
   * Sunucu: emit('room:participants', { ... })
   */
  socket.on('room:join', (data) => {
    try {
      const { roomId, userId, username } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        return socket.emit('error', { message: 'Oda bulunamadı' });
      }
      
      // Katılımcı sayısı kontrolü (ücretsiz plan: max 5)
      if (room.participants.size >= room.maxParticipants) {
        return socket.emit('error', { message: 'Oda dolu' });
      }
      
      // Katılımcıyı ekle
      room.participants.add(socket.id);
      socketUsers.set(socket.id, { userId, roomId, username });
      
      // Socket'i odaya ekle
      socket.join(roomId);
      
      console.log(`👤 ${username} odaya katıldı: ${roomId}`);
      
      // Tüm katılımcılara haber ver
      io.to(roomId).emit('room:participants', {
        participants: Array.from(room.participants).map(id => ({
          socketId: id,
          ...socketUsers.get(id)
        }))
      });
      
    } catch (error) {
      console.error('room:join error:', error);
      socket.emit('error', { message: 'Odaya katılırken hata' });
    }
  });
  
  /**
   * ODADAN AYRIL
   */
  socket.on('room:leave', (data) => {
    try {
      const { roomId } = data;
      const room = rooms.get(roomId);
      
      if (!room) return;
      
      const userInfo = socketUsers.get(socket.id);
      
      // Katılımcıdan çıkar
      room.participants.delete(socket.id);
      socketUsers.delete(socket.id);
      socket.leave(roomId);
      
      console.log(`👋 ${userInfo?.username} odadan ayrıldı: ${roomId}`);
      
      // Odayı sil (oda sahibi ayrıldıysa veya kimse yoksa)
      if (room.participants.size === 0) {
        rooms.delete(roomId);
        console.log(`🗑️  Oda silindi: ${roomId}`);
      } else {
        // Kalan katılımcılara haber ver
        io.to(roomId).emit('room:participants', {
          participants: Array.from(room.participants).map(id => ({
            socketId: id,
            ...socketUsers.get(id)
          }))
        });
      }
      
    } catch (error) {
      console.error('room:leave error:', error);
    }
  });
  
  // =====================================================
  // WEBRTC OLAYLARI
  // =====================================================
  
  /**
   * WEBRTC OFFER GÖNDER
   * Gönderici hedef kişiye offer gönderiyor
   */
  socket.on('peer:offer', (data) => {
    const { to, from, offer } = data;
    io.to(to).emit('peer:offer', { from, offer });
    console.log(`🤝 Offer gönderildi: ${from} -> ${to}`);
  });
  
  /**
   * WEBRTC ANSWER GÖNDER
   */
  socket.on('peer:answer', (data) => {
    const { to, from, answer } = data;
    io.to(to).emit('peer:answer', { from, answer });
    console.log(`🤝 Answer gönderildi: ${from} -> ${to}`);
  });
  
  /**
   * ICE CANDIDATE GÖNDER
   * NAT traversal için
   */
  socket.on('peer:ice-candidate', (data) => {
    const { to, from, candidate } = data;
    io.to(to).emit('peer:ice-candidate', { from, candidate });
  });
  
  // =====================================================
  // KONTROL OLAYLARI
  // =====================================================
  
  /**
   * MİKROFON AÇ/KAPAT
   */
  socket.on('control:mic-toggle', (data) => {
    const { roomId, enabled } = data;
    const userInfo = socketUsers.get(socket.id);
    
    io.to(roomId).emit('user:mic-toggled', {
      socketId: socket.id,
      username: userInfo?.username,
      enabled
    });
    
    console.log(`🎙️  Mikrofon: ${userInfo?.username} -> ${enabled ? 'AÇIK' : 'KAPAL'}`);
  });
  
  /**
   * EKRAN PAYLAŞIMI AÇ/KAPAT
   */
  socket.on('control:screen', (data) => {
    const { roomId, enabled } = data;
    const userInfo = socketUsers.get(socket.id);
    const room = rooms.get(roomId);
    
    if (room) {
      room.screenSharing = enabled;
    }
    
    io.to(roomId).emit('user:screen-toggled', {
      socketId: socket.id,
      username: userInfo?.username,
      enabled
    });
    
    console.log(`📺 Ekran paylaşımı: ${userInfo?.username} -> ${enabled ? 'AÇIK' : 'KAPAL'}`);
  });
  
  // =====================================================
  // BAĞLANTI KESSİ OLAYLARI
  // =====================================================
  
  socket.on('disconnect', () => {
    try {
      const userInfo = socketUsers.get(socket.id);
      const roomId = userInfo?.roomId;
      
      if (roomId) {
        const room = rooms.get(roomId);
        if (room) {
          room.participants.delete(socket.id);
          
          if (room.participants.size === 0) {
            rooms.delete(roomId);
            console.log(`🗑️  Oda silindi (boşaldı): ${roomId}`);
          } else {
            // Kalan katılımcılara haber ver
            io.to(roomId).emit('room:participants', {
              participants: Array.from(room.participants).map(id => ({
                socketId: id,
                ...socketUsers.get(id)
              }))
            });
          }
        }
      }
      
      socketUsers.delete(socket.id);
      console.log(`❌ Kullanıcı bağlantı kesti: ${socket.id} (${userInfo?.username})`);
      
    } catch (error) {
      console.error('disconnect error:', error);
    }
  });
});

// =====================================================
// ERROR HANDLING
// =====================================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Sunucu hatası' });
});

// 404 - Not Found
app.use((req, res) => {
  res.status(404).render('error', { message: 'Sayfa bulunamadı' });
});

// =====================================================
// SUNUCUYU BAŞLAT
// =====================================================

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗`);
  console.log(`║         🚀 RoomFlow Başlatıldı                  ║`);
  console.log(`╠════════════════════════════════════════════════════╣`);
  console.log(`║ 🌐 URL: http://localhost:${PORT.toString().padEnd(35)}║`);
  console.log(`║ 🔧 Modu: ${NODE_ENV.toUpperCase().padEnd(40)}║`);
  console.log(`║ 📡 WebRTC: Aktif                               ║`);
  console.log(`║ 💾 Veritabanı: RAM (Demo)                       ║`);
  console.log(`╚════════════════════════════════════════════════════╝\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Sunucu kapatılıyor...');
  server.close(() => {
    console.log('✅ Sunucu kapatıldı');
    process.exit(0);
  });
});
