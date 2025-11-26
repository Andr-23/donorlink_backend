import express from 'express';
import { configDotenv } from 'dotenv';
import User from '../models/User.js';
import auth from '../middleware/Auth.js';
import permit from '../middleware/Permit.js';

configDotenv();

const usersRouter = express.Router();

usersRouter.get('/:id', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      res.status(404).send({ error: 'User not found' });
      return;
    }

    if (
      !req.user ||
      (!req.user.roles.includes('admin') &&
        String(req.user._id) !== String(user._id))
    ) {
      res.status(403).send({ error: 'Forbidden' });
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
      const updatedUser = await user.toggleBan();
      res.status(200).send({
        message: `User ${
          updatedUser.status === 'banned' ? 'banned' : 'unbanned'
        } successfully`,
        user: updatedUser,
      });
    } catch (e) {
      next(e);
    }
  }
);

usersRouter.put('/:id', auth, async (req, res, next) => {
  try {
    const allowed = [
      'email',
      'fullName',
      'phone',
      'gender',
      'dateOfBirth',
      'bloodType',
      'address',
      'medicalHistory',
    ];

    if (
      !req.user ||
      (!req.user.roles.includes('admin') &&
        String(req.user._id) !== String(req.params.id))
    ) {
      res.status(403).send({ error: 'Forbidden' });
      return;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).send({ error: 'User not found' });
      return;
    }

    if (req.body.email && req.body.email !== user.email) {
      const exists = await User.findOne({ email: req.body.email });
      if (exists) {
        res.status(400).send({ error: 'Email is already taken' });
        return;
      }
    }

    allowed.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    const sanitized = user.toObject ? user.toObject() : user;
    if (sanitized.password) delete sanitized.password;

    res.status(200).send(sanitized);
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      res.status(422).send({ error: e });
      return;
    }
    next(e);
  }
});

export default usersRouter;
