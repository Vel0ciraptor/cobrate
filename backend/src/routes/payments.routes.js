const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', paymentsController.getPayments);
router.post('/', paymentsController.createPayment);
router.delete('/:id', paymentsController.deletePayment);

module.exports = router;
