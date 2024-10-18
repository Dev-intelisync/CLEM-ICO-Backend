// models/Newsletter.js
const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

module.exports = Newsletter;
