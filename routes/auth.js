import express from 'express';
import { configDotenv } from 'dotenv';
import User from '../models/User.js';
import { Error } from 'mongoose';
import verifyRefreshToken from '../middleware/VerifyRefreshToken.js';
import jwt from 'jsonwebtoken';
import config from '../config.js';

configDotenv();

const authRouter = express.Router();

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS, {
    expiresIn: `${config.JwtAccessExpiresAt}m`,
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH, {
    expiresIn: `${config.JwtRefreshExpiresAt}h`,
  });

  return { accessToken, refreshToken };
};

authRouter.post('/register', async (req, res, next) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      gender,
      dateOfBirth,
      bloodType,
      address,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).send({ error: 'This email is already taken.' });
      return;
    }

    const user = new User({
      email,
      password,
      fullName,
      phone,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      bloodType,
      address,
    });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });

    res.status(201).send({ accessToken, user });
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
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).send({ error: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.checkPassword(password))) {
      res.status(401).send({ error: 'Invalid email or password' });
      return;
    }
    const { accessToken, refreshToken } = generateTokens(user._id);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });

    res.status(200).send({ accessToken, user });
  } catch (e) {
    if (e instanceof Error.ValidationError) {
      res.status(422).send({ error: e });
      return;
    }
    next(e);
  }
});

authRouter.post('/refresh', verifyRefreshToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(401).send({ error: 'User not found' });
      return;
    }
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      maxAge: config.JwtRefreshExpiresAt * 60 * 60 * 1000, // Convert hours to milliseconds
    });
    res.status(200).send({ accessToken, user });
  } catch (e) {
    next(e);
  }
});

authRouter.post('/logout', verifyRefreshToken, async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'None',
    });
    res.status(200).send({ message: 'Logged out successfully' });
  } catch (e) {
    next(e);
  }
});

export default authRouter;
