import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
});
const User = mongoose.model('User', userSchema);

async function upgrade() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    if (users.length > 0) {
      // Upgrade the first user found (or latest) to admin, and the second to instructor
      if (users[0]) {
        users[0].role = 'admin';
        await users[0].save();
        console.log(`Upgraded ${users[0].email} to ADMIN`);
      }
      if (users[1]) {
        users[1].role = 'instructor';
        await users[1].save();
        console.log(`Upgraded ${users[1].email} to INSTRUCTOR`);
      }
    } else {
      console.log('No users found in database.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
upgrade();
