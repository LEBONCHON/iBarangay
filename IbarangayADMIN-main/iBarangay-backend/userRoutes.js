const express = require('express');
const router = express.Router();
const User = require('./userModel');
const jwt = require('jsonwebtoken');

// Debug route
router.get('/test', (req, res) => {
  res.json({ message: 'User routes working' });
});

// Register a new user (frontBarangay only)
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    
    // Extract fields with clear logging
    const { username, password, firstName, lastName, email } = req.body;
    console.log('Extracted fields:', { 
      username, 
      password: '***', // Don't log actual password
      firstName, 
      lastName, 
      email 
    });
    
    // Validate required fields
    if (!username || !password || !email) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Username, password, and email are required'
      });
    }
    
    // Check if user already exists
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
    
    // Create new user
    console.log('Creating new user...');
    const newUser = new User({
      username,
      password, // Will be hashed by the pre-save hook
      firstName: firstName || '',
      lastName: lastName || '',
      email
    });
    
    console.log('Saving user...');
    await newUser.save();
    console.log('User saved successfully');
    
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

// Login for frontBarangay users
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', { 
      username: req.body.username,
      password: '***' // Don't log actual password
    });
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
    
    console.log('Login successful for user:', username);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
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