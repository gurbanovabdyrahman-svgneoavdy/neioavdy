/**
 * Payment Routes
 * ====================================
 * /api/payment/* endpoint'leri
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireLogin } = require('../middleware/auth');

/**
 * POST /api/payment/start
 * Ödeme başlat
 * Body: { planType, provider }
 */
router.post('/start', requireLogin, paymentController.startPayment);

/**
 * GET /api/payment/result
 * Ödeme sonucu (Callback)
 */
router.get('/result', paymentController.handlePaymentResult);

/**
 * GET /api/payment/status
 * Ödeme durumu sorgusu
 */
router.get('/status', requireLogin, paymentController.getPaymentStatus);

module.exports = router;
