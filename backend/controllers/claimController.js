const Claim = require('../models/Claim');
const Policy = require('../models/Policy');

// Helper function to generate unique Claim ID
const generateClaimId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digit random
  return `CLM-${year}-${random}`;
};

// @desc    File a new claim
// @route   POST /api/claims
// @access  Private (Customer)
const fileClaim = async (req, res) => {
  try {
    const { policyId, claimType, claimAmount, reason } = req.body;

    // Validate policy exists and belongs to user
    const policy = await Policy.findOne({ policyId });
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found',
      });
    }

    // Check if policy belongs to user
    if (policy.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to file claim for this policy',
      });
    }

    // Check if policy is active
    if (policy.status !== 'ACTIVE' && policy.status !== 'MATURED') {
      return res.status(400).json({
        success: false,
        message: 'Can only file claims for ACTIVE or MATURED policies',
      });
    }

    // Validate claim amount doesn't exceed coverage
    if (claimAmount > policy.coverageAmount) {
      return res.status(400).json({
        success: false,
        message: `Claim amount cannot exceed policy coverage of ${policy.coverageAmount}`,
      });
    }


    let documents = [];
    
    // console.log('req.files:', req.files); // Debug log
    // console.log('req.files type:', typeof req.files); // Debug log
    // console.log('req.files keys:', req.files ? Object.keys(req.files) : 'none'); // Debug log
    
    if (req.files) {
      for (const fieldName in req.files) {
        const filesArray = req.files[fieldName]; 
        
        if (Array.isArray(filesArray)) {
          filesArray.forEach((file) => {
            // console.log(`Processing file - Field: ${fieldName}, Path: ${file.path}`); // Debug
            documents.push({
              type: fieldName,
              url: file.path, // Cloudinary URL
              uploadedAt: new Date(),
            });
          });
        }
      }
    }
    
    // console.log('Final documents array:', documents); // Debug log
    // console.log('Documents count:', documents.length); // Debug log

    // Validate that at least NIC is uploaded
    const hasNIC = documents.some(doc => doc.type === 'NIC');
    if (!hasNIC) {
      return res.status(400).json({
        success: false,
        message: 'NIC document is required',
      });
    }

    // Create claim
    const claim = await Claim.create({
      claimId: generateClaimId(),
      policyId: policy.policyId,
      userId: req.user._id,
      claimType,
      claimAmount,
      reason,
      status: 'FILED',
      documents: documents, 
    });

    console.log('Created claim with documents:', claim.documents); // Debug log

    res.status(201).json({
      success: true,
      message: 'Claim filed successfully. Awaiting review.',
      data: claim,
    });
  } catch (error) {
    console.error('File claim error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while filing claim',
    });
  }
};

// @desc    Upload additional documents to existing claim
// @route   POST /api/claims/:id/upload
// @access  Private (Customer)
const uploadClaimDocuments = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    // Check authorization
    if (claim.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload documents for this claim',
      });
    }

    // Can only upload to FILED or UNDER_REVIEW claims
    if (claim.status !== 'FILED' && claim.status !== 'UNDER_REVIEW') {
      return res.status(400).json({
        success: false,
        message: 'Cannot upload documents to processed claims',
      });
    }

    // Handle uploaded files - CORRECTED VERSION
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const newDocuments = [];
    
    for (const fieldName in req.files) {
      const filesArray = req.files[fieldName];
      
      if (Array.isArray(filesArray)) {
        filesArray.forEach((file) => {
          newDocuments.push({
            type: fieldName,
            url: file.path,
            uploadedAt: new Date(),
          });
        });
      }
    }

    console.log('New documents to add:', newDocuments); // Debug log

    // Add to existing documents
    claim.documents.push(...newDocuments);
    await claim.save();

    console.log('Claim after adding documents:', claim.documents); // Debug log

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: claim,
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading documents',
    });
  }
};
// @desc    Get all claims for logged-in user
// @route   GET /api/claims/my-claims
// @access  Private (Customer)
const getMyClaims = async (req, res) => {
  try {
    const { status } = req.query;

    // Build filter
    let filter = { userId: req.user._id };
    if (status) {
      filter.status = status;
    }

    const claims = await Claim.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName email phone');

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error('Get my claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching claims',
    });
  }
};

// @desc    Get single claim by ID
// @route   GET /api/claims/:id
// @access  Private
const getClaimById = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('userId', 'fullName email phone nic address')
      .populate('reviewedBy', 'fullName email');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    // Check authorization
    if (
      req.user.role !== 'admin' &&
      claim.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this claim',
      });
    }

    res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    console.error('Get claim by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching claim',
    });
  }
};

// @desc    Get all claims (Admin)
// @route   GET /api/claims
// @access  Private/Admin
const getAllClaims = async (req, res) => {
  try {
    const { status, claimType, policyId } = req.query;

    // Build filter
    let filter = {};
    if (status) filter.status = status;
    if (claimType) filter.claimType = claimType;
    if (policyId) filter.policyId = policyId;

    const claims = await Claim.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName email phone nic')
      .populate('reviewedBy', 'fullName email');

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error('Get all claims error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching claims',
    });
  }
};

// @desc    Update claim status to UNDER_REVIEW (Admin)
// @route   PUT /api/claims/:id/review
// @access  Private/Admin
const reviewClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    if (claim.status !== 'FILED') {
      return res.status(400).json({
        success: false,
        message: 'Only FILED claims can be moved to review',
      });
    }

    claim.status = 'UNDER_REVIEW';
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    await claim.save();

    res.status(200).json({
      success: true,
      message: 'Claim moved to review',
      data: claim,
    });
  } catch (error) {
    console.error('Review claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reviewing claim',
    });
  }
};

// @desc    Approve claim (Admin)
// @route   PUT /api/claims/:id/approve
// @access  Private/Admin
const approveClaim = async (req, res) => {
  try {
    const { reviewNotes } = req.body;

    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    if (claim.status !== 'UNDER_REVIEW') {
      return res.status(400).json({
        success: false,
        message: 'Only claims under review can be approved',
      });
    }

    claim.status = 'APPROVED';
    claim.reviewNotes = reviewNotes || 'Claim approved';
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    await claim.save();

    res.status(200).json({
      success: true,
      message: 'Claim approved successfully',
      data: claim,
    });
  } catch (error) {
    console.error('Approve claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving claim',
    });
  }
};

// @desc    Reject claim (Admin)
// @route   PUT /api/claims/:id/reject
// @access  Private/Admin
const rejectClaim = async (req, res) => {
  try {
    const { reviewNotes } = req.body;

    if (!reviewNotes) {
      return res.status(400).json({
        success: false,
        message: 'Review notes are required for rejection',
      });
    }

    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    if (claim.status !== 'UNDER_REVIEW') {
      return res.status(400).json({
        success: false,
        message: 'Only claims under review can be rejected',
      });
    }

    claim.status = 'REJECTED';
    claim.reviewNotes = reviewNotes;
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = new Date();
    await claim.save();

    res.status(200).json({
      success: true,
      message: 'Claim rejected',
      data: claim,
    });
  } catch (error) {
    console.error('Reject claim error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting claim',
    });
  }
};

// @desc    Mark claim as PAID (Admin)
// @route   PUT /api/claims/:id/pay
// @access  Private/Admin
const markClaimAsPaid = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found',
      });
    }

    if (claim.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Only approved claims can be marked as paid',
      });
    }

    claim.status = 'PAID';
    await claim.save();

    res.status(200).json({
      success: true,
      message: 'Claim marked as paid',
      data: claim,
    });
  } catch (error) {
    console.error('Mark paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking claim as paid',
    });
  }
};

module.exports = {
  fileClaim,
  uploadClaimDocuments,
  getMyClaims,
  getClaimById,
  getAllClaims,
  reviewClaim,
  approveClaim,
  rejectClaim,
  markClaimAsPaid,
};