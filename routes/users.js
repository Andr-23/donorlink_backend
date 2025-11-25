import express from 'express';
import { configDotenv } from 'dotenv';
import User from '../models/User.js';
import auth from '../middleware/Auth.js';
import permit from '../middleware/Permit.js';

configDotenv();

const usersRouter = express.Router();

usersRouter.get('/:id', auth, permit(['admin']), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send({ error: 'User not found' });
      return;
    }
    res.status(200).send(user);
  } catch (e) {
    next(e);
  }
});

usersRouter.get('/', auth, permit(['admin']), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.status(200).send({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (e) {
    next(e);
  }
});

usersRouter.patch(
  '/toggle-ban/:id',
  auth,
  permit(['admin']),
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404).send({ error: 'User not found' });
        return;
      }

      if (user.roles.includes('admin')) {
        res.status(403).send({ error: 'Cannot ban an admin' });
        return;
      }

      if (String(req.user._id) === String(user._id)) {
        res.status(403).send({ error: 'You cannot ban yourself' });
        return;
      }

      user.banned = !Boolean(user.banned);
      await user.save();

      res.status(200).send({
        message: `User ${user.banned ? 'banned' : 'unbanned'} successfully`,
        user,
      });
    } catch (e) {
      next(e);
    }
  }
);

export default usersRouter;
