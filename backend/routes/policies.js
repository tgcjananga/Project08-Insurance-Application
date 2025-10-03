const express = require('express');
const router = express.Router();
const {
  requestPolicy,
  getMyPolicies,
  getPolicyById,
  getAllPolicies,
  approvePolicy,
  rejectPolicy,
  updatePolicyStatus,
  calculatePremium,
} = require('../controllers/policyController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.post('/calculate-premium', calculatePremium);

// Customer routes (Protected)
router.post('/', protect, requestPolicy);
router.get('/my-policies', protect, getMyPolicies);
router.get('/:id', protect, getPolicyById);

// Admin routes
router.get('/', protect, adminOnly, getAllPolicies);
router.put('/:id/approve', protect, adminOnly, approvePolicy);
router.put('/:id/reject', protect, adminOnly, rejectPolicy);
router.put('/:id/status', protect, adminOnly, updatePolicyStatus);

module.exports = router;