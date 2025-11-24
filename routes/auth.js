import express from 'express';
import { configDotenv } from 'dotenv';
import User from '../models/User.js';
import { Error } from 'mongoose';
import auth from '../middleware/Auth.js';
import jwt from 'jsonwebtoken';
import config from '../config.js';

configDotenv();

const authRouter = express.Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).send({ error: 'This email is already taken.' });
      return;
    }

    const user = new User({ email, password });
    await user.save();

    res.status(201).send(user);
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      res.status(422).send({ error: e });
      return;
    }
    next(e);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.checkPassword(password))) {
      res.status(401).send({ error: 'Invalid email or password' });
      return;
    }
    const accessToken = jwt.sign(
      { userId: user._id },
      `${process.env.JWT_ACCESS}`,
      { expiresIn: `${config.JwtAccessExpiresAt}m` }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      `${process.env.JWT_REFRESH}`,
      { expiresIn: `${config.JwtRefreshExpiresAt}h` }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });

    res.status(200).send({ accessToken, user });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/logout', auth, async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });
    res.status(200).send({ message: 'Logged out successfully' });
  } catch (e) {
    next(e);
  }
});

export default authRouter;
