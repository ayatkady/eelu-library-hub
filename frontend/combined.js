// Check login
if (!localStorage.getItem("isLoggedIn")) {
  window.location.href = "login.html";
}

// ================= USER =================
const studentName = localStorage.getItem("userName") || "Student";
const faculty = localStorage.getItem("faculty") || "IT";
const academicYear = localStorage.getItem("academicYear") || "Year 1";

document.getElementById("studentName").textContent = studentName;
document.getElementById("studentInfo").textContent = `${faculty} - ${academicYear}`;

// ================= LOGOUT =================
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ================= HERO SEARCH =================
document.querySelector(".btn-search")?.addEventListener("click", () => {
  const input = document.querySelector(".hero-input").value.trim();
  window.location.href = `search.html?q=${encodeURIComponent(input)}`;
});

// ================= FACULTY BUTTONS =================
document.querySelectorAll(".btn-browse").forEach(btn => {
  btn.addEventListener("click", () => {
    const faculty = btn.dataset.faculty;
    window.location.href = `search.html?faculty=${faculty}`;
  });
});