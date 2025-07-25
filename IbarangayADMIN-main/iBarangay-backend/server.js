require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();

// Models
const Admin = require('./admin'); // Mongoose model: admin.js

// Routes
const userRoutes = require('./userRoutes');
const requestRoutes = require('./requestRoutes');
const adminRoutes = require('./adminRoutes');

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Session Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 2, httpOnly: true, sameSite: 'lax' }
}));

// Centralized Admin Login Endpoint (optional, if not using /api/admin/login)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body; // Use 'email' to match model
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ message: 'Invalid email or password' });
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

  req.session.adminId = admin._id;
  req.session.adminEmail = admin.email;
  res.json({ message: 'Login successful', email: admin.email });
});

// Session Check Endpoint
app.get('/api/check-session', (req, res) => {
  if (req.session && req.session.adminId) {
    res.json({ loggedIn: true, email: req.session.adminEmail });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

// Logout Endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

// Protect /adminweb
app.use('/adminweb', (req, res, next) => {
  if (req.session && req.session.adminId) {
    next();
  } else {
    if (req.accepts(['html', 'json']) === 'json' || req.xhr) {
      res.status(401).json({ message: 'Unauthorized' });
    } else {
      res.redirect('/login.html');
    }
  }
});

// Serve static adminweb frontend at /adminweb
app.use('/adminweb', express.static(path.join(__dirname, '../adminweb')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/requests', requestRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static user frontend at /
app.use(express.static(path.join(__dirname, '../FrontiBarangay')));

// Root redirect to index.html for user frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontiBarangay/index.html'));
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Fallback for adminweb: redirect /adminweb to /adminweb/index.html
app.get('/adminweb', (req, res) => {
  res.sendFile(path.join(__dirname, '../adminweb/index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`User frontend:  http://localhost:${PORT}/`);
  console.log(`Admin frontend: http://localhost:${PORT}/adminweb/`);
});