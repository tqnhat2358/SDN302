// ✅ Load giỏ hàng từ localStorage và hiển thị
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartList = document.getElementById("cart-list");
  const totalSpan = document.getElementById("total");
  const emptyCart = document.getElementById("empty-cart");
  const totalSection = document.getElementById("total-section");

  cartList.innerHTML = "";
  let total = 0;

  // Nếu giỏ trống → hiển thị "trống"
  if (cart.length === 0) {
    emptyCart.style.display = "block";
    totalSection.style.display = "none";
    return;
  }

  // Có sản phẩm → hiển thị danh sách và tổng tiền
  emptyCart.style.display = "none";
  totalSection.style.display = "flex";

  cart.forEach((item, index) => {
    const isOutOfStock = item.stock === 0;
    const itemTotal = item.quantity * item.price;

    if (!isOutOfStock) total += itemTotal;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <div><strong>${item.title}</strong>
        ${isOutOfStock ? `<div style="color:red; font-size: 14px;">Sản phẩm này đã hết hàng.</div>` : ""}
      </div>

      <div>
        ${
          isOutOfStock
            ? `<span style="color:#aaa;">Còn 0 sản phẩm</span>`
            : `<input 
                type="number" 
                min="1" 
                max="${item.stock}" 
                value="${item.quantity}" 
                onchange="updateQuantity(${index}, this)" />`
        }
      </div>

      <div style="${isOutOfStock ? "color:red;" : ""}">
        ${item.price.toLocaleString()} ₫
      </div>

      <div style="${isOutOfStock ? "color:red;" : ""}">
        ${isOutOfStock ? "0" : itemTotal.toLocaleString()} ₫
      </div>

      <div><button onclick="removeItem(${index})">Xóa</button></div>
    `;

    cartList.appendChild(div);
  });

  totalSpan.textContent = total.toLocaleString();
}

// Cập nhật số lượng mua
function updateQuantity(index, input) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const newVal = parseInt(input.value);
  const stock = cart[index].stock;

  // Giá trị không hợp lệ → reset về cũ
  if (!newVal || newVal < 1) {
    input.value = cart[index].quantity;
    return;
  }

  // Nếu nhập vượt số lượng còn lại → cảnh báo và giới hạn lại
  if (newVal > stock) {
    alert(`Chỉ còn ${stock} cuốn "${cart[index].title}" trong kho.`);
    input.value = stock;
    cart[index].quantity = stock;
  } else {
    cart[index].quantity = newVal;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// Xóa sản phẩm khỏi giỏ hàng
function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// Làm sạch giỏ hàng khỏi sách không còn tồn tại hoặc hết hàng
async function cleanCartFromUnavailableBooks() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) return;

  try {
    const res = await fetch("http://localhost:9999/api/books");
    const books = await res.json();

    const bookMap = {};
    books.forEach(book => (bookMap[book._id] = book));

    const cleanedCart = cart
      .map(item => {
        const updated = bookMap[item._id];
        if (!updated) return null; // Sách không còn trong DB
        return {
          ...item,
          stock: updated.stock,
          title: updated.title,
          price: updated.price,
        };
      })
      .filter(item => item !== null); // Loại sách đã bị xóa

    localStorage.setItem("cart", JSON.stringify(cleanedCart));
  } catch (err) {
    console.error("Lỗi khi làm sạch giỏ hàng:", err);
  }
}

// ✅ Gửi đơn hàng
async function checkout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user || !user._id || !token) {
    alert("Bạn cần đăng nhập để đặt hàng.");
    window.location.href = "login.html";
    return;
  }

  if (cart.length === 0) {
    alert("Giỏ hàng đang trống.");
    return;
  }

  const items = cart.map(item => ({
    book: item._id,
    quantity: item.quantity || 1,
  }));

  try {
    const res = await fetch("http://localhost:9999/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user: user._id,
        items,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Lỗi khi gửi đơn hàng");
    }

    alert("Đặt hàng thành công!");
    localStorage.removeItem("cart");
    window.location.href = "orders.html";
  } catch (err) {
    alert("Không thể đặt hàng.\n" + err.message);
    console.error(err);
  }
}

// ✅ Khởi động sau khi trang được load
document.addEventListener("DOMContentLoaded", async () => {
  await cleanCartFromUnavailableBooks(); // Xử lý các sách không hợp lệ
  loadCart(); // Hiển thị giỏ hàng
});
