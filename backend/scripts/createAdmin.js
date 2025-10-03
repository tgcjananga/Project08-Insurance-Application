const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from parent directory (backend folder)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import User model with correct path
const User = require(path.join(__dirname, '../models/User'));

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@ceylinco.com' });
    
    if (adminExists) {
      console.log('⚠️  Admin already exists');
      console.log('📧 Email: admin@ceylinco.com');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      email: 'admin@ceylinco.com',
      password: 'admin123',
      fullName: 'System Administrator',
      dateOfBirth: '1985-01-01',
      gender: 'male',
      nic: '198500100001',
      phone: '+94771111111',
      address: 'Ceylinco Head Office, Colombo',
      role: 'admin',
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@ceylinco.com');
    console.log('🔑 Password: admin123');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();