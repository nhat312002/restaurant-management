const mongoose = require('mongoose');

const hoaDonSchema = new mongoose.Schema({
  tenBan: String,
  danhSachMon: [
    {
      ten: String,
      gia: Number,
      soLuong: Number,
    }
  ],
  trangThai: {
    type: String,
    enum: ['trong', 'dat-truoc', 'co-khach'],
    default: 'co-khach',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('HoaDon', hoaDonSchema);