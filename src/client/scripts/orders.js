async function loadOrders() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Check login
  if (!user || !token) {
    alert("Bạn chưa đăng nhập!");
    return;
  }

  // Check role
  const url =
    user.role === "admin"
      ? "http://localhost:9999/api/orders/admin"
      : `http://localhost:9999/api/orders/user/${user._id}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Lỗi lấy đơn hàng");
      return;
    }

    const statusFilter = document.getElementById("status-filter").value;
    const filteredOrders =
      statusFilter === "all"
        ? data
        : data.filter((order) => order.status === statusFilter);

    const orderList = document.getElementById("order-list");
    orderList.innerHTML = "";

    filteredOrders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    filteredOrders.forEach((order) => {
      const tr = document.createElement("tr");

      const productDetails = order.items
        .map((i) => {
          const title = i.book?.title || "[N/A]";
          const quantity = i.quantity || 0;
          return `${title} (x${quantity})`;
        })
        .join("<br>");

      const isAdmin = user.role === "admin";

      tr.innerHTML = `
        <td>${order._id}</td>
        <td>${order.user?.name || "Bạn"}</td>
        <td>${order.user?.phoneNumber || order.phoneNumber || ""}</td>
        <td>${order.user?.address || order.address || ""}</td>
        <td>${productDetails}</td>
        <td>${order.totalAmount.toLocaleString()} ₫</td>
        <td>
          ${
            isAdmin
              ? `<select data-id="${order._id}" class="status-select">
                  <option value="pending" ${
                    order.status === "pending" ? "selected" : ""
                  }>Đang xử lý</option>
                  <option value="shipped" ${
                    order.status === "shipped" ? "selected" : ""
                  }>Đang giao</option>
                  <option value="delivered" ${
                    order.status === "delivered" ? "selected" : ""
                  }>Đã giao</option>
                  <option value="canceled" ${
                    order.status === "canceled" ? "selected" : ""
                  }>Đã hủy</option>
                </select>`
              : order.status
          }
        </td>
        <td>${new Date(order.createdAt).toLocaleString()}</td>
        <td>
          ${
            isAdmin
              ? `
                <button class="save-btn" data-id="${order._id}">💾</button>
                <button class="print-btn" data-id="${order._id}">🖨️</button>
              `
              : order.status !== "delivered" && order.status !== "canceled" && order.status !== "shipped"
              ? `<button class="cancel-btn" data-id="${order._id}">Hủy đơn hàng</button>`
              : ""
          }
        </td>
      `;

      orderList.appendChild(tr);
    });

    // Sự kiện lưu trạng thái
    document.querySelectorAll(".save-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const orderId = btn.dataset.id;
        const select = document.querySelector(
          `.status-select[data-id="${orderId}"]`
        );
        const newStatus = select.value;
        updateOrderStatus(orderId, newStatus);
      });
    });

    // Sự kiện in hóa đơn
    document.querySelectorAll(".print-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const orderId = btn.dataset.id;

        const res = await fetch(`http://localhost:9999/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const order = await res.json();
        if (!res.ok) {
          alert(order.message || "Lỗi tải đơn hàng");
          return;
        }

        const content = `
          <div style="font-family: Arial; padding: 20px; width: 80mm">
            <h2 style="text-align: center;">🧾 HÓA ĐƠN BÁN HÀNG</h2>
            <p><strong>Mã đơn:</strong> ${order._id}</p>
            <p><strong>Khách hàng:</strong> ${order.user?.name || "Ẩn danh"}</p>
            <p><strong>Điện thoại:</strong> ${
              order.user?.phoneNumber || "Không có"
            }</p>
            <p><strong>Địa chỉ:</strong> ${
              order.user?.address || order.address || ""
            }</p>
            <hr>
            <table style="width: 100%; font-size: 14px;">
              <thead>
                <tr>
                  <th style="text-align: left;">Sản phẩm</th>
                  <th style="text-align: center;">SL</th>
                  <th style="text-align: right;">Giá</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map((item) => {
                    const price = item.price || item.book?.price || 0;
                    const quantity = item.quantity || 0;
                    const title = item.book?.title || "[N/A]";
                    const lineTotal = price * quantity;

                    return `
                    <tr>
                      <td>${title}</td>
                      <td style="text-align: center;">${quantity}</td>
                      <td style="text-align: right;">${lineTotal.toLocaleString()}₫</td>
                    </tr>`;
                  })
                  .join("")}
              </tbody>
            </table>
            <hr>
            <p style="text-align: right;"><strong>Tổng cộng: ${order.totalAmount.toLocaleString()}₫</strong></p>
          </div>
        `;

        const printWindow = window.open("", "_blank", "width=400,height=600");
        printWindow.document.write(`
          <html><head><title>In đơn hàng</title></head>
          <body onload="window.print(); setTimeout(()=>window.close(), 500)">
          ${content}
          </body></html>
        `);
        printWindow.document.close();
      });
    });
  } catch (err) {
    console.error("Lỗi:", err);
    alert("Không thể kết nối đến máy chủ");
  }
}

async function updateOrderStatus(orderId, newStatus) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`http://localhost:9999/api/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Không cập nhật được trạng thái");
    } else {
      alert("Trạng thái đã được cập nhật");
      loadOrders();
    }
  } catch (err) {
    console.error("Lỗi:", err);
    alert("Không kết nối được đến máy chủ");
  }
}

// ✅ Sự kiện hủy đơn hàng – dùng event delegation (không lặp sự kiện)
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("cancel-btn")) {
    const orderId = e.target.dataset.id;
    const confirmed = confirm("Bạn có chắc muốn hủy đơn hàng này?");
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:9999/api/orders/${orderId}`, {
        method: "PUT", // hoặc "PATCH" tùy backend bạn dùng gì
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "canceled" }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Không thể hủy đơn hàng");
      } else {
        alert("Đã hủy đơn hàng thành công");
        loadOrders(); // Reload danh sách
      }
    } catch (err) {
      console.error("❌ Lỗi hủy đơn:", err);
      alert("Không thể kết nối đến máy chủ");
    }
  }
});

// Load lần đầu và gắn sự kiện cho dropdown
document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
  document
    .getElementById("status-filter")
    .addEventListener("change", loadOrders);
});
