const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // or customize storage as needed
const Request = require('./requestFile');
const auth = require('./authMiddleware');

// CREATE a new request (user submits a document request)
router.post('/', auth, upload.any(), async (req, res) => {
  try {
    // Save all form fields (from req.body) and all file info (from req.files)
    const files = {};
    if (req.files && req.files.length) {
      req.files.forEach(f => {
        files[f.fieldname] = {
          originalname: f.originalname,
          mimetype: f.mimetype,
          filename: f.filename,
          path: f.path,
          size: f.size
        };
      });
    }
    const requestData = {
      residentId: new mongoose.Types.ObjectId(req.user.id),
      ...req.body, // saves ALL fields from the form
      files,       // saves ALL uploaded files (grouped by input name)
      status: 'cart' // <-- NEW: Start in 'cart' status
    };
    const newRequest = new Request(requestData);
    await newRequest.save();
    res.status(201).json({ success: true, request: newRequest });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ success: false, message: 'Server error while creating request.' });
  }
});

// GET all requests for the logged-in user
router.get('/mine', auth, async (req, res) => {
  try {
    const requests = await Request.find({ residentId: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching requests.' });
  }
});

// CHECKOUT: Move all 'cart' requests to 'pending' for this user
router.post('/checkout', auth, async (req, res) => {
  try {
    await Request.updateMany(
      { residentId: req.user.id, status: 'cart' },
      { $set: { status: 'pending' } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error during checkout:', err);
    res.status(500).json({ success: false, message: 'Checkout failed' });
  }
});

module.exports = router;