// Check if user is logged in
if (!localStorage.getItem("isLoggedIn")) {
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

// Font size controls
const fontSizeButtons = document.querySelectorAll(".access-size-btn");
fontSizeButtons.forEach(function(btn) {
  btn.addEventListener("click", function() {
    const size = this.getAttribute("data-size");
    document.documentElement.style.fontSize = size + "px";
    localStorage.setItem("fontSize", size);
  });
});

// High contrast toggle
const highContrastBtn = document.querySelector(".access-contrast-toggle");
if (highContrastBtn) {
  highContrastBtn.addEventListener("click", function() {
    document.body.classList.toggle("high-contrast");
    localStorage.setItem("highContrast", document.body.classList.contains("high-contrast"));
  });
}

// Load saved preferences
const savedFontSize = localStorage.getItem("fontSize");
if (savedFontSize) {
  document.documentElement.style.fontSize = savedFontSize + "px";
}

const savedHighContrast = localStorage.getItem("highContrast") === "true";
if (savedHighContrast) {
  document.body.classList.add("high-contrast");
}
