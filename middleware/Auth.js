import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    res
      .status(401)
      .send({ message: 'No token provided, authorization denied' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS);
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).send({ message: 'User not found, authorization denied' });
      return;
    }
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ message: 'Token is not valid' });
  }
};

export default auth;
