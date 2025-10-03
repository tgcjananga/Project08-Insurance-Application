const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['NIC', 'death_certificate', 'medical_report', 'policy_document', 'other'],
  },
  url: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const claimSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    policyId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimType: {
      type: String,
      required: true,
      enum: ['maturity', 'death', 'critical_illness', 'accident'],
    },
    claimAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['FILED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID'],
      default: 'FILED',
    },
    documents: [documentSchema],
    reviewNotes: {
      type: String,
      default: '',
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
claimSchema.index({ userId: 1, status: 1 });
claimSchema.index({ policyId: 1 });
claimSchema.index({ claimId: 1 });

module.exports = mongoose.model('Claim', claimSchema);