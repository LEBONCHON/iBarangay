const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'yourSecretKey';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: "Access denied" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(403).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
