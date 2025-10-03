const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllCustomers,
  getCustomerDetails,
  getPolicyStatistics,
  getClaimStatistics,
  getRevenueStatistics,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes are admin only
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Customer management
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomerDetails);

// Statistics
router.get('/statistics/policies', getPolicyStatistics);
router.get('/statistics/claims', getClaimStatistics);
router.get('/statistics/revenue', getRevenueStatistics);

module.exports = router;