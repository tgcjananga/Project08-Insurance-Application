const InsurancePlan = require('../models/InsurancePlan');

// @desc    Get all insurance plans
// @route   GET /api/plans
// @access  Public
const getAllPlans = async (req, res) => {
  try {
    const { planType, minCoverage, maxCoverage, search } = req.query;

    // Build filter object
    let filter = { isActive: true };

    // Filter by plan type
    if (planType) {
      filter.planType = planType;
    }

    // Filter by coverage range
    if (minCoverage) {
      filter.minCoverage = { $gte: Number(minCoverage) };
    }
    if (maxCoverage) {
      filter.maxCoverage = { $lte: Number(maxCoverage) };
    }

    // Search by name or description
    if (search) {
      filter.$text = { $search: search };
    }

    const plans = await InsurancePlan.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error('Get all plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plans',
    });
  }
};

// @desc    Get single insurance plan
// @route   GET /api/plans/:id
// @access  Public
const getPlanById = async (req, res) => {
  try {
    const plan = await InsurancePlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Insurance plan not found',
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Get plan by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plan',
    });
  }
};

// @desc    Create new insurance plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = async (req, res) => {
  try {
    const {
      planId,
      planName,
      planType,
      description,
      minCoverage,
      maxCoverage,
      monthlyPremiumRate,
      minAge,
      maxAge,
      duration,
    } = req.body;

    // Check if planId already exists
    const planExists = await InsurancePlan.findOne({ planId });
    if (planExists) {
      return res.status(400).json({
        success: false,
        message: 'Plan with this ID already exists',
      });
    }

    // Create plan
    const plan = await InsurancePlan.create({
      planId,
      planName,
      planType,
      description,
      minCoverage,
      maxCoverage,
      monthlyPremiumRate,
      minAge,
      maxAge,
      duration,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Insurance plan created successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating plan',
    });
  }
};

// @desc    Update insurance plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
const updatePlan = async (req, res) => {
  try {
    let plan = await InsurancePlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Insurance plan not found',
      });
    }

    // Update plan
    plan = await InsurancePlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated document
        runValidators: true, // Run model validators
      }
    );

    res.status(200).json({
      success: true,
      message: 'Insurance plan updated successfully',
      data: plan,
    });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating plan',
    });
  }
};

// @desc    Delete insurance plan (soft delete - set isActive to false)
// @route   DELETE /api/plans/:id
// @access  Private/Admin
const deletePlan = async (req, res) => {
  try {
    const plan = await InsurancePlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Insurance plan not found',
      });
    }

    // Soft delete - set isActive to false
    plan.isActive = false;
    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Insurance plan deleted successfully',
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting plan',
    });
  }
};

// @desc    Get plan types (for filter dropdown)
// @route   GET /api/plans/types
// @access  Public
const getPlanTypes = async (req, res) => {
  try {
    const types = await InsurancePlan.distinct('planType', { isActive: true });

    res.status(200).json({
      success: true,
      data: types,
    });
  } catch (error) {
    console.error('Get plan types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching plan types',
    });
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getPlanTypes,
};