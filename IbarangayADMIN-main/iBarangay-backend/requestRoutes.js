const express = require('express');
const router = express.Router();
const Request = require('./requestFile');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

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

// Upload a file to a request (can be extended to support multiple files)
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
    // You can allow front-end to specify the field name or just use a default.
    const field = req.body.field || 'uploadedFile' + Date.now();
    request.files[field] = fileData;
    await request.save();

    res.json({ success: true, file: fileData });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create a new request (example, adjust as needed)
router.post('/', async (req, res) => {
  try {
    const request = new Request(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: "Error creating request", error: err.message });
  }
});

// (Optional) Delete a request by ID
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