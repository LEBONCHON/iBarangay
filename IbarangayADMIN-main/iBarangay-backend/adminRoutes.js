const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Debug route
router.get('/test', (req, res) => {
  res.json({ message: 'Admin routes working' });
});

// Admin login (credentials set in .env)
router.post('/login', async (req, res) => {
  try {
    console.log('Admin login request received');
    
    const { username, password } = req.body;
    
    // Check against environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (username !== adminUsername || password !== adminPassword) {
      console.log('Invalid admin credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }
    
    console.log('Admin login successful');
    
    // Generate JWT token for admin
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        username: adminUsername,
        role: 'admin'
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});

module.exports = router;