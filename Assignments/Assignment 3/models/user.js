const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  title: String,
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
  house: String,
  postcode: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
