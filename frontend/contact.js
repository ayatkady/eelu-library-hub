// Check if user is logged in
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// Update user data in header
const studentName = localStorage.getItem("userName") || "Student";
const faculty = localStorage.getItem("faculty") || "IT";
const academicYear = localStorage.getItem("academicYear") || "Year 1";

document.querySelector(".user-name").textContent = studentName;
document.querySelector(".user-meta").textContent = `${faculty} - ${academicYear}`;

// Logout functionality
const logoutBtn = document.querySelector(".btn-logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function() {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// Contact form submission
const sendBtn = document.querySelector(".contact-send-btn");

if (sendBtn) {
  sendBtn.addEventListener("click", function (e) {
    e.preventDefault();

    const form = document.querySelector("form");
    const inputs = form.querySelectorAll(".contact-input");

    let isValid = true;

    inputs.forEach(input => {
      if (input.value.trim() === "") {
        isValid = false;
      }
    });

    const toastEl = document.getElementById("contactToast");
    const toastBody = toastEl.querySelector(".toast-body");

    // 🔥 مهم جدًا: reset color every time
    toastEl.classList.remove("text-bg-danger");
    toastEl.classList.add("text-bg-success");

    if (isValid) {
      toastBody.innerHTML = "✔ Thank you for your message! We will get back to you soon.";
    } else {
      toastEl.classList.remove("text-bg-success");
      toastEl.classList.add("text-bg-danger");

      toastBody.innerHTML = "❌ Please fill in all required fields.";
    }

    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    if (isValid) {
      form.reset();
    }
  });
}