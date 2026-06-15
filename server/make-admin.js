require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide a user email address.');
  console.log('Usage: node make-admin.js <email>');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in your environment (.env file).');
  process.exit(1);
}

const run = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully.');

    console.log(`🔍 Finding user with email: ${email}...`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log(`ℹ️ User ${email} is already an admin.`);
      process.exit(0);
    }

    user.role = 'admin';
    await user.save();
    console.log(`🎉 Success! User ${email} has been promoted to 'admin'.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error promoting user:', error);
    process.exit(1);
  }
};

run();
