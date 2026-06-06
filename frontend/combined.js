const API = "http://localhost:3000/api";

// ── Auth guard ────────────────────────────────────────────────────
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// ── User info ─────────────────────────────────────────────────────
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
const userName    = currentUser.fullName || localStorage.getItem("userName") || "Student";
const faculty     = currentUser.faculty  || localStorage.getItem("faculty")  || "IT";
const year        = currentUser.academicYear || localStorage.getItem("academicYear") || "Year 1";

document.getElementById("studentName").textContent = userName;
document.getElementById("studentInfo").textContent = `${faculty} · ${year}`;

// Welcome banner
const welcomeNameEl = document.getElementById("welcomeName");
const welcomeInfoEl = document.getElementById("welcomeInfo");
if (welcomeNameEl) welcomeNameEl.textContent = userName;
if (welcomeInfoEl) welcomeInfoEl.textContent =
  `You are registered as a student in the ${faculty === "IT" ? "Information Technology" : "Business Administration"} Faculty, ${year}.`;

// ── Logout ────────────────────────────────────────────────────────
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ── Hero search button ────────────────────────────────────────────
document.getElementById("heroSearchBtn")?.addEventListener("click", () => {
  window.location.href = "search.html";
});

// ── Faculty browse buttons ────────────────────────────────────────
document.querySelectorAll(".btn-browse").forEach((btn) => {
  btn.addEventListener("click", () => {
    window.location.href = `search.html?faculty=${btn.dataset.faculty}`;
  });
});

// ── Live stats from API ───────────────────────────────────────────
async function loadStats() {
  try {
    const token = localStorage.getItem("token");
    const res   = await fetch(`${API}/books`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const data  = await res.json();
    if (data.success && data.total != null) {
      const el = document.getElementById("statBooks");
      if (el) el.textContent = data.total.toLocaleString() + "+";
    }
  } catch (_) {
    // keep static fallback
  }
}

loadStats();
