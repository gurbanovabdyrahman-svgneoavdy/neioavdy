/**
 * Room Model (Mongoose Şeması)
 * ====================================
 * Oda bilgilerini saklar:
 * - Oda ID
 * - Sahibi (User ID)
 * - Katılımcılar
 * - Maks katılımcı
 * - Oda durumu
 * - Oluşturma tarihi
 */

const mongoose = require('mongoose');

/**
 * Oda Şeması
 */
const roomSchema = new mongoose.Schema({
  // Oda bilgileri
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  
  description: {
    type: String,
    default: '',
    maxlength: 200
  },
  
  // Sahibi
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Katılımcılar
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    socketId: String,
    username: String,
    joinedAt: {
      type: Date,
      default: Date.now
    },
    micEnabled: Boolean,
    cameraEnabled: Boolean,
    screenSharing: Boolean
  }],
  
  // Limitler
  maxParticipants: {
    type: Number,
    default: 5
  },
  
  maxDurationMinutes: {
    type: Number,
    default: 30
  },
  
  screenQuality: {
    type: String,
    enum: ['720p', '1080p'],
    default: '720p'
  },
  
  // Durum
  status: {
    type: String,
    enum: ['active', 'ended'],
    default: 'active'
  },
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Tarihler
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  endedAt: Date,
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

/**
 * Katılımcı ekle
 */
roomSchema.methods.addParticipant = function(participantData) {
  if (this.participants.length >= this.maxParticipants) {
    throw new Error('Oda dolu');
  }
  this.participants.push(participantData);
  return this.save();
};

/**
 * Katılımcı çıkar
 */
roomSchema.methods.removeParticipant = function(socketId) {
  this.participants = this.participants.filter(p => p.socketId !== socketId);
  return this.save();
};

/**
 * Odayı kapat
 */
roomSchema.methods.endRoom = function() {
  this.status = 'ended';
  this.endedAt = Date.now();
  return this.save();
};

module.exports = mongoose.model('Room', roomSchema);
