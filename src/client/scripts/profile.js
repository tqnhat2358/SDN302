document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("profile-form");
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!form || !user || !token) {
    alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
    window.location.href = "login.html";
    return;
  }

  // Điền dữ liệu người dùng vào form
  form.elements["name"].value = user.name || "";
  form.elements["email"].value = user.email || "";
  form.elements["address"].value = user.address || "";
  form.elements["age"].value = user.age !== undefined ? user.age : "";
  form.elements["phoneNumber"].value = user.phoneNumber || "";

  // Gửi yêu cầu cập nhật khi người dùng bấm "Lưu thay đổi"
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedUser = {
      name: form.elements["name"].value.trim(),
      address: form.elements["address"].value.trim(),
      phoneNumber: form.elements["phoneNumber"].value.trim(),
    };

    // Validate tuổi
    const ageValue = form.elements["age"].value.trim();
    if (ageValue) {
      const parsedAge = parseInt(ageValue, 10);
      if (!isNaN(parsedAge) && parsedAge >= 0) {
        updatedUser.age = parsedAge;
      } else {
        alert("Tuổi không hợp lệ!");
        return;
      }
    }

    // Nếu có mật khẩu mới thì thêm vào
    const newPassword = form.elements["password"].value.trim();
    if (newPassword) {
      updatedUser.password = newPassword;
    }

    try {
      const res = await fetch(`http://localhost:9999/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("user", JSON.stringify(data));
        alert("Cập nhật thành công!");
        window.location.reload();
      } else {
        const errorText = await res.text();
        alert("Cập nhật thất bại: " + errorText);
      }
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  });
});
