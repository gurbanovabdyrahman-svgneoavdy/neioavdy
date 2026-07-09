/**
 * Authentication Routes
 * ====================================
 * /api/auth/* endpoint'leri
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireLogin } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Yeni kullanıcı kaydı
 * Body: { username, email, password, confirmPassword }
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Kullanıcı girişi
 * Body: { email, password }
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/logout
 * Çıkış
 */
router.post('/logout', authController.logout);

/**
 * GET /api/auth/profile
 * Profil bilgileri (Login gerekli)
 */
router.get('/profile', requireLogin, authController.getProfile);

module.exports = router;
