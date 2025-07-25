// middleware/adminAuth.js
// Admin session authentication middleware

module.exports = (req, res, next) => {
  // Check if the session exists and contains the adminId (set after successful admin login)
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
 

  next();
};