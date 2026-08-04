import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const token =
    req.headers.authorization?.startsWith('Bearer ') &&
    req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(id);

    if (!req.user) {
      throw new Error();
    }

    next();
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired session',
    });
  }
};

export const allow =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      message: 'You do not have access to this resource',
    });
  };