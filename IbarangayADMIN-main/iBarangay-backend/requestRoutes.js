const express = require('express');
const router = express.Router();
const Request = require('./requestFile');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('./authMiddleware'); // JWT auth middleware

// Get requests for the currently logged-in user (JWT-auth protected)
router.get('/mine', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }
    const requests = await Request.find({ residentId: userId })
      .sort({ dateRequested: -1 })
      .populate('residentId', 'firstName lastName email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all requests (with resident info)
router.get('/all', async (req, res) => {
  try {
    const requests = await Request.find()
      .sort({ dateRequested: -1 })
      .populate('residentId', 'firstName lastName email');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get a single request by ID (with resident info)
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('residentId', 'firstName lastName email');
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update the status of a request
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Upload a file to a request (for additional file uploads to an existing request)
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const fileData = {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size
    };
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (!request.files || typeof request.files !== "object") request.files = {};
    const field = req.body.field || 'uploadedFile' + Date.now();
    request.files[field] = fileData;
    await request.save();

    res.json({ success: true, file: fileData });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create a new request (with text fields and file uploads)
router.post('/', auth, upload.any(), async (req, res) => {
  try {
    // Map uploaded files by field name
    let filesMap = {};
    if (req.files) {
      req.files.forEach(file => {
        filesMap[file.fieldname] = {
          originalname: file.originalname,
          mimetype: file.mimetype,
          filename: file.filename,
          path: file.path,
          size: file.size
        };
      });
    }

    // Prepare the request data
    const newRequest = {
      ...req.body, // All text fields from the form as strings
      residentId: req.user.id, // From JWT
      files: filesMap
    };

    const request = new Request(newRequest);
    await request.save();
    res.status(201).json({ success: true, request });
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(400).json({ message: "Error creating request", error: err.message });
  }
});

// Delete a request by ID
router.delete('/:id', async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;