const API = "http://localhost:3000/api";

// ── Auth guard ────────────────────────────────────────────────────
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// ── Header user info ──────────────────────────────────────────────
setHeaderUser();

function setHeaderUser() {
  const name = localStorage.getItem("userName") || "Student";
  const fac  = localStorage.getItem("faculty")   || "IT";
  const yr   = localStorage.getItem("academicYear") || "Year 1";
  const nameEl = document.querySelector(".user-name");
  const metaEl = document.querySelector(".user-meta");
  if (nameEl) nameEl.textContent = name;
  if (metaEl) metaEl.textContent = `${fac} - ${yr}`;
}

// ── Logout ────────────────────────────────────────────────────────
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ── State ─────────────────────────────────────────────────────────
let allBooks = [];

// ── Fetch books from API ──────────────────────────────────────────
async function loadBooks() {
  const grid        = document.getElementById("bookGrid");
  const resultsCount = document.getElementById("resultsCount");
  if (grid) grid.innerHTML = `
    <div class="text-center py-5 w-100">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Loading books…</p>
    </div>`;

  try {
    const token = localStorage.getItem("token");
    const res   = await fetch(`${API}/books`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const data  = await res.json();

    if (data.success && Array.isArray(data.data)) {
      allBooks = data.data;
    } else {
      allBooks = [];
    }
  } catch (err) {
    console.error("Failed to load books:", err);
    allBooks = [];
  }

  renderBooks(allBooks);
}

// ── Render book cards ─────────────────────────────────────────────
function renderBooks(books) {
  const grid         = document.getElementById("bookGrid");
  const resultsCount = document.getElementById("resultsCount");
  if (!grid) return;

  if (resultsCount) {
    resultsCount.textContent = `Showing ${books.length} book${books.length !== 1 ? "s" : ""}`;
  }

  if (!books.length) {
    grid.innerHTML = `
      <div class="text-center py-5 w-100">
        <i class="bi bi-search fs-1 text-muted"></i>
        <p class="mt-2 text-muted">No books found. Try different filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = books.map((b) => {
    const avail     = b.availableCopies ?? 0;
    const total     = b.totalCopies     ?? 0;
    const availText = avail > 0 ? `${avail} of ${total} copies available` : "Not available";
    const availCls  = avail > 0 ? "text-success" : "text-danger";
    const cover     = b.coverImageUrl
      ? `<img src="${b.coverImageUrl}" alt="${escHtml(b.title)}" />`
      : `<div class="book-card-placeholder"><i class="bi bi-book fs-1 text-muted"></i></div>`;

    return `
      <article class="book-card"
        onclick="goToDetails(this)"
        data-id="${b._id}"
        data-title="${escHtml(b.title)}"
        data-author="${escHtml(b.author)}"
        data-category="${escHtml(b.category)}"
        data-faculty="${escHtml(b.faculty)}"
        data-year="${escHtml(b.academicYear)}">
        ${cover}
        <div class="book-card-body">
          <div class="book-meta-row">
            <span class="badge-faculty">${escHtml(b.faculty)}</span>
            <span class="badge-year">${escHtml(b.academicYear)}</span>
          </div>
          <div class="book-title">${escHtml(b.title)}</div>
          <div class="book-author">by ${escHtml(b.author)}</div>
          <ul class="book-info-list">
            <li class="book-info-row">
              <i class="bi bi-journal-code"></i>
              <span>${escHtml(b.category)}</span>
            </li>
            ${b.pdfUrl ? `<li class="book-info-row"><i class="bi bi-file-earmark-pdf"></i><span>PDF available</span></li>` : ""}
          </ul>
          <div class="book-availability ${availCls}">${availText}</div>
          ${avail > 0 ? `
          <button class="btn btn-primary borrow-btn mt-2"
            onclick="borrowBook(event, this)"
            data-id="${b._id}">
            Borrow Book
          </button>` : `
          <button class="btn btn-outline-secondary mt-2"
            onclick="reserveBook(event, this)"
            data-id="${b._id}">
            Reserve Book
          </button>`}
        </div>
      </article>`;
  }).join("");
}

// ── Filters ───────────────────────────────────────────────────────
function getFiltered() {
  const q    = (document.getElementById("searchInput")?.value   || "").toLowerCase();
  const fac  = (document.getElementById("filterFaculty")?.value || "").toLowerCase();
  const yr   = (document.getElementById("filterYear")?.value    || "").toLowerCase();
  const cat  = (document.getElementById("filterCategory")?.value || "").toLowerCase();

  return allBooks.filter((b) => {
    const matchQ   = !q   || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q);
    const matchFac = !fac || fac === "all faculties" || b.faculty.toLowerCase() === (fac.includes("business") ? "ba" : fac.includes("information") ? "it" : fac);
    const matchYr  = !yr  || yr  === "all years"     || b.academicYear.toLowerCase() === yr;
    const matchCat = !cat || cat === "all categories" || b.category.toLowerCase().includes(cat);
    return matchQ && matchFac && matchYr && matchCat;
  });
}

document.getElementById("searchInput")?.addEventListener("input",  () => renderBooks(getFiltered()));
document.getElementById("filterFaculty")?.addEventListener("change", () => renderBooks(getFiltered()));
document.getElementById("filterYear")?.addEventListener("change",    () => renderBooks(getFiltered()));
document.getElementById("filterCategory")?.addEventListener("change", () => renderBooks(getFiltered()));

document.querySelector(".btn-clear-filters")?.addEventListener("click", () => {
  document.getElementById("searchInput").value   = "";
  document.getElementById("filterFaculty").selectedIndex  = 0;
  document.getElementById("filterYear").selectedIndex     = 0;
  document.getElementById("filterCategory").selectedIndex = 0;
  renderBooks(allBooks);
});

// ── Navigation ────────────────────────────────────────────────────
function goToDetails(card) {
  window.location.href = `book-details.html?id=${card.dataset.id}`;
}

// ── Borrow ────────────────────────────────────────────────────────
async function borrowBook(event, button) {
  event.stopPropagation();
  const bookId = button.dataset.id;
  const token  = localStorage.getItem("token");
  if (!token) { window.location.href = "login.html"; return; }

  button.disabled    = true;
  button.textContent = "Processing…";

  try {
    const res  = await fetch(`${API}/borrowed`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body:    JSON.stringify({ bookId }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast("Book borrowed successfully! Check My Books.", "success");
      await loadBooks(); // refresh availability
    } else {
      showToast(data.message || "Failed to borrow book.", "danger");
      button.disabled    = false;
      button.textContent = "Borrow Book";
    }
  } catch (err) {
    console.error(err);
    showToast("Server error. Please try again.", "danger");
    button.disabled    = false;
    button.textContent = "Borrow Book";
  }
}

// ── Reserve ───────────────────────────────────────────────────────
async function reserveBook(event, button) {
  event.stopPropagation();
  const bookId = button.dataset.id;
  const token  = localStorage.getItem("token");
  if (!token) { window.location.href = "login.html"; return; }

  button.disabled    = true;
  button.textContent = "Processing…";

  try {
    const res  = await fetch(`${API}/borrowed/reserve`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body:    JSON.stringify({ bookId }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast("Book reserved successfully! Check My Books.", "success");
    } else {
      showToast(data.message || "Failed to reserve book.", "danger");
    }
  } catch (err) {
    showToast("Server error. Please try again.", "danger");
  } finally {
    button.disabled    = false;
    button.textContent = "Reserve Book";
  }
}

// ── Toast helper ──────────────────────────────────────────────────
function showToast(msg, type = "success") {
  let t = document.getElementById("searchToast");
  if (!t) {
    t = document.createElement("div");
    t.id        = "searchToast";
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

// ── Util ──────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ── Init ──────────────────────────────────────────────────────────
loadBooks();
