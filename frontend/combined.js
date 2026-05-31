
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}
// ================= USER =================
const currentUser =
JSON.parse(
  localStorage.getItem("currentUser")
);

const studentName =
currentUser?.fullName || "Student";

const faculty =
currentUser?.faculty || "IT";

const academicYear =
currentUser?.academicYear || "Year 1";

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