const mongoose = require('mongoose');

const insurancePlanSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    planName: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    planType: {
      type: String,
      required: true,
      enum: ['Term Life', 'Savings', 'Retirement', 'Child Education'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    minCoverage: {
      type: Number,
      required: [true, 'Minimum coverage is required'],
      min: 0,
    },
    maxCoverage: {
      type: Number,
      required: [true, 'Maximum coverage is required'],
      min: 0,
    },
    monthlyPremiumRate: {
      type: Number,
      required: [true, 'Monthly premium rate is required'],
      min: 0,
      description: 'Premium rate per 1M coverage',
    },
    minAge: {
      type: Number,
      required: true,
      min: 18,
    },
    maxAge: {
      type: Number,
      required: true,
      max: 100,
    },
    duration: {
      type: Number,
      required: [true, 'Policy duration is required'],
      min: 1,
      description: 'Duration in years',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
insurancePlanSchema.index({ planName: 'text', description: 'text' });

module.exports = mongoose.model('InsurancePlan', insurancePlanSchema);