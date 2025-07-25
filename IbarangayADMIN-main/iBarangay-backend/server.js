require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const userRoutes = require('./userRoutes');
let adminRoutes;
try {
  adminRoutes = require('./adminRoutes');
} catch (err) {
  console.warn('⚠️ adminRoutes.js not found or failed to load.');
}
const requestRoutes = require('./requestRoutes');

const app = express();

// ✅ Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());

// ✅ Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Session Middleware (MUST be after MongoDB connection)
app.use(session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 2, httpOnly: true, sameSite: 'lax' }
}));

// ✅ API Routes
app.use('/api/users', userRoutes);
if (adminRoutes) {
  app.use('/api/admin', adminRoutes);
}
app.use('/api/requests', requestRoutes);

// ✅ Serve uploaded files (for download/view in profile)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Serve static adminweb frontend at /adminweb (case-insensitive and supports all admin pages)
app.use('/adminweb', express.static(path.join(__dirname, '../adminweb')));

// ✅ Serve static user frontend at /
app.use(express.static(path.join(__dirname, '../FrontiBarangay')));

// ✅ Root redirect to index.html for user frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontiBarangay/index.html'));
});

// ✅ Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// ✅ Fallback for adminweb: redirect /adminweb to /adminweb/index.html
app.get('/adminweb', (req, res) => {
  res.sendFile(path.join(__dirname, '../adminweb/index.html'));
});

// ✅ Optionally, fallback for unknown routes (404)
// app.use((req, res) => {
//   res.status(404).send('Page not found');
// });

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`User frontend:  http://localhost:${PORT}/`);
  console.log(`Admin frontend: http://localhost:${PORT}/adminweb/`);
});