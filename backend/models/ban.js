const mongoose = require('mongoose');

const banSchema = new mongoose.Schema({
  soBan: { type: String, required: true, unique: true },
  trangThai: {
    type: String,
    enum: ['trong', 'dat-truoc', 'co-khach'],
    default: 'trong',
  }
});

module.exports = mongoose.model('Ban', banSchema);