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

// Browse books button
const browseBtn = document.querySelector(".borrowed-browse-btn");
if (browseBtn) {
  browseBtn.addEventListener("click", function(e) {
    e.preventDefault();
    window.location.href = "search.html";
  });
}
