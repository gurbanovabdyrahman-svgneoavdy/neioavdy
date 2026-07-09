/**
 * JWT Kimlik Doğrulama Middleware
 * ====================================
 * Her istek için JWT token'ı doğrula
 */

const jwt = require('jsonwebtoken');

/**
 * JWT'i doğrula ve userId'yi payload'a ekle
 */
const verifyToken = (req, res, next) => {
  try {
    // Token'ı al
    const token = req.headers.authorization?.split(' ')[1] || req.session?.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token gerekli' 
      });
    }
    
    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-gizli-anahtar');
    
    // userId'yi request'e ekle
    req.userId = decoded.userId;
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Token doğrulama hatası:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token süresi doldu' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Geçersiz token' 
    });
  }
};

/**
 * Session tabanlı doğrulama
 */
const requireLogin = (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Giriş gerekli' 
    });
  }
  next();
};

module.exports = {
  verifyToken,
  requireLogin
};
