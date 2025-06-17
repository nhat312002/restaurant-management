const banGrid = document.getElementById("banGrid");
const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popupTitle");
const popupButtons = document.getElementById("popupButtons");
const menuPopup = document.getElementById("menuPopup");

let selectedBan = null;

for (let i = 1; i <= 20; i++) {
  const ban = document.createElement("div");
  ban.classList.add("ban", "trong");
  ban.innerText = `Bàn ${i}`;
  ban.dataset.trangthai = "trong";

  ban.addEventListener("click", () => {
    selectedBan = ban;
    const trangThai = ban.dataset.trangthai;
    const soBan = ban.innerText;
    const banInfo = document.getElementById("banInfo");

    if (trangThai === "co-khach") {
      loadHoaDon(soBan);
    } else {
      banInfo.innerHTML = `
      <strong>${soBan}</strong><br>
      Trạng thái: <strong>${trangThai.replace("-", " ")}</strong>
      <p>Chưa có hóa đơn.</p>
    `;
    }


    popupButtons.innerHTML = "";
    popupTitle.innerText = `Bàn ${i}`;

    if (trangThai === "trong") {
      addPopupButton("Đặt bàn", () => {
        ban.classList.remove("trong");
        ban.classList.add("dat-truoc");
        ban.dataset.trangthai = "dat-truoc";
        closePopup();
      });

      addPopupButton("Gọi món", () => {
        openMenu();
        closePopup();
      });

    } else if (trangThai === "co-khach") {
      addPopupButton("Xem hóa đơn", () => {
        const tenBan = ban.innerText.trim();
        fetch(`http://192.168.0.124:3000/api/hoadon/${encodeURIComponent(tenBan)}`)
          .then(res => res.json())
          .then(data => {
            let content = `<h3>${data.tenBan}</h3>`;
            content += `<ul>`;
            let tongTien = 0;
            data.danhSachMon.forEach(mon => {
              const thanhTien = mon.gia * mon.soLuong;
              tongTien += thanhTien;
              content += `<li>${mon.ten} - ${mon.soLuong} x ${mon.gia.toLocaleString()}₫ = ${thanhTien.toLocaleString()}₫</li>`;
            });
            content += `</ul><p><strong>Tổng tiền: ${tongTien.toLocaleString()}₫</strong></p>`;
            content += `<button onclick="thanhToan('${tenBan}')">Đã thanh toán</button>`;

            document.getElementById("banInfo").innerHTML = content;
            closePopup();
          })
          .catch(err => {
            alert("Không tìm thấy hóa đơn!");
            console.error("Lỗi khi lấy hóa đơn:", err);
          });
      });


      addPopupButton("Gọi thêm món", () => {
        openMenu(true);
        closePopup();
      });

    } else if (trangThai === "dat-truoc") {
      addPopupButton("Gọi món", () => {
        openMenu();
        closePopup();
      });

      addPopupButton("Hủy đặt bàn", () => {
        ban.classList.remove("dat-truoc");
        ban.classList.add("trong");
        ban.dataset.trangthai = "trong";
        closePopup();
      });
    }

    popup.style.display = "flex";
  });

  banGrid.appendChild(ban);
}


function addPopupButton(text, callback) {
  const btn = document.createElement("button");
  btn.innerText = text;
  btn.onclick = callback;
  popupButtons.appendChild(btn);
}

function closePopup() {
  popup.style.display = "none";
}

function openMenu() {
  menuPopup.style.display = "flex";
}

function closeMenu() {
  menuPopup.style.display = "none";
}

//menu

let isGoiThemMon = false; // mới thêm

function openMenu(goiThem = false) {
  isGoiThemMon = goiThem;
  const content = document.querySelector("#menuPopup .popup-content");
  content.classList.add("menu-mode");
  menuPopup.style.display = "flex";


  const items = document.querySelectorAll("#menuItems .menu-item input");
  items.forEach(input => {
    input.value = 0;
  });
}


function loadHoaDon(tenBan) {
  fetch(`http://192.168.0.124:3000/api/hoadon/${encodeURIComponent(tenBan)}`)
    .then(res => {
      if (!res.ok) throw new Error("Không tìm thấy hóa đơn");
      return res.json();
    })
    .then(data => {
      let content = `<h3>${data.tenBan}</h3><ul>`;
      let tongTien = 0;
      data.danhSachMon.forEach(mon => {
        const thanhTien = mon.gia * mon.soLuong;
        tongTien += thanhTien;
        content += `<li>${mon.ten} - ${mon.soLuong} x ${mon.gia.toLocaleString()}₫ = ${thanhTien.toLocaleString()}₫</li>`;
      });
      content += `</ul><p><strong>Tổng tiền: ${tongTien.toLocaleString()}₫</strong></p>`;
      content += `<button onclick="thanhToan('${tenBan}')">Đã thanh toán</button>`;

      document.getElementById("banInfo").innerHTML = content;
    })
    .catch(err => {
      document.getElementById("banInfo").innerHTML = `<p>Không tìm thấy hóa đơn.</p>`;
      console.error("Lỗi lấy hóa đơn:", err);
    });
}



function saveMenu() {
  if (!selectedBan) return alert("Vui lòng chọn bàn trước khi gọi món!");

  const items = document.querySelectorAll("#menuItems .menu-item");
  const orderedItems = [];

  items.forEach(item => {
    const name = item.dataset.name;
    const price = parseInt(item.dataset.price);
    const quantity = parseInt(item.querySelector("input").value);

    if (quantity > 0) {
      orderedItems.push({
        ten: name,
        gia: price,
        soLuong: quantity
      });
    }
  });

  if (orderedItems.length === 0) {
    alert("Bạn chưa chọn món nào.");
    return;
  }

  const tenBan = selectedBan ? selectedBan.innerText.trim() : null;

  if (isGoiThemMon) {
    // PUT cập nhật món gọi thêm
    fetch("http://192.168.0.124:3000/api/hoadon", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenBan: tenBan,
        danhSachMon: orderedItems,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Lỗi khi cập nhật hóa đơn");
        return res.json();
      })
      .then(data => {
        alert("Gọi thêm món thành công!");

        selectedBan.classList.remove("trong", "dat-truoc");
        selectedBan.classList.add("co-khach");
        selectedBan.dataset.trangthai = "co-khach";

        // Cập nhật trực tiếp nội dung hóa đơn hiển thị nếu đang mở
        let content = `<h3>${data.tenBan}</h3><ul>`;
        let tongTien = 0;
        data.danhSachMon.forEach(mon => {
          const thanhTien = mon.gia * mon.soLuong;
          tongTien += thanhTien;
          content += `<li>${mon.ten} - ${mon.soLuong} x ${mon.gia.toLocaleString()}₫ = ${thanhTien.toLocaleString()}₫</li>`;
        });
        content += `</ul><p><strong>Tổng tiền: ${tongTien.toLocaleString()}₫</strong></p>`;
        content += `<button onclick="thanhToan('${data.tenBan}')">Đã thanh toán</button>`;

        document.getElementById("banInfo").innerHTML = content;

        closeMenu();
      })


      .catch(err => {
        alert("Lỗi khi cập nhật hóa đơn");
        console.error(err);
      });

  } else {
    // POST tạo hóa đơn mới
    fetch("http://192.168.0.124:3000/api/hoadon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenBan: tenBan,
        trangThai: "co-khach",
        danhSachMon: orderedItems,
      }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          if (data.monHet) {
            alert(`Các món đã hết: ${data.monHet.join(", ")}`);
          } else {
            alert(data.message || "Lỗi khi tạo hóa đơn");
          }
          throw new Error(data.message);
        }

        alert("Gọi món thành công!");
        selectedBan.classList.remove("trong", "dat-truoc");
        selectedBan.classList.add("co-khach");
        selectedBan.dataset.trangthai = "co-khach";
        loadHoaDon(tenBan);
        closeMenu();
      })
      .catch(err => {
        console.error("Lỗi khi tạo hóa đơn:", err);
      });

  }
}




function closeMenu() {
  const content = document.querySelector("#menuPopup .popup-content");
  content.classList.remove("menu-mode");
  menuPopup.style.display = "none";
}


function changeQuantity(button, delta) {
  const input = button.parentElement.querySelector("input");
  let value = parseInt(input.value) || 0;
  value = Math.max(0, value + delta);
  input.value = value;
}

function thanhToan(tenBan) {
  fetch("http://192.168.0.124:3000/api/hoadon/thanhtoan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tenBan }),
  })
    .then(res => res.json())
    .then(data => {
      alert("Thanh toán thành công!");
      // Tìm bàn và đổi trạng thái về trống
      const banList = document.querySelectorAll(".ban");
      banList.forEach(ban => {
        if (ban.innerText === tenBan) {
          ban.classList.remove("co-khach");
          ban.classList.add("trong");
          ban.dataset.trangthai = "trong";
        }
      });
      document.getElementById("banInfo").innerHTML = "Chọn một bàn để xem chi tiết.";
      selectedBan = null;
    })
    .catch(err => {
      alert("Lỗi khi thanh toán");
      console.error(err);
    });
}


