import express from 'express';
import config from './config.js';
import cors from 'cors';

const app = express();
const localhost = `http://localhost:${config.port}`;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

app.use('/users', (await import('./routes/users.js')).default);

const run = async () => {
  app.listen(config.port, () => {
    console.log(`Server is running on ${localhost}`);
  });
};

void run();
