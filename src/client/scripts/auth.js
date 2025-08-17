document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      email: form.email.value,
      password: form.password.value,
    };

    try {
      const res = await fetch("http://localhost:9999/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();

        // Lưu token và user info vào localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("Đăng nhập thành công");

        // Chuyển hướng theo vai trò
        if (data.user.role === "admin") {
          window.location.href = "/index";
        } else {
          window.location.href = "/shop";
        }
      } else {
        alert("Sai tài khoản hoặc mật khẩu");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      alert("Đã xảy ra lỗi khi đăng nhập");
    }
  });
});
