import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const verifyRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).send({ error: 'Update refresh token' });
    return;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH);
  } catch (error) {
    res.status(401).send({ error: 'Invalid refresh token' });
    return;
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    res.status(401).send({ error: 'User not found' });
    return;
  }

  req.user = user;
  next();
};

export default verifyRefreshToken;
