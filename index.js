import express from 'express';
import config from './config.js';

const app = express();
const localhost = `http://localhost:${config.port}`;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

const run = async () => {
  app.listen(config.port, () => {
    console.log(`Server is running on ${localhost}`);
  });
};

void run();
