const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Transaction = require('./transactionModel'); // or create a LoginLog model


const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'resident' 
  });

  res.status(201).json({ message: 'User registered successfully' });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const redirectUrl = user.role === 'admin' ? '/adminWebApp' : '/ibarangayFront';

  res.status(200).json({
    message: 'Login successful',
    token,
    role: user.role,
    redirectUrl
  });
};

// After successful login
await Transaction.create({
  action: 'login',
  userId: user._id,
  description: 'User logged in'
});

// After failed login
await Transaction.create({
  action: 'login-failed',
  userId: null,
  description: `Failed login for email: ${email}`
});

module.exports = { registerUser, loginUser };

