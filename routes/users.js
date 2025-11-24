import express from 'express';
import { configDotenv } from 'dotenv';
import User from '../models/User.js';
import { Error } from 'mongoose';
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

usersRouter.put('/:id', auth, permit(['admin']), async (req, res, next) => {
  try {
    if (
      req.user._id.toString() !== req.params.id &&
      req.user.role !== 'admin'
    ) {
      res
        .status(403)
        .send({ error: 'You do not have permission to update this user' });
      return;
    }

    const { email, password } = req.body;
    const updateData = {};

    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      if (password.length < 5) {
        res.status(400).send({ error: 'Password must be more than 5 symbols' });
        return;
      }
      updateData.password = password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      res.status(404).send({ error: 'User not found' });
      return;
    }

    res.status(200).send(user);
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      res.status(422).send({ error: e });
      return;
    }
    next(e);
  }
});

usersRouter.delete('/:id', auth, permit(['admin']), async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (e) {
    next(e);
  }
});

export default usersRouter;
