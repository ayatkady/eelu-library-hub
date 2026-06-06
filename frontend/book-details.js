const API = "http://localhost:3000/api";

// ── Auth guard ────────────────────────────────────────────────────
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// ── Header user info ──────────────────────────────────────────────
const nameEl = document.querySelector(".user-name");
const metaEl = document.querySelector(".user-meta");
if (nameEl) nameEl.textContent = localStorage.getItem("userName") || "Student";
if (metaEl) metaEl.textContent = `${localStorage.getItem("faculty") || "IT"} - ${localStorage.getItem("academicYear") || "Year 1"}`;

// ── Logout ────────────────────────────────────────────────────────
document.querySelector(".btn-logout")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ── Back button ───────────────────────────────────────────────────
document.querySelector(".book-detail-back-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "search.html";
});

// ── Get book ID from URL ──────────────────────────────────────────
const bookId = new URLSearchParams(window.location.search).get("id");

if (!bookId) {
  window.location.href = "search.html";
}

// ── Fetch and render book ─────────────────────────────────────────
async function loadBook() {
  try {
    const token = localStorage.getItem("token");
    const res   = await fetch(`${API}/books/${bookId}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const data  = await res.json();

    if (!res.ok || !data.success || !data.data) {
      showError("Book not found.");
      return;
    }

    renderBook(data.data);
  } catch (err) {
    console.error(err);
    showError("Failed to load book details.");
  }
}

function renderBook(b) {
  // Cover image
  const coverImg = document.querySelector(".book-detail-cover img");
  if (coverImg) {
    coverImg.src = b.coverImageUrl || "https://placehold.co/300x400?text=No+Cover";
    coverImg.alt = b.title;
  }

  // Availability
  const avail    = b.availableCopies ?? 0;
  const total    = b.totalCopies     ?? 0;
  const availBadge = document.querySelector(".badge-availability");
  const availCount = document.querySelector(".availability-count");
  if (availBadge) {
    availBadge.textContent  = avail > 0 ? "Available" : "Not Available";
    availBadge.style.background = avail > 0 ? "" : "#dc2626";
  }
  if (availCount) availCount.textContent = `${avail} of ${total} copies`;

  // Title, author, category
  const titleEl = document.querySelector(".book-detail-title");
  const authorEl = document.querySelector(".book-detail-author");
  const badgeEl  = document.querySelector(".book-detail-badge");
  if (titleEl)  titleEl.textContent  = b.title;
  if (authorEl) authorEl.textContent = `by ${b.author}`;
  if (badgeEl)  badgeEl.textContent  = b.category;

  // Faculty & year badges
  const facEl  = document.querySelector(".badge-faculty");
  const yearEl = document.querySelector(".badge-year");
  if (facEl)  facEl.textContent  = b.faculty;
  if (yearEl) yearEl.textContent = b.academicYear;

  // Description
  const descEl = document.querySelector(".book-detail-description p");
  if (descEl) descEl.textContent = b.description || "No description available.";

  // Info list values
  const infoItems = document.querySelectorAll(".book-detail-info-list li");
  infoItems.forEach((li) => {
    const label = li.querySelector(".label")?.textContent?.toLowerCase() || "";
    const valEl = li.querySelector(".value");
    if (!valEl) return;
    if (label.includes("author"))   valEl.textContent = b.author;
    if (label.includes("faculty"))  valEl.textContent = `${b.faculty} – ${b.academicYear}`;
  });

  // PDF download button
  const dlBtn = document.querySelector(".book-detail-download-btn");
  if (dlBtn) {
    if (b.pdfUrl) {
      dlBtn.onclick = () => window.open(b.pdfUrl, "_blank");
    } else {
      dlBtn.disabled    = true;
      dlBtn.textContent = "PDF not available";
    }
  }

  // Borrow button
  const borrowBtn = document.querySelector(".book-detail-main-btn");
  if (borrowBtn) {
    if (avail > 0) {
      borrowBtn.onclick = () => handleBorrow(b._id, borrowBtn);
    } else {
      borrowBtn.disabled    = true;
      borrowBtn.textContent = "No Copies Available";
    }
  }

  // Reserve button
  const reserveBtn = document.querySelector(".book-detail-secondary-btn");
  if (reserveBtn) {
    reserveBtn.onclick = () => handleReserve(b._id, reserveBtn);
  }
}

// ── Borrow ────────────────────────────────────────────────────────
async function handleBorrow(id, btn) {
  const token = localStorage.getItem("token");
  btn.disabled = true;
  btn.textContent = "Processing…";
  try {
    const res  = await fetch(`${API}/borrowed`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body:    JSON.stringify({ bookId: id }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast("Book borrowed successfully!", "success");
      btn.textContent = "Borrowed ✓";
    } else {
      showToast(data.message || "Could not borrow book.", "danger");
      btn.disabled    = false;
      btn.textContent = "Borrow Book (14 days)";
    }
  } catch (err) {
    showToast("Server error.", "danger");
    btn.disabled    = false;
    btn.textContent = "Borrow Book (14 days)";
  }
}

// ── Reserve ───────────────────────────────────────────────────────
async function handleReserve(id, btn) {
  const token = localStorage.getItem("token");
  btn.disabled = true;
  btn.textContent = "Processing…";
  try {
    const res  = await fetch(`${API}/borrowed/reserve`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body:    JSON.stringify({ bookId: id }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast("Book reserved successfully!", "success");
      btn.textContent = "Reserved ✓";
    } else {
      showToast(data.message || "Could not reserve book.", "danger");
      btn.disabled    = false;
      btn.textContent = "Reserve Book (3 days)";
    }
  } catch (err) {
    showToast("Server error.", "danger");
    btn.disabled    = false;
    btn.textContent = "Reserve Book (3 days)";
  }
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg, type = "success") {
  let t = document.getElementById("bookToast");
  if (!t) {
    t = document.createElement("div");
    t.id        = "bookToast";
    t.className = "position-fixed bottom-0 end-0 p-3";
    t.style.zIndex = "9999";
    document.body.appendChild(t);
  }
  t.innerHTML = `
    <div class="toast show text-bg-${type} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button>
      </div>
    </div>`;
  setTimeout(() => { t.innerHTML = ""; }, 4000);
}

function showError(msg) {
  const main = document.querySelector(".book-detail-right") || document.querySelector(".book-detail-section");
  if (main) main.innerHTML = `<div class="alert alert-danger m-4">${msg} <a href="search.html">Back to search</a></div>`;
}

// ── Init ──────────────────────────────────────────────────────────
loadBook();
