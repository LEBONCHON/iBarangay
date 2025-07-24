const express = require('express');
const router = express.Router();
const auth = require('./authMiddleware');
const User = require('./userModel');
const jwt = require('jsonwebtoken');

// Debug route
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working' });
});

// Register a new resident user (default role)
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);

    const { username, password, firstName, lastName, email } = req.body;

    if (!username || !password || !email) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Username, password, and email are required'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({
        success: false,
        message: 'Username or email already in use'
      });
    }

    // Create new user with default role "resident"
    const newUser = new User({
      username,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      role: 'resident' // default role
    });

    await newUser.save();
    console.log('User registered successfully');

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login for both admin and resident (with username OR email)
router.post('/login', async (req, res) => {
  try {
    // Accept either username or email for login
    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username or email and password are required'
      });
    }

    const user = await User.findOne(
      username ? { username } : { email }
    );

    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password'
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const redirectUrl = user.role === 'admin' ? '/adminWebApp' : '/ibarangayFront';

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      redirectUrl
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

module.exports = router;