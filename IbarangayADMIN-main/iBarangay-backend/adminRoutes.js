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