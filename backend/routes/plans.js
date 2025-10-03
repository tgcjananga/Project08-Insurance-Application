const express = require('express');
const router = express.Router();
const {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanTypes,
} = require('../controllers/planController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getAllPlans);
router.get('/types', getPlanTypes);
router.get('/:id', getPlanById);

// Admin only routes
router.post('/', protect, adminOnly, createPlan);
router.put('/:id', protect, adminOnly, updatePlan);
router.delete('/:id', protect, adminOnly, deletePlan);

module.exports = router;