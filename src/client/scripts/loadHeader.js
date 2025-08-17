document.addEventListener("DOMContentLoaded", () => {
  fetch("/components/header.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("header-container").innerHTML = html;
      renderHeaderContent();
    });
});

async function renderHeaderContent() {
  const user = JSON.parse(localStorage.getItem("user"));
  const nav = document.getElementById("nav-items");

  if (!nav) return;

  if (user && user.role === "customer") {
    nav.innerHTML = `
      <div class="dropdown">
        <button class="dropdown-toggle">👤</button>
        <div class="dropdown-menu">
          <a href="/profile">🧾 Hồ sơ</a>
          <a href="/orders">📦 Đơn hàng</a>
          <a href="#" onclick="logout()">🚪 Đăng xuất</a>
        </div>
      </div>
      <a href="/cart">🛒 Giỏ hàng</a>
    `;
  } else if (user && user.role === "admin") {
    nav.innerHTML = `
    <div class="nav-item">
      <button id="notif-btn">🔔</button>
      <div id="notif-menu" class="notif-menu hidden"></div>
    </div>

    <div class="nav-item dropdown">
      <button class="dropdown-toggle">👤 Admin</button>
      <div class="dropdown-menu">
        <a href="/index">📊 Quản trị</a>
        <a href="/orders">📦 Quản lý đơn hàng</a>
        <a href="#" onclick="logout()">🚪 Đăng xuất</a>
      </div>
    </div>
  `;
  } else {
    nav.innerHTML = `
      <a href="login.html">🔐 Đăng nhập</a>
      <a href="register.html">📝 Đăng ký</a>
      <a href="cart.html">🛒 Giỏ hàng</a>
    `;
  }
}

// Xử lý click thông báo
document.addEventListener("click", async (e) => {
  if (e.target.id === "notif-btn") {
    const notifMenu = document.getElementById("notif-menu");
    notifMenu.classList.toggle("hidden");

    // Chỉ load nếu chưa có nội dung
    if (notifMenu.innerHTML.trim() === "") {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:9999/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        notifMenu.innerHTML = data.length
          ? data.map((n) => `<div class="notif-item">${n.message}</div>`).join("")
          : "<div class='notif-item'>Không có thông báo</div>";
      } catch (err) {
        console.error("Lỗi khi lấy thông báo:", err);
        notifMenu.innerHTML = "<div class='notif-item error'>Lỗi khi tải thông báo</div>";
      }
    }
  } else {
    const notifMenu = document.getElementById("notif-menu");
    if (notifMenu && !notifMenu.contains(e.target) && e.target.id !== "notif-btn") {
      notifMenu.classList.add("hidden");
    }
  }
});

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  alert("Đã đăng xuất!");
  window.location.href = "/shop";
}
