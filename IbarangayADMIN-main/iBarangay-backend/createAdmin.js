require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./admin');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'admin@example.com'; // Change as needed
  const password = 'yourpassword';   // Change as needed

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('Admin with this email already exists.');
    process.exit();
  }

  const hash = await bcrypt.hash(password, 10);
  const admin = new Admin({ email, password: hash });
  await admin.save();
  console.log('✅ Admin created!');
  mongoose.disconnect();
}

createAdmin().catch(err => {
  console.error(err);
  mongoose.disconnect();
});