require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

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
app.use(cors());
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

// ✅ API Routes
app.use('/api/users', userRoutes);
if (adminRoutes) {
  app.use('/api/admin', adminRoutes);
}
app.use('/api/requests', requestRoutes);

// ✅ Serve uploaded files (for download/view in profile)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Serve static frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../FrontiBarangay')));

// ✅ Root redirect to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FrontiBarangay/index.html'));
});

// ✅ Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});