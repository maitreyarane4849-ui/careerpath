const mongoose = require('mongoose');
console.log('URI starts with:', JSON.stringify(process.env.MONGO_URI?.slice(0, 20)));
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;