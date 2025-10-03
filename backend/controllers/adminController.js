const User = require('../models/User');
const InsurancePlan = require('../models/InsurancePlan');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalPlans = await InsurancePlan.countDocuments({ isActive: true });
    const totalPolicies = await Policy.countDocuments();
    const totalClaims = await Claim.countDocuments();

    // Policy statistics by status
    const policyStats = await Policy.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' },
          totalPremium: { $sum: '$premiumAmount' },
        },
      },
    ]);

    // Claim statistics by status
    const claimStats = await Claim.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$claimAmount' },
        },
      },
    ]);

    // Active policies count
    const activePolicies = await Policy.countDocuments({ status: 'ACTIVE' });

    // Pending policy requests
    const pendingPolicies = await Policy.countDocuments({ status: 'REQUESTED' });

    // Pending claims (FILED + UNDER_REVIEW)
    const pendingClaims = await Claim.countDocuments({
      status: { $in: ['FILED', 'UNDER_REVIEW'] },
    });

    // Calculate total revenue (monthly premiums from active policies)
    const revenueData = await Policy.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $group: {
          _id: null,
          totalMonthlyRevenue: { $sum: '$premiumAmount' },
        },
      },
    ]);

    const totalMonthlyRevenue = revenueData.length > 0 ? revenueData[0].totalMonthlyRevenue : 0;

    // Calculate total approved claim amount
    const approvedClaimAmount = await Claim.aggregate([
      { $match: { status: { $in: ['APPROVED', 'PAID'] } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$claimAmount' },
        },
      },
    ]);

    const totalApprovedClaims = approvedClaimAmount.length > 0 ? approvedClaimAmount[0].totalAmount : 0;

    // Policy distribution by type
    const policyTypeDistribution = await Policy.aggregate([
      { $match: { status: { $in: ['ACTIVE', 'REQUESTED'] } } },
      {
        $group: {
          _id: '$planType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Recent policies (last 10)
    const recentPolicies = await Policy.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'fullName email')
      .select('policyId planName status coverageAmount createdAt');

    // Recent claims (last 10)
    const recentClaims = await Claim.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'fullName email')
      .select('claimId claimType status claimAmount createdAt');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          totalPlans,
          totalPolicies,
          totalClaims,
          activePolicies,
          pendingPolicies,
          pendingClaims,
          totalMonthlyRevenue,
          totalApprovedClaims,
        },
        policyStats,
        claimStats,
        policyTypeDistribution,
        recentPolicies,
        recentClaims,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics',
    });
  }
};

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getAllCustomers = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = { role: 'customer' };

    // Search by name, email, or NIC
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { nic: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    // Get policy count for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const policyCount = await Policy.countDocuments({ userId: customer._id });
        const claimCount = await Claim.countDocuments({ userId: customer._id });
        
        return {
          ...customer.toObject(),
          policyCount,
          claimCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: customersWithStats.length,
      data: customersWithStats,
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customers',
    });
  }
};

// @desc    Get customer details with policies and claims
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
const getCustomerDetails = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    if (customer.role !== 'customer') {
      return res.status(400).json({
        success: false,
        message: 'User is not a customer',
      });
    }

    // Get customer's policies
    const policies = await Policy.find({ userId: customer._id }).sort({ createdAt: -1 });

    // Get customer's claims
    const claims = await Claim.find({ userId: customer._id }).sort({ createdAt: -1 });

    // Calculate statistics
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.status === 'ACTIVE').length;
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => c.status === 'APPROVED' || c.status === 'PAID').length;

    const totalCoverage = policies.reduce((sum, p) => sum + p.coverageAmount, 0);
    const totalPremiums = policies
      .filter(p => p.status === 'ACTIVE')
      .reduce((sum, p) => sum + p.premiumAmount, 0);

    res.status(200).json({
      success: true,
      data: {
        customer,
        statistics: {
          totalPolicies,
          activePolicies,
          totalClaims,
          approvedClaims,
          totalCoverage,
          totalMonthlyPremiums: totalPremiums,
        },
        policies,
        claims,
      },
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customer details',
    });
  }
};

// @desc    Get policy statistics
// @route   GET /api/admin/statistics/policies
// @access  Private/Admin
const getPolicyStatistics = async (req, res) => {
  try {
    // Policies by status
    const byStatus = await Policy.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' },
          avgCoverage: { $avg: '$coverageAmount' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Policies by type
    const byType = await Policy.aggregate([
      {
        $group: {
          _id: '$planType',
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Policies by premium frequency
    const byFrequency = await Policy.aggregate([
      {
        $group: {
          _id: '$premiumFrequency',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premiumAmount' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Monthly trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrend = await Policy.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          totalCoverage: { $sum: '$coverageAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus,
        byType,
        byFrequency,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error('Get policy statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching policy statistics',
    });
  }
};

// @desc    Get claim statistics
// @route   GET /api/admin/statistics/claims
// @access  Private/Admin
const getClaimStatistics = async (req, res) => {
  try {
    // Claims by status
    const byStatus = await Claim.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$claimAmount' },
          avgAmount: { $avg: '$claimAmount' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Claims by type
    const byType = await Claim.aggregate([
      {
        $group: {
          _id: '$claimType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$claimAmount' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Monthly trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrend = await Claim.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$claimAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Approval rate
    const totalClaims = await Claim.countDocuments();
    const approvedClaims = await Claim.countDocuments({ status: { $in: ['APPROVED', 'PAID'] } });
    const rejectedClaims = await Claim.countDocuments({ status: 'REJECTED' });
    
    const approvalRate = totalClaims > 0 ? ((approvedClaims / totalClaims) * 100).toFixed(2) : 0;
    const rejectionRate = totalClaims > 0 ? ((rejectedClaims / totalClaims) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        byStatus,
        byType,
        monthlyTrend,
        rates: {
          approvalRate: `${approvalRate}%`,
          rejectionRate: `${rejectionRate}%`,
          totalClaims,
          approvedClaims,
          rejectedClaims,
        },
      },
    });
  } catch (error) {
    console.error('Get claim statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching claim statistics',
    });
  }
};

// @desc    Get revenue statistics
// @route   GET /api/admin/statistics/revenue
// @access  Private/Admin
const getRevenueStatistics = async (req, res) => {
  try {
    // Total revenue from active policies
    const activeRevenue = await Policy.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $group: {
          _id: '$premiumFrequency',
          totalPremium: { $sum: '$premiumAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate projected annual revenue
    let projectedAnnualRevenue = 0;
    activeRevenue.forEach(item => {
      if (item._id === 'monthly') {
        projectedAnnualRevenue += item.totalPremium * 12;
      } else if (item._id === 'quarterly') {
        projectedAnnualRevenue += item.totalPremium * 4;
      } else if (item._id === 'annually') {
        projectedAnnualRevenue += item.totalPremium;
      }
    });

    // Total coverage provided
    const totalCoverageData = await Policy.aggregate([
      { $match: { status: { $in: ['ACTIVE', 'REQUESTED'] } } },
      {
        $group: {
          _id: null,
          totalCoverage: { $sum: '$coverageAmount' },
        },
      },
    ]);

    const totalCoverage = totalCoverageData.length > 0 ? totalCoverageData[0].totalCoverage : 0;

    const claimsPayout = await Claim.aggregate([
      { $match: { status: { $in: ['APPROVED', 'PAID'] } } },
      {
        $group: {
          _id: null,
          totalPayout: { $sum: '$claimAmount' },
        },
      },
    ]);

    const totalClaimsPayout = claimsPayout.length > 0 ? claimsPayout[0].totalPayout : 0;

    res.status(200).json({
      success: true,
      data: {
        activeRevenue,
        projectedAnnualRevenue,
        totalCoverage,
        totalClaimsPayout,
        netPosition: projectedAnnualRevenue - totalClaimsPayout,
      },
    });
  } catch (error) {
    console.error('Get revenue statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching revenue statistics',
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllCustomers,
  getCustomerDetails,
  getPolicyStatistics,
  getClaimStatistics,
  getRevenueStatistics,
};