import User from '../models/User.js';

const checkNotBanned = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      res.status(404).send({ error: 'User not found' });
      return;
    }

    if (user.banned) {
      res.status(403).send({ error: 'Your account is banned' });
      return;
    }

    next();
  } catch (e) {
    next(e);
  }
};

export default checkNotBanned;
