require('dotenv').config();
const mongoose = require('mongoose');
const Career = require('../models/Career');
const careers = require('./careers.json');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Career.deleteMany({});
    const inserted = await Career.insertMany(careers);
    console.log(`Seeded ${inserted.length} careers`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();