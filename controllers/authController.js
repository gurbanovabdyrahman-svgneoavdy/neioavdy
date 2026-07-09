/**
 * Authentication Controller
 * ====================================
 * Kayıt, giriş, profil işlemleri
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-gizli-anahtar';

// Temp kullanıcı veritabanı (gerçek uygulamada MongoDB)
const users = new Map();

/**
 * Kayıt
 */
const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    // Validasyon
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tüm alanları doldurun' 
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Şifreler eşleşmiyor' 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Şifre en az 6 karakter olmalı' 
      });
    }
    
    // Email zaten var mı?
    if (Array.from(users.values()).some(u => u.email === email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu email zaten kayıtlı' 
      });
    }
    
    // Username zaten var mı?
    if (Array.from(users.values()).some(u => u.username === username)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bu kullanıcı adı zaten alınmış' 
      });
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
    
    // JWT token oluştur
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    
    // Session'a kaydet
    req.session.userId = userId;
    req.session.user = { username, email, plan: 'free' };
    req.session.token = token;
    
    res.json({ 
      success: true, 
      message: 'Kayıt başarılı',
      token,
      user: { id: userId, username, email, plan: 'free' }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

/**
 * Giriş
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validasyon
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email ve şifre gerekli' 
      });
    }
    
    // Kullanıcı bul
    let user = null;
    for (const u of users.values()) {
      if (u.email === email && u.password === password) {
        user = u;
        break;
      }
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email veya şifre yanlış' 
      });
    }
    
    // JWT token oluştur
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Session'a kaydet
    req.session.userId = user.id;
    req.session.user = { 
      username: user.username, 
      email: user.email, 
      plan: user.plan 
    };
    req.session.token = token;
    
    res.json({ 
      success: true, 
      message: 'Giriş başarılı',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        plan: user.plan 
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

/**
 * Çıkış
 */
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Çıkış hatası' 
      });
    }
    res.json({ 
      success: true, 
      message: 'Çıkış başarılı' 
    });
  });
};

/**
 * Profil bilgileri
 */
const getProfile = (req, res) => {
  try {
    const user = users.get(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Kullanıcı bulunamadı' 
      });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        plan: user.plan,
        isPremium: user.plan === 'premium' && user.premiumUntil > new Date(),
        premiumUntil: user.premiumUntil,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Sunucu hatası' 
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile
};
