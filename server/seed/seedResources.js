require('dotenv').config();
const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const resources = require('./resources.json');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Resource.deleteMany({});
    const inserted = await Resource.insertMany(resources);
    console.log(`Seeded ${inserted.length} resources`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();