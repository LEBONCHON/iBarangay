
const express = require('express');
const router = express.Router();
const Admin = require('./Admin');
const adminAuth = require('./adminAuth');

// Admin Login (session-based)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const match = await admin.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    // Set session
    req.session.adminId = admin._id;
    req.session.adminEmail = admin.email;
    res.json({ success: true, message: 'Login successful', user: { email: admin.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin Session Check
router.get('/session', (req, res) => {
  if (req.session && req.session.adminId) {
    res.json({ loggedIn: true, user: req.session.adminEmail });
  } else {
    res.json({ loggedIn: false });
  }
});

// Admin Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Server error during logout' });
    }
    res.clearCookie('connect.sid'); // or your session cookie name
    res.json({ success: true, message: 'Logged out' });
  });
});

// Example: Protected admin-only route
router.get('/dashboard', adminAuth, (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard!' });
});

module.exports = router;