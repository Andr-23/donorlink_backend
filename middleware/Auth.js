import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res
      .status(401)
      .send({ message: 'No token provided, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .send({ message: 'User not found, authorization denied' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Token is not valid' });
  }
};

export default auth;
