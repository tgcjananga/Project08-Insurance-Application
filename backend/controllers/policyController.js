const Policy = require('../models/Policy');
const InsurancePlan = require('../models/InsurancePlan');

// Helper function to generate unique Policy ID
const generatePolicyId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digit random
  return `POL-${year}-${random}`;
};

// @desc    Request a new policy (Purchase)
// @route   POST /api/policies
// @access  Private (Customer)
const requestPolicy = async (req, res) => {
  try {
    const {
      planId,
      coverageAmount,
      premiumFrequency,
      beneficiaries,
    } = req.body;

    // Validate plan exists
    const plan = await InsurancePlan.findOne({ planId, isActive: true });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Insurance plan not found or inactive',
      });
    }

    // Validate coverage amount is within plan limits
    if (coverageAmount < plan.minCoverage || coverageAmount > plan.maxCoverage) {
      return res.status(400).json({
        success: false,
        message: `Coverage amount must be between ${plan.minCoverage} and ${plan.maxCoverage}`,
      });
    }

    // Calculate premium based on coverage
    let premiumAmount = (coverageAmount / 1000000) * plan.monthlyPremiumRate;

    // Adjust premium based on frequency
    if (premiumFrequency === 'quarterly') {
      premiumAmount = premiumAmount * 3 * 0.96; // 4% discount
    } else if (premiumFrequency === 'annually') {
      premiumAmount = premiumAmount * 12 * 0.90; // 10% discount
    }

    premiumAmount = Math.round(premiumAmount);

    // Calculate start and end dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Policy starts in 7 days

    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + plan.duration);

    // Validate beneficiaries total percentage = 100%
    const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage !== 100) {
      return res.status(400).json({
        success: false,
        message: 'Beneficiaries percentage must total 100%',
      });
    }

    // Create policy
    const policy = await Policy.create({
      policyId: generatePolicyId(),
      userId: req.user._id,
      planId: plan.planId,
      planName: plan.planName,
      planType: plan.planType,
      coverageAmount,
      premiumAmount,
      premiumFrequency,
      startDate,
      endDate,
      status: 'REQUESTED',
      beneficiaries,
    });

    res.status(201).json({
      success: true,
      message: 'Policy request submitted successfully. Awaiting admin approval.',
      data: policy,
    });
  } catch (error) {
    console.error('Request policy error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while requesting policy',
    });
  }
};

// @desc    Get all policies for logged-in user
// @route   GET /api/policies/my-policies
// @access  Private (Customer)
const getMyPolicies = async (req, res) => {
  try {
    const { status } = req.query;

    // Build filter
    let filter = { userId: req.user._id };
    if (status) {
      filter.status = status;
    }

    const policies = await Policy.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName email phone');

    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies,
    });
  } catch (error) {
    console.error('Get my policies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching policies',
    });
  }
};

// @desc    Get single policy by ID
// @route   GET /api/policies/:id
// @access  Private
const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('userId', 'fullName email phone nic address');

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
    }

    // Check if user is authorized to view this policy
    // Customer can only view their own policies, admin can view all
    if (
      req.user.role !== 'admin' &&
      policy.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this policy',
      });
    }

    res.status(200).json({
      success: true,
      data: policy,
    });
  } catch (error) {
    console.error('Get policy by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching policy',
    });
  }
};

// @desc    Get all policies (Admin)
// @route   GET /api/policies
// @access  Private/Admin
const getAllPolicies = async (req, res) => {
  try {
    const { status, userId, planType } = req.query;

    // Build filter
    let filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (planType) filter.planType = planType;

    const policies = await Policy.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName email phone nic');

    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies,
    });
  } catch (error) {
    console.error('Get all policies error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching policies',
    });
  }
};

// @desc    Approve policy request (Admin)
// @route   PUT /api/policies/:id/approve
// @access  Private/Admin
const approvePolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
    }

    if (policy.status !== 'REQUESTED') {
      return res.status(400).json({
        success: false,
        message: 'Only policies with REQUESTED status can be approved',
      });
    }

    // Update policy status
    policy.status = 'ACTIVE';
    
    // Generate policy document URL (simulated)
    policy.policyDocumentURL = `https://res.cloudinary.com/demo/policy_${policy.policyId}.pdf`;
    
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Policy approved successfully',
      data: policy,
    });
  } catch (error) {
    console.error('Approve policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving policy',
    });
  }
};

// @desc    Reject policy request (Admin)
// @route   PUT /api/policies/:id/reject
// @access  Private/Admin
const rejectPolicy = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
    }

    if (policy.status !== 'REQUESTED') {
      return res.status(400).json({
        success: false,
        message: 'Only policies with REQUESTED status can be rejected',
      });
    }

    // Update policy status
    policy.status = 'CANCELLED';
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Policy rejected successfully',
      data: policy,
    });
  } catch (error) {
    console.error('Reject policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting policy',
    });
  }
};

// @desc    Update policy status (Admin)
// @route   PUT /api/policies/:id/status
// @access  Private/Admin
const updatePolicyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['REQUESTED', 'ACTIVE', 'LAPSED', 'CANCELLED', 'MATURED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
    }

    policy.status = status;
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Policy status updated successfully',
      data: policy,
    });
  } catch (error) {
    console.error('Update policy status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating policy status',
    });
  }
};

// @desc    Calculate premium quote (before purchasing)
// @route   POST /api/policies/calculate-premium
// @access  Public
const calculatePremium = async (req, res) => {
  try {
    const { planId, coverageAmount, premiumFrequency } = req.body;

    // Validate plan exists
    const plan = await InsurancePlan.findOne({ planId, isActive: true });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Insurance plan not found',
      });
    }

    // Validate coverage amount
    if (coverageAmount < plan.minCoverage || coverageAmount > plan.maxCoverage) {
      return res.status(400).json({
        success: false,
        message: `Coverage amount must be between ${plan.minCoverage} and ${plan.maxCoverage}`,
      });
    }

    // Calculate premium
    let premiumAmount = (coverageAmount / 1000000) * plan.monthlyPremiumRate;
    let discount = 0;

    if (premiumFrequency === 'quarterly') {
      premiumAmount = premiumAmount * 3;
      discount = 4;
      premiumAmount = premiumAmount * 0.96;
    } else if (premiumFrequency === 'annually') {
      premiumAmount = premiumAmount * 12;
      discount = 10;
      premiumAmount = premiumAmount * 0.90;
    }

    premiumAmount = Math.round(premiumAmount);

    res.status(200).json({
      success: true,
      data: {
        planName: plan.planName,
        coverageAmount,
        premiumFrequency,
        premiumAmount,
        discount: `${discount}%`,
        duration: `${plan.duration} years`,
      },
    });
  } catch (error) {
    console.error('Calculate premium error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating premium',
    });
  }
};

module.exports = {
  requestPolicy,
  getMyPolicies,
  getPolicyById,
  getAllPolicies,
  approvePolicy,
  rejectPolicy,
  updatePolicyStatus,
  calculatePremium,
};