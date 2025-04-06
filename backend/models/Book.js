const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  author: {
    type: [String],
    required: [true, 'Please add at least one author']
  },
  publishYear: {
    type: Number
  },
  ISBN: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['read', 'reading', 'to-read'],
    default: 'to-read'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', BookSchema);
