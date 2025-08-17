document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:9999/api/books";
  const booksPerPage = 15;

  let currentPage = 1;
  let allBooks = [];

  // === 1. LOAD DATA ====
  // Gọi API để lấy toàn bộ danh sách sách
  async function loadBooks() {
    try {
      const res = await fetch(API);
      allBooks = await res.json();
      renderBooks();
      renderPagination();
    } catch (err) {
      console.error("Lỗi loadBooks:", err);
    }
  }

  // Gọi API để lấy danh sách thể loại và hiển thị filter radio
  async function loadCategories() {
    try {
      const res = await fetch("http://localhost:9999/api/categories");
      const categories = await res.json();
      const filterContainer = document.getElementById("category-filter");

      categories.forEach((cat) => {
        const label = document.createElement("label");
        label.innerHTML = `
        <input type="radio" name="category" value="${cat._id}"> ${cat.name}
      `;
        filterContainer.appendChild(label);
      });

      // Gắn sự kiện khi chọn thể loại
      document.querySelectorAll('input[name="category"]').forEach((radio) => {
        radio.addEventListener("change", applyFilters);
      });
    } catch (err) {
      console.error("Lỗi loadCategories:", err);
    }
  }

  // === 2. RENDER DISPLAY ====
  // Hiển thị sách theo trang hiện tại
  function renderBooks() {
    const list = document.getElementById("book-list");
    list.innerHTML = "";

    const startIndex = (currentPage - 1) * booksPerPage;
    const paginatedBooks = allBooks.slice(
      startIndex,
      startIndex + booksPerPage
    );

    paginatedBooks.forEach((book) => {
      const div = document.createElement("div");
      div.className = "book-item";
      if (book.stock <= 0) div.classList.add("out-of-stock");

      const title = book.title || "Không rõ tiêu đề";
      const author = book.author || "Không rõ tác giả";
      const price = book.price?.toLocaleString() || "0";
      const stock = book.stock || 0;
      const coverImage = book.coverImage || "public/SDN.png";

      div.innerHTML = `
      <div class="book-image-wrapper">
        <img class="book-cover" src="${coverImage}" alt="Book Cover" />
        ${book.stock <= 0 ? `<div class="overlay">Hết hàng</div>` : ""}
      </div>
      <hr/>
      <a href="/book_detail/${
        book._id
      }" style="text-decoration: none; color: inherit;">
        <strong>${title}</strong><br>
        ✍️ Tác giả: ${author}<br>
        💰 Giá: ${price} VNĐ<br>
        📦 Số lượng: ${stock} ${stock <= 0 ? "(Hết hàng)" : ""}
      </a>
      <button class="add-to-cart-btn" ${book.stock <= 0 ? "disabled" : ""}>
        🛒 Thêm vào giỏ
      </button>
      <hr>
    `;

      // Gắn sự kiện nếu còn hàng
      const btn = div.querySelector(".add-to-cart-btn");
      if (book.stock > 0) {
        btn.addEventListener("click", () => {
          const bookData = {
            _id: book._id,
            title: book.title,
            author: book.author,
            price: book.price,
            stock: book.stock,
          };
          addToCart(bookData);
        });
      }

      list.appendChild(div);
    });
  }

  // Hiển thị các nút phân trang
  function renderPagination() {
    const totalPages = Math.ceil(allBooks.length / booksPerPage);
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      btn.className = i === currentPage ? "active" : "";
      btn.onclick = () => {
        currentPage = i;
        renderBooks();
        renderPagination();
      };
      pagination.appendChild(btn);
    }
  }

  // === 3. CART LOGIC  ====
  function addToCart(book) {
    // Kiểm tra trạng thái đăng nhập
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      window.location.href = "login.html";
      return;
    }

    // Nếu đã đăng nhập, tiếp tục xử lý thêm vào giỏ
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

  // === 4. FILTER, SEARCH, SORT  ====
  // Hàm chính để lọc + tìm kiếm + sắp xếp
  async function applyFilters() {
    try {
      const res = await fetch(API);
      let filteredBooks = await res.json();

      const keyword = document.getElementById("search").value.toLowerCase();
      const selectedSort = document.querySelector(
        'input[name="sort"]:checked'
      ).value;
      const selectedCategory = document.querySelector(
        'input[name="category"]:checked'
      ).value;

      // Lọc theo từ khóa
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(keyword) ||
          (book.author || "").toLowerCase().includes(keyword)
      );

      // Lọc theo thể loại
      if (selectedCategory) {
        filteredBooks = filteredBooks.filter(
          (book) =>
            book.category?._id === selectedCategory ||
            book.category === selectedCategory
        );
      }

      // Sắp xếp
      switch (selectedSort) {
        case "price":
          filteredBooks.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          filteredBooks.sort((a, b) => b.price - a.price);
          break;
      }

      allBooks = filteredBooks;
      currentPage = 1;
      renderBooks();
      renderPagination();
    } catch (err) {
      console.error("Lỗi applyFilters:", err);
    }
  }

  // Gắn sự kiện khi nhập tìm kiếm (realtime)
  document.getElementById("search").addEventListener("input", applyFilters);

  // Gắn sự kiện khi chọn sắp xếp
  document.querySelectorAll('input[name="sort"]').forEach((radio) => {
    radio.addEventListener("change", applyFilters);
  });

  loadBooks();
  loadCategories();
});
