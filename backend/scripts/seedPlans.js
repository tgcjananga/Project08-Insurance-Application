const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path'); // Add this
const InsurancePlan = require('../models/InsurancePlan');

// Load .env from parent directory (backend folder)
dotenv.config({ path: path.join(__dirname, '../.env') }); 

const samplePlans = [
  {
    planId: 'PLAN-001',
    planName: 'Family Protection Term Life',
    planType: 'Term Life',
    description: 'Comprehensive term life coverage for your family\'s financial security. Provides death benefit to protect your loved ones.',
    minCoverage: 500000,
    maxCoverage: 10000000,
    monthlyPremiumRate: 2500, // per 1M coverage
    minAge: 18,
    maxAge: 65,
    duration: 20,
    isActive: true,
  },
  {
    planId: 'PLAN-002',
    planName: 'Wealth Builder Savings Plan',
    planType: 'Savings',
    description: 'Build wealth over time with guaranteed returns. Combines insurance protection with savings benefits.',
    minCoverage: 1000000,
    maxCoverage: 15000000,
    monthlyPremiumRate: 3000,
    minAge: 18,
    maxAge: 60,
    duration: 15,
    isActive: true,
  },
  {
    planId: 'PLAN-003',
    planName: 'Golden Years Retirement Plan',
    planType: 'Retirement',
    description: 'Secure your retirement with guaranteed pension income. Start planning your golden years today.',
    minCoverage: 2000000,
    maxCoverage: 20000000,
    monthlyPremiumRate: 4000,
    minAge: 25,
    maxAge: 55,
    duration: 25,
    isActive: true,
  },
  {
    planId: 'PLAN-004',
    planName: 'Future Scholars Child Education Plan',
    planType: 'Child Education',
    description: 'Invest in your child\'s education future. Guaranteed funds for university and higher education.',
    minCoverage: 1500000,
    maxCoverage: 12000000,
    monthlyPremiumRate: 3500,
    minAge: 20,
    maxAge: 50,
    duration: 18,
    isActive: true,
  },
  {
    planId: 'PLAN-005',
    planName: 'Secure Future Term Life',
    planType: 'Term Life',
    description: 'Affordable term life insurance with flexible coverage options. Simple, straightforward protection.',
    minCoverage: 300000,
    maxCoverage: 5000000,
    monthlyPremiumRate: 1500,
    minAge: 18,
    maxAge: 70,
    duration: 15,
    isActive: true,
  },
];

const seedPlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing plans
    await InsurancePlan.deleteMany();
    console.log('Cleared existing plans');

    // Insert sample plans
    await InsurancePlan.insertMany(samplePlans);
    console.log('✅ Sample insurance plans created successfully');
    console.log(`📊 Created ${samplePlans.length} plans`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
};

seedPlans();