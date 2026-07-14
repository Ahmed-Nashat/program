import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const upgradeToSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const email = 'ahmadnashat04@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email ${email} not found.`);
    } else {
      user.role = 'superadmin';
      await user.save();
      console.log(`Successfully upgraded ${email} to superadmin!`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error upgrading user:', error);
    process.exit(1);
  }
};

upgradeToSuperAdmin();
