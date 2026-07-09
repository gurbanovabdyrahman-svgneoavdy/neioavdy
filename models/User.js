/**
 * User Model (Mongoose Şeması)
 * ====================================
 * Kullanıcı bilgilerini saklar:
 * - Ad, Email, Şifre
 * - Plan (free/premium)
 * - Premium son tarihi
 * - Oluşturma tarihi
 */

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

/**
 * Kullanıcı Şeması
 */
const userSchema = new mongoose.Schema({
  // Temel bilgiler
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  
  passwordHash: {
    type: String,
    required: true
  },
  
  // Plan
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  
  // Premium üyelik bitiş tarihi
  premiumUntil: {
    type: Date,
    default: null
  },
  
  // Profil
  avatar: {
    type: String,
    default: null
  },
  
  // İstatistikler
  totalRooms: {
    type: Number,
    default: 0
  },
  
  totalMinutes: {
    type: Number,
    default: 0
  },
  
  // Tarihler
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

/**
 * Şifre kaydetmeden önce hash'le
 */
userSchema.pre('save', async function(next) {
  // Şifre değişmediyse atla
  if (!this.isModified('passwordHash')) return next();
  
  try {
    // Şifre hash'le (bcryptjs)
    const salt = await bcryptjs.genSalt(10);
    this.passwordHash = await bcryptjs.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Şifre doğrula
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.passwordHash);
};

/**
 * Premium aktif mi?
 */
userSchema.methods.isPremium = function() {
  if (this.plan !== 'premium') return false;
  if (!this.premiumUntil) return false;
  return new Date() < this.premiumUntil;
};

/**
 * Public bilgiler (şifre hariç)
 */
userSchema.methods.toPublic = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    plan: this.plan,
    isPremium: this.isPremium(),
    premiumUntil: this.premiumUntil,
    avatar: this.avatar,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
