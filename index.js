import express from 'express';
import config from './config.js';
import cors from 'cors';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import donationsRouter from './routes/donations.js';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

const app = express();
const localhost = `http://localhost:${config.port}`;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/donations', donationsRouter);

const run = async () => {
  try {
    await mongoose.connect(config.mongoose.db);
    app.listen(config.port, (e) => {
      if (!e) {
        console.log(`Server is running on ${localhost}`);
      } else {
        console.log('Server Error:', e);
      }
    });

    process.on('SIGINT', async () => {
      await mongoose.disconnect();
      console.log('MongoDB disconnected on app termination');
      process.exit(0);
    });
  } catch (_e) {
    process.on('uncaughtException', async (e) => {
      await mongoose.disconnect();
      console.log('Uncaught exception: ', e);
      process.exit(1);
    });
  }
};

void run();
