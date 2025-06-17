require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const cors = require('cors');
const path = require('path');

const Ban = require('./models/ban');
const HoaDon = require('./models/hoadon');
const KhoHang = require('./models/khohang');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
console.log("URI MongoDB thực tế:", process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Đã kết nối MongoDB'))
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// ===== API TẠO HÓA ĐƠN =====
app.post('/api/hoadon', async (req, res) => {
  try {
    const { tenBan, danhSachMon, trangThai } = req.body;
    const monHet = [];

    for (const mon of danhSachMon) {
      const itemKho = await KhoHang.findOne({ ten: mon.ten });

      if (!itemKho || itemKho.soLuong < mon.soLuong) {
        monHet.push(mon.ten);
      }
    }

    if (monHet.length > 0) {
      return res.status(400).json({ message: `Hết món`, monHet });
    }

    for (const mon of danhSachMon) {
      const itemKho = await KhoHang.findOne({ ten: mon.ten });
      itemKho.soLuong -= mon.soLuong;
      await itemKho.save();
    }

    const hoaDon = new HoaDon({
      tenBan,
      danhSachMon,
      trangThai: trangThai || 'co-khach',
    });

    const ketQua = await hoaDon.save();
    res.status(201).json(ketQua);
  } catch (error) {
    console.error("Lỗi khi lưu hóa đơn:", error);
    res.status(500).json({ message: "Lỗi server khi lưu hóa đơn" });
  }
});


// ===== LẤY HÓA ĐƠN THEO BÀN =====
app.get("/api/hoadon/:tenBan", async (req, res) => {
  try {
    const tenBan = decodeURIComponent(req.params.tenBan).trim();

    const hoaDon = await HoaDon.findOne({
      tenBan: tenBan,
      trangThai: "co-khach"
    });

    if (!hoaDon) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    }

    res.json(hoaDon);
  } catch (err) {
    console.error("Lỗi lấy hóa đơn:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

router.put("/api/hoadon", async (req, res) => {
  const { tenBan, danhSachMon } = req.body;

  try {
    const hoaDon = await HoaDon.findOne({ tenBan });

    if (!hoaDon) {
      return res.status(404).json({ error: "Không tìm thấy hóa đơn cho bàn này." });
    }

    // Duyệt từng món mới và cập nhật hoặc thêm vào danh sách
    danhSachMon.forEach(monMoi => {
      const monCu = hoaDon.danhSachMon.find(m => m.ten === monMoi.ten);
      if (monCu) {
        monCu.soLuong += monMoi.soLuong;
      } else {
        hoaDon.danhSachMon.push(monMoi);
      }
    });

    await hoaDon.save();
    res.json(hoaDon);
  } catch (err) {
    console.error("Lỗi khi cập nhật hóa đơn:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});


// ===== THANH TOÁN (ĐỔI TRẠNG THÁI HÓA ĐƠN) =====
app.post('/api/hoadon/thanhtoan', async (req, res) => {
  try {
    const { tenBan } = req.body;

    const hoaDon = await HoaDon.findOneAndUpdate(
      { tenBan, trangThai: 'co-khach' },
      { trangThai: 'trong' },
      { new: true }
    );

    if (!hoaDon) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn để thanh toán' });
    }

    res.json({ message: 'Đã thanh toán', hoaDon });
  } catch (error) {
    console.error("Lỗi khi thanh toán:", error);
    res.status(500).json({ message: "Lỗi server khi thanh toán" });
  }
});

// ===== LẤY TOÀN BỘ KHO HÀNG =====
// LẤY TOÀN BỘ DỮ LIỆU KHO
app.get('/api/khohang', async (req, res) => {
  try {
    const danhSach = await KhoHang.find({});
    res.json(danhSach);
  } catch (err) {
    console.error("Lỗi khi lấy kho hàng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy kho hàng" });
  }
});

// ===== NHẬP HÀNG VÀO KHO =====
app.post('/api/khohang/nhap', async (req, res) => {
  try {
    const { ten, soLuong } = req.body;

    if (!ten || !soLuong || soLuong <= 0) {
      return res.status(400).json({ message: "Tên và số lượng hợp lệ là bắt buộc." });
    }

    let mon = await KhoHang.findOne({ ten });

    if (mon) {
      mon.soLuong += soLuong;
    } else {
      mon = new KhoHang({ ten, soLuong });
    }

    await mon.save();
    res.json({ message: "✅ Đã nhập kho thành công", mon });
  } catch (err) {
    console.error("Lỗi khi nhập kho:", err);
    res.status(500).json({ message: "Lỗi server khi nhập kho" });
  }
});



// ===== SERVE FILE TĨNH =====
app.use(express.static(path.join(__dirname, '..')));

// ===== TRANG CHỦ =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../trangchu.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server chạy tại: http://localhost:${PORT}`);
});
