import express from 'express';
import { configDotenv } from 'dotenv';

configDotenv();

const usersRouter = express.Router();

usersRouter.get('/', async (_req, res, next) => {
  res.send({ message: 'List of users would be returned here.' });
});

usersRouter.post('/', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = { username, email, password };
    res.status(201).send({ message: 'User created', user });
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
