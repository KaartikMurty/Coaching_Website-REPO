const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.wrap = fn => (req, res, next) => fn(req, res, next).catch(next);

exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'Please log in' });
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(id).select('-passwordHash');
    if (!user || user.isActive === false) return res.status(401).json({ message: 'This account is not active' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Log in again.' });
  }
};

// Role check runs on the server, so hiding a button in React is never the only protection.
exports.allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Not allowed' });
