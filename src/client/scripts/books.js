document.addEventListener("DOMContentLoaded", () => {
  const API = "http://localhost:9999/api/books";
  const CATEGORY_API = "http://localhost:9999/api/categories";

  const form = document.getElementById("book-form");
  let searchInput = document.getElementById("search");
  const sortSelect = document.getElementById("sort");
  const bookList = document.getElementById("book-list");
  const pagination = document.getElementById("pagination");
  const categorySelect = document.getElementById("category-select");

  let books = [];
  let categories = [];
  let categoryMap = {};
  let currentPage = 1;
  const booksPerPage = 5;

  (async () => {
    await loadCategories();
    await loadBooks();
  })();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;

    const book = {
      title: f.title.value.trim(),
      author: f.author.value.trim(),
      price: +f.price.value,
      stock: +f.stock.value,
      coverImage: f.coverImage.value.trim(),
      description: f.description.value.trim() || null,
      category: f.category.value || null,
    };

    const id = f.bookId.value;
    const token = localStorage.getItem("token");

    if (!token) {
      alert("⚠ Bạn cần đăng nhập để thực hiện thao tác này.");
      window.location.href = "/login";
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      if (id) {
        // PUT = cập nhật sách
        const res = await fetch(`${API}/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(book),
        });
        if (!res.ok) throw new Error("Cập nhật thất bại.");
      } else {
        // POST = thêm mới sách
        const res = await fetch(API, {
          method: "POST",
          headers,
          body: JSON.stringify(book),
        });
        if (!res.ok) throw new Error("Thêm sách thất bại.");
      }

      f.reset();
      loadBooks();
    } catch (err) {
      console.error(err);
      alert(err.message || "Có lỗi xảy ra.");
    }
  });

  searchInput.addEventListener("input", () => renderBooks());
  sortSelect.addEventListener("change", () => renderBooks());

  async function loadBooks() {
    const res = await fetch(API);
    books = await res.json();
    renderBooks();
  }

  async function loadCategories() {
    const res = await fetch(CATEGORY_API);
    categories = await res.json();
    categoryMap = {};

    categorySelect.innerHTML = '<option value="">📚 Chọn thể loại</option>';
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat._id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);

      categoryMap[cat._id] = cat.name;
    });
  }

  function renderBooks() {
    const keyword = searchInput.value.toLowerCase();
    const sort = sortSelect.value;

    let filtered = books.filter(
      (b) =>
        b.title.toLowerCase().includes(keyword) ||
        (b.author || "").toLowerCase().includes(keyword)
    );

    switch (sort) {
      case "price":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "stock":
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      case "stock-desc":
        filtered.sort((a, b) => b.stock - a.stock);
        break;
    }

    const totalPages = Math.ceil(filtered.length / booksPerPage);
    if (currentPage > totalPages) currentPage = 1;

    const start = (currentPage - 1) * booksPerPage;
    const paginated = filtered.slice(start, start + booksPerPage);

    bookList.innerHTML = "";
    paginated.forEach((b) => {
      const categoryId = b.category?._id?.toString() || b.category?.toString();
      const categoryName = categoryMap[categoryId] || "Không rõ thể loại";

      const li = document.createElement("li");
      li.innerHTML = `
        <img class="book-cover" src="${
          b.coverImage || "public/SDN.png"
        }" alt="Book Cover" />
        <div class="book-info">
          <strong>${b.title}</strong><br/>
          <em>${b.author || "Không rõ tác giả"}</em><br/>
          📚 <span>${categoryName}</span><br/>
          <span>${b.price.toLocaleString()}₫</span> | 📦 ${b.stock}
        </div>
        <div class="book-actions">
          <button class="edit">✏</button>
          <button class="delete">🗑</button>
        </div>
      `;

      li.querySelector(".edit").addEventListener("click", () =>
        editBook(b._id)
      );
      li.querySelector(".delete").addEventListener("click", () =>
        deleteBook(b._id)
      );
      bookList.appendChild(li);
    });

    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.innerText = i;
      if (i === currentPage) btn.classList.add("active");
      btn.onclick = () => {
        currentPage = i;
        renderBooks();
      };
      pagination.appendChild(btn);
    }
  }

  async function deleteBook(id) {
    if (confirm("Xóa sách này?")) {
      const token = localStorage.getItem("token");
      console.log("📦 Token từ localStorage:", token);

      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error("Delete failed:", res.status, msg);
      } else {
        loadBooks();
      }
    }
  }

  async function editBook(id) {
    const res = await fetch(`${API}/${id}`);
    const b = await res.json();

    form.bookId.value = b._id;
    form.title.value = b.title;
    form.author.value = b.author;
    form.price.value = b.price;
    form.stock.value = b.stock;
    form.coverImage.value = b.coverImage || "";
    form.category.value = b.category?._id || b.category || "";
    form.description.value = b.description;
    form.scrollIntoView({ behavior: "smooth" });
  }
});
