const API = "http://localhost:9999/api/books";
const CATEGORY_API = "http://localhost:9999/api/categories";

// ✅ Lấy bookId từ URL path: /book_detail/:id
const bookId = window.location.pathname.split("/").pop();

// Hàm hỗ trợ lấy ngẫu nhiên
function getRandomBooks(list, excludeIds = [], count = 5) {
  const filtered = list.filter((b) => !excludeIds.includes(b._id));
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Hàm hiển thị sách gợi ý
async function loadRelatedBooks(book) {
  try {
    const res = await fetch(API);
    const books = await res.json();

    // Lọc sách khác và còn hàng
    const otherBooks = books.filter((b) => b._id !== book._id && b.stock > 0);

    // === Ưu tiên sách cùng tác giả ===
    const sameAuthor = otherBooks.filter((b) => b.author === book.author);
    let suggestions = getRandomBooks(sameAuthor, [], 4);

    // === Nếu chưa đủ 5, thêm sách cùng thể loại ===
    if (suggestions.length < 5) {
      const sameCategory = otherBooks.filter(
        (b) =>
          b.category === book.category &&
          !suggestions.some((s) => s._id === b._id)
      );
      const needed = 5 - suggestions.length;
      const categoryBooks = getRandomBooks(sameCategory, [], needed);
      suggestions = [...suggestions, ...categoryBooks];
    }

    // === Nếu vẫn chưa đủ, chọn ngẫu nhiên từ còn lại ===
    if (suggestions.length < 5) {
      const excludeIds = [book._id, ...suggestions.map((b) => b._id)];
      const extra = getRandomBooks(
        otherBooks,
        excludeIds,
        5 - suggestions.length
      );
      suggestions = [...suggestions, ...extra];
    }

    // === Hiển thị ra màn hình ===
    const suggestionBox = document.getElementById("suggestions");
    suggestionBox.innerHTML = "<h3>📚 Có thể bạn quan tâm</h3>";

    suggestions.forEach((b) => {
      const div = document.createElement("div");
      div.className = "suggest-item";
      div.innerHTML = `
        <a href="/book_detail/${b._id}">
          <strong>${b.title}</strong><br/>
          ✍️ ${b.author || "Không rõ"}<br/>
          📚 ${b.category?.name || "Không rõ"}<br/>
          💰 ${b.price?.toLocaleString()}₫
        </a>
      `;
      suggestionBox.appendChild(div);
    });
  } catch (err) {
    console.error("Lỗi khi load sách gợi ý:", err);
  }
}

// Thêm sách vào giỏ
function addToCart(book) {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
    window.location.href = "/login";
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item._id === book._id);

  if (existing) {
    if (existing.quantity >= book.stock) {
      alert(
        `Số lượng "${book.title}" trong giỏ đã đạt tối đa (${book.stock}).`
      );
      return;
    }
    existing.quantity += 1;
  } else {
    if (book.stock <= 0) {
      alert(`"${book.title}" hiện đang hết hàng.`);
      return;
    }
    cart.push({ ...book, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`Đã thêm "${book.title}" vào giỏ hàng!`);
}

// Hàm chính hiển thị chi tiết sách
async function loadBookDetail() {
  try {
    const res = await fetch(`${API}/${bookId}`);
    const book = await res.json();

    const detail = document.getElementById("book-detail");
    detail.innerHTML = `
  <div class="book-detail-layout">
    <div class="book-image-wrapper">
      <img src="${
        book.coverImage || "/public/SDN.png"
      }" width="200" height="300" alt="Book Cover" />
      ${book.stock <= 0 ? `<div class="overlay">Hết hàng</div>` : ""}
    </div>
    <div class="book-info">
      <h2>${book.title}</h2>
      <p><strong>Tác giả:</strong> ${book.author}</p>
      <p><strong>Giá:</strong> ${book.price?.toLocaleString() || "0"}₫</p>
      <p><strong>Thể loại:</strong> ${book.category?.name || "Không rõ"}</p>
      <p><strong>Mô tả:</strong> ${book.description || "Không có mô tả"}</p>
      <button class="add-to-cart-btn">🛒 Thêm vào giỏ</button>
    </div>
  </div>
`;

    document
      .querySelector(".add-to-cart-btn")
      .addEventListener("click", () => addToCart(book));

    loadRelatedBooks(book);
  } catch (err) {
    document.getElementById("book-detail").innerText = "Không tìm thấy sách.";
    console.error("Lỗi khi tải chi tiết sách:", err);
  }
}

// Gọi hàm chính
loadBookDetail();
