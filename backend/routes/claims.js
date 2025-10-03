const express = require('express');
const router = express.Router();
const {
  fileClaim,
  uploadClaimDocuments,
  getMyClaims,
  getClaimById,
  getAllClaims,
  reviewClaim,
  approveClaim,
  rejectClaim,
  markClaimAsPaid,
} = require('../controllers/claimController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Customer routes (Protected)
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'NIC', maxCount: 1 },
    { name: 'death_certificate', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'policy_document', maxCount: 1 },
    { name: 'other', maxCount: 3 },
  ]),
  fileClaim
);

router.post(
  '/:id/upload',
  protect,
  upload.fields([
    { name: 'NIC', maxCount: 1 },
    { name: 'death_certificate', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'policy_document', maxCount: 1 },
    { name: 'other', maxCount: 3 },
  ]),
  uploadClaimDocuments
);

router.get('/my-claims', protect, getMyClaims);
router.get('/:id', protect, getClaimById);

// Admin routes
router.get('/', protect, adminOnly, getAllClaims);
router.put('/:id/review', protect, adminOnly, reviewClaim);
router.put('/:id/approve', protect, adminOnly, approveClaim);
router.put('/:id/reject', protect, adminOnly, rejectClaim);
router.put('/:id/pay', protect, adminOnly, markClaimAsPaid);


// Add this at the end, before module.exports
router.get('/debug/:id', protect, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    res.json({
      success: true,
      data: claim,
      documentsCount: claim.documents?.length || 0,
      documents: claim.documents
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;