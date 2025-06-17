const mongoose = require('mongoose');

const khoHangSchema = new mongoose.Schema({
  ten: { type: String, required: true, unique: true },
  soLuong: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('KhoHang', khoHangSchema);
