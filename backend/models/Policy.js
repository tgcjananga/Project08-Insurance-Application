const mongoose = require('mongoose');

const beneficiarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  relationship: {
    type: String,
    required: true,
    trim: true,
  },
  nic: {
    type: String,
    required: true,
    trim: true,
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

const policySchema = new mongoose.Schema(
  {
    policyId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planId: {
      type: String,
      required: true,
    },
    // Snapshot of plan details at purchase time
    planName: {
      type: String,
      required: true,
    },
    planType: {
      type: String,
      required: true,
    },
    coverageAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    premiumAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    premiumFrequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'annually'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'ACTIVE', 'LAPSED', 'CANCELLED', 'MATURED'],
      default: 'REQUESTED',
    },
    beneficiaries: [beneficiarySchema],
    policyDocumentURL: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
policySchema.index({ userId: 1, status: 1 });
policySchema.index({ policyId: 1 });

module.exports = mongoose.model('Policy', policySchema);