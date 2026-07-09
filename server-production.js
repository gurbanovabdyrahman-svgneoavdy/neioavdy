/**
 * RoomFlow - Production Server
 * ====================================
 * Üretim ortamı için optimize edilmiş sunucu
 * Express + Socket.io + MongoDB
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const helmet = require('helmet'); // Güvenlik
const compression = require('compression'); // Sıkıştırma
const cors = require('cors'); // CORS

// Çevre değişkenlerini yükle
dotenv.config();

// =====================================================
// KONFİGÜRASYON
// =====================================================
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'super-gizli-anahtar';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const CORS_ORIGIN = process.env.CORS_ORIGIN || FRONTEND_URL;

const isDev = NODE_ENV === 'development';
const isProd = NODE_ENV === 'production';

// =====================================================
// EXPRESS UYGULAMASI
// =====================================================
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL || '25000'),
  pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT || '60000'),
  transports: ['websocket', 'polling']
});

// =====================================================
// SECURITY MIDDLEWARE
// =====================================================

// Helmet - HTTP header güvenliği
app.use(helmet());

// CORS
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression
if (process.env.ENABLE_COMPRESSION !== 'false') {
  app.use(compression());
}

// =====================================================
// MIDDLEWARE
// =====================================================

// Static dosyalar
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: isProd ? '1d' : '1m',
  etag: false
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Session
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün
  }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =====================================================
// VERİ YAPILARI
// =====================================================
const users = new Map();
const rooms = new Map();
const socketUsers = new Map();

// =====================================================
// ROUTES
// =====================================================

app.get('/', (req, res) => {
  res.render('index', {
    isLoggedIn: !!req.session.userId,
    user: req.session.user || null
  });
});

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
    currentParticipants: room.participants.size,
    planLimits: {
      screenQuality: req.session.user?.plan === 'premium' ? '1080' : '720'
    }
  });
});

app.get('/premium', (req, res) => {
  res.render('premium', {
    isLoggedIn: !!req.session.userId,
    user: req.session.user || null
  });
});

// ===== API Routes =====
app.post('/api/auth/register', require('./controllers/authController').register);
app.post('/api/auth/login', require('./controllers/authController').login);
app.post('/api/auth/logout', require('./controllers/authController').logout);
app.get('/api/auth/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Giriş gerekli' });
  }
  const user = users.get(req.session.userId);
  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      plan: user.plan,
      isPremium: user.plan === 'premium' && user.premiumUntil > new Date(),
      premiumUntil: user.premiumUntil
    }
  });
});

app.post('/api/payment/start', require('./controllers/paymentController').startPayment);
app.get('/api/payment/result', require('./controllers/paymentController').handlePaymentResult);
app.get('/api/payment/status', require('./controllers/paymentController').getPaymentStatus);

// Health check (Render için)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// =====================================================
// SOCKET.IO - GERÇEk ZAMANLI İLETİŞİM
// =====================================================

io.on('connection', (socket) => {
  console.log(`\n✅ Yeni kullanıcı: ${socket.id}`);

  // ODA OLAYLARI
  socket.on('room:create', (data) => {
    try {
      const { roomName, maxParticipants, userId } = data;
      const roomId = 'room_' + Math.random().toString(36).substr(2, 9);

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
      socket.join(roomId);

      socket.emit('room:created', {
        roomId,
        joinUrl: `${BASE_URL}/room/${roomId}`
      });

      console.log(`📍 Oda oluşturuldu: ${roomId}`);
    } catch (error) {
      console.error('room:create error:', error);
      socket.emit('error', { message: 'Oda oluşturulurken hata' });
    }
  });

  socket.on('room:join', (data) => {
    try {
      const { roomId, userId, username } = data;
      const room = rooms.get(roomId);

      if (!room) {
        return socket.emit('error', { message: 'Oda bulunamadı' });
      }

      if (room.participants.size >= room.maxParticipants) {
        return socket.emit('error', { message: 'Oda dolu' });
      }

      room.participants.add(socket.id);
      socketUsers.set(socket.id, { userId, roomId, username });
      socket.join(roomId);

      io.to(roomId).emit('room:participants', {
        participants: Array.from(room.participants).map(id => ({
          socketId: id,
          ...socketUsers.get(id)
        }))
      });

      console.log(`👤 ${username} katıldı: ${roomId}`);
    } catch (error) {
      console.error('room:join error:', error);
      socket.emit('error', { message: 'Odaya katılırken hata' });
    }
  });

  socket.on('room:leave', (data) => {
    try {
      const { roomId } = data;
      const room = rooms.get(roomId);

      if (!room) return;

      const userInfo = socketUsers.get(socket.id);
      room.participants.delete(socket.id);
      socketUsers.delete(socket.id);
      socket.leave(roomId);

      if (room.participants.size === 0) {
        rooms.delete(roomId);
      } else {
        io.to(roomId).emit('room:participants', {
          participants: Array.from(room.participants).map(id => ({
            socketId: id,
            ...socketUsers.get(id)
          }))
        });
      }

      console.log(`👋 ${userInfo?.username} ayrıldı: ${roomId}`);
    } catch (error) {
      console.error('room:leave error:', error);
    }
  });

  // WEBRTC OLAYLARI
  socket.on('peer:offer', (data) => {
    const { to, from, offer } = data;
    io.to(to).emit('peer:offer', { from, offer });
  });

  socket.on('peer:answer', (data) => {
    const { to, from, answer } = data;
    io.to(to).emit('peer:answer', { from, answer });
  });

  socket.on('peer:ice-candidate', (data) => {
    const { to, from, candidate } = data;
    io.to(to).emit('peer:ice-candidate', { from, candidate });
  });

  // KONTROL OLAYLARI
  socket.on('control:mic-toggle', (data) => {
    const { roomId, enabled } = data;
    const userInfo = socketUsers.get(socket.id);
    io.to(roomId).emit('user:mic-toggled', {
      socketId: socket.id,
      username: userInfo?.username,
      enabled
    });
  });

  socket.on('control:screen', (data) => {
    const { roomId, enabled } = data;
    const userInfo = socketUsers.get(socket.id);
    io.to(roomId).emit('user:screen-toggled', {
      socketId: socket.id,
      username: userInfo?.username,
      enabled
    });
  });

  // BAĞLANTI KESSI
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
          } else {
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
      console.log(`❌ Bağlantı koptu: ${socket.id}`);
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

app.use((req, res) => {
  res.status(404).render('error', { message: 'Sayfa bulunamadı' });
});

// =====================================================
// SUNUCUYU BAŞLAT
// =====================================================

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════╗`);
  console.log(`║     🚀 RoomFlow Başlatıldı          ║`);
  console.log(`╠═══════════════════════════════════════╣`);
  console.log(`║ 🌐 URL: ${BASE_URL.padEnd(28)}║`);
  console.log(`║ 🔧 Ortam: ${NODE_ENV.toUpperCase().padEnd(27)}║`);
  console.log(`║ 💾 Veritabanı: ${(process.env.MONGODB_URI ? '✅' : '❌').padEnd(24)}║`);
  console.log(`║ 🔐 CORS: ${CORS_ORIGIN.padEnd(28)}║`);
  console.log(`╚═══════════════════════════════════════╝\n`);

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'super-gizli-anahtar') {
    console.warn('⚠️  UYARI: JWT_SECRET güvenli değildir!');
    console.warn('   Lütfen .env dosyasında güçlü bir anahtar ayarlayın.\n');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Sunucu kapatılıyor...');
  server.close(() => {
    console.log('✅ Sunucu kapatıldı');
    process.exit(0);
  });
});

module.exports = { app, server, io };
