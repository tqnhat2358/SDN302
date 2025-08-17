const API = "http://localhost:9999/api/users";
const token = localStorage.getItem("token");

async function loadUsers() {
  try {
    const res = await fetch(API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const users = await res.json();

    const tbody = document.getElementById("user-body");
    tbody.innerHTML = "";

    users.forEach((u, index) => {
      if (u.role === "admin") return; // Ẩn người dùng có role admin

      const tr = document.createElement("tr");
      tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.role}</td>
      <td>
      <button onclick="viewOrders('${u._id}', '${u.name}')">📦 Đơn hàng</button>
      <button onclick="deleteUser('${u._id}')">🗑️ Xóa</button>
      </td>
`;

      tbody.appendChild(tr);
    });
  } catch (error) {
    alert("Không thể tải danh sách người dùng.");
    console.error(error);
  }
}

async function deleteUser(id) {
  if (confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alert("Đã xóa người dùng.");
      loadUsers(); // Reload lại danh sách
    } else {
      alert("Xóa thất bại!");
    }
  }
}

async function viewOrders(userId, userName) {
  try {
    const res = await fetch(`http://localhost:9999/api/orders/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      alert(`Không thể lấy đơn hàng của ${userName}`);
      return;
    }

    const orders = await res.json();

    if (orders.length === 0) {
      alert(`${userName} chưa có đơn hàng.`);
    } else {
      let message = `Đơn hàng của ${userName}:\n`;
      orders.forEach((order, i) => {
        message += `${i + 1}. Mã đơn: ${order._id}, Tổng tiền: ${order.totalAmount}, Trạng thái: ${order.status}\n`;
      });
      alert(message);
    }

  } catch (error) {
    console.error(error);
    alert('Có lỗi khi lấy đơn hàng.');
  }
}


loadUsers();
