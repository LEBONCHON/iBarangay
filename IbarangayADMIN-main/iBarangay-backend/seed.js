const mongoose = require('mongoose');
const User = require('./userModel'); // adjust path if needed

mongoose.connect('mongodb://127.0.0.1:27017/iBarangay')
  .then(async () => {
    const user = new User({
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });

    await user.save();
    console.log('Test user saved!');
    mongoose.disconnect();
  })
  .catch(err => console.error('MongoDB connection error:', err));
