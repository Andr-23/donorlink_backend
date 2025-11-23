import mongoose from 'mongoose';
import config from './config.js';
import User from './models/User.js';

const dropCollection = async (db, collectionName) => {
  try {
    await db.dropCollection(collectionName);
  } catch (_e) {
    console.log(`Collection ${collectionName} was missing, skipping drop....`);
  }
};

const collections = ['users'];

const run = async () => {
  try {
    await mongoose.connect(config.mongoose.db);
    const db = mongoose.connection;

    for (const collectionName of collections) {
      await dropCollection(db, collectionName);
    }

    await User.create([
      {
        username: 'adminuser',
        email: 'admin@gmail.com',
        password: 'adminpass',
        roles: ['admin'],
      },
      {
        username: 'regularuser',
        email: 'regular@gmail.com',
        password: 'regularpass',
        roles: ['user'],
      },
    ]);

    console.log('Fixture data has been successfully set up.');

    await db.close();
  } catch (e) {
    console.error('Error during fixture setup:', e);
  }
};

void run();
