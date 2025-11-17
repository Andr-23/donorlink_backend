import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const verifyRefreshToken = async (req, res, next) => {
  const refreshToken = res.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).send({ error: 'Update refresh token' });
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH);
  } catch (error) {
    return res.status(401).send({ error: 'Invalid refresh token' });
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return res.status(401).send({ error: 'User not found' });
  }

  req.user = user;
  next();
};

export default verifyRefreshToken;
