const express = require('express');
const router = express.Router();
const Admin = require('./models/Admin'); // Adjust the path if needed

// Admin login (checks MongoDB, uses session)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const match = await admin.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    // Set session
    req.session.adminId = admin._id;
    req.session.adminUsername = admin.username;
    res.json({ success: true, message: 'Login successful', user: { username: admin.username } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out' });
  });
});

// Check session route
router.get('/session', (req, res) => {
  res.json({ loggedIn: !!req.session.adminId, user: req.session.adminUsername });
});

// Example protected route
router.get('/protected', (req, res) => {
  if (!req.session.adminId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ message: "You are authenticated as admin." });
});

module.exports = router;