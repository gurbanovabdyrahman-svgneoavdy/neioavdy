/**
 * Premium Plan Kontrol Middleware
 * ====================================
 * Ücretsiz ve Premium plan limitlerini kontrol eder
 */

/**
 * Plan limitleri
 */
const PLAN_LIMITS = {
  free: {
    maxParticipants: 5,
    maxDurationMinutes: 30,
    screenQuality: '720',
    audioQuality: '16000'
  },
  premium: {
    maxParticipants: 25,
    maxDurationMinutes: 0, // 0 = sınırsız
    screenQuality: '1080',
    audioQuality: '48000'
  }
};

/**
 * Katılımcı sayısı kontrol et
 */
const checkParticipantLimit = (userPlan) => {
  return (req, res, next) => {
    const limit = PLAN_LIMITS[userPlan || 'free'].maxParticipants;
    
    req.limits = {
      maxParticipants: limit,
      maxDurationMinutes: PLAN_LIMITS[userPlan || 'free'].maxDurationMinutes,
      screenQuality: PLAN_LIMITS[userPlan || 'free'].screenQuality
    };
    
    next();
  };
};

/**
 * Oda açabilme yetkisi kontrol et
 */
const canCreateRoom = (req, res, next) => {
  const userPlan = req.session?.user?.plan || 'free';
  
  if (userPlan === 'free') {
    // Ücretsiz kullanıcı: Maksimum katılımcı sayısını kontrol et
    req.maxParticipants = 5;
    req.maxDuration = 30; // dakika
  } else if (userPlan === 'premium') {
    // Premium kullanıcı: Sınırsız
    req.maxParticipants = 25;
    req.maxDuration = 0; // sınırsız
  }
  
  next();
};

/**
 * Premium kontrolü (rota koruması)
 */
const requirePremium = (req, res, next) => {
  const userPlan = req.session?.user?.plan || 'free';
  
  if (userPlan !== 'premium') {
    return res.status(403).json({ 
      success: false, 
      message: 'Bu özellik Premium üyelikle kullanılabilir',
      upgrade: true
    });
  }
  
  next();
};

/**
 * Limit bilgilerini template'e geç
 */
const setPlanLimits = (req, res, next) => {
  const userPlan = req.session?.user?.plan || 'free';
  const limits = PLAN_LIMITS[userPlan];
  
  res.locals.planLimits = limits;
  res.locals.isPremium = userPlan === 'premium';
  res.locals.userPlan = userPlan;
  
  next();
};

module.exports = {
  checkParticipantLimit,
  canCreateRoom,
  requirePremium,
  setPlanLimits,
  PLAN_LIMITS
};
