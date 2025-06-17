
function loadKhoHang() {
  fetch('http://192.168.0.124:3000/api/khohang')
    .then(res => res.json())
    .then(dsKho => {
      dsKho.forEach(mon => {
        const itemDiv = document.querySelector(`.item[data-name="${mon.ten}"]`);
        if (itemDiv) {
          const infoDiv = itemDiv.querySelector('.so-luong-hien-co');
          if (infoDiv) {
            infoDiv.textContent = `Sẵn có: ${mon.soLuong}`;
          }
        }
      });
    })
    .catch(err => {
      console.error("Lỗi khi lấy dữ liệu kho:", err);
    });
}


document.addEventListener('DOMContentLoaded', () => {
  loadKhoHang();
});

document.querySelectorAll('.item input').forEach(input => {
  input.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter') {
      const itemDiv = input.closest('.item');
      const ten = itemDiv.getAttribute('data-name');
      const soLuong = parseInt(input.value);

      if (isNaN(soLuong) || soLuong <= 0) {
        alert("❌ Nhập số lượng không hợp lệ!");
        return;
      }

      try {
        const res = await fetch('/api/khohang/nhap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ten, soLuong })
        });

        const data = await res.json();

        if (res.ok) {
          alert(`✅ Đã nhập kho: ${ten} +${soLuong}`);

          const infoDiv = itemDiv.querySelector('.so-luong-hien-co');
          if (infoDiv) {
            const tongMoi = data.mon.soLuong;
            infoDiv.textContent = `Sẵn có: ${tongMoi}`;
          }

        } else {
          alert(`❌ Lỗi: ${data.message}`);
        }
      } catch (err) {
        console.error(err);
        alert("❌ Lỗi khi kết nối server");
      }
    }
  });
});


