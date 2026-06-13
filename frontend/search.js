const API = "http://localhost:3000/api";

// ── Book cover helper — fallback to generated placeholder ────────
function bookCoverUrl(coverImageUrl, title) {
  if (coverImageUrl && coverImageUrl.trim()) return coverImageUrl.trim();
  const colors = ['0f2a4a', '1a4a7a', '173c6b', '0b5bb5', '1e3a5f', '2d6a9f'];
  let hash = 0;
  const seed = title || 'book';
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  const color = colors[Math.abs(hash) % colors.length];
  const label = encodeURIComponent(seed.substring(0, 15));
  return `https://placehold.co/200x280/${color}/ffffff?text=${label}&font=open-sans`;
}

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
    const availText = avail > 0
      ? `<i class="bi bi-check-circle-fill me-1"></i>${avail} of ${total} copies available`
      : `<i class="bi bi-x-circle-fill me-1"></i>Not available`;
    const availCls  = avail > 0 ? "book-avail-ok" : "book-avail-no";

    const cover = `<img src="${bookCoverUrl(b.coverImageUrl, b.title)}" alt="${escHtml(b.title)}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/200x280/0f2a4a/ffffff?text=Book'" />`;

    const actionBtn = avail > 0
      ? `<button class="book-borrow-btn" onclick="handleBorrow(event,'${b._id}',this)">
           <i class="bi bi-book me-1"></i>Borrow Book
         </button>`
      : `<button class="book-reserve-btn" onclick="handleReserve(event,'${b._id}',this)">
           <i class="bi bi-bookmark me-1"></i>Reserve
         </button>`;

    return `
      <article class="book-card" data-id="${b._id}" onclick="goToDetails('${b._id}')">
        <div class="book-card-img-wrap">${cover}</div>
        <div class="book-card-body">
          <div class="book-meta-row">
            <span class="badge-faculty">${escHtml(b.faculty)}</span>
            <span class="badge-year">${escHtml(b.academicYear)}</span>
          </div>
          <div class="book-title">${escHtml(b.title)}</div>
          <div class="book-author">by ${escHtml(b.author)}</div>
          <ul class="book-info-list">
            <li class="book-info-row">
              <i class="bi bi-tag"></i>
              <span>${escHtml(b.category)}</span>
            </li>
            <li class="book-info-row">
              <i class="bi bi-people"></i>
              <span>${escHtml(b.faculty)} Faculty</span>
            </li>
            ${b.pdfUrl ? `<li class="book-info-row"><i class="bi bi-file-earmark-pdf"></i><span>PDF available</span></li>` : ""}
          </ul>
          <div class="book-availability ${availCls}">${availText}</div>
          <div class="book-card-actions" onclick="event.stopPropagation()">
            ${actionBtn}
            <button class="book-details-btn" onclick="goToDetails('${b._id}')">
              Details
            </button>
          </div>
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
function goToDetails(id) {
  window.location.href = `book-details.html?id=${id}`;
}

// ── Borrow (goes to my-borrowed after success) ────────────────────
async function handleBorrow(event, bookId, button) {
  event.stopPropagation();
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "login.html"; return; }

  button.disabled   = true;
  button.innerHTML  = `<span class="spinner-border spinner-border-sm me-1"></span>Processing…`;

  try {
    const res  = await fetch(`${API}/borrowed`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body:    JSON.stringify({ bookId }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      // Redirect straight to My Books
      window.location.href = "my-borrowed.html";
    } else {
      showToast(data.message || "Failed to borrow book.", "danger");
      button.disabled  = false;
      button.innerHTML = `<i class="bi bi-book me-1"></i>Borrow Book`;
    }
  } catch (err) {
    showToast("Server error. Please try again.", "danger");
    button.disabled  = false;
    button.innerHTML = `<i class="bi bi-book me-1"></i>Borrow Book`;
  }
}

// ── Reserve ───────────────────────────────────────────────────────
async function handleReserve(event, bookId, button) {
  event.stopPropagation();
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "login.html"; return; }

  button.disabled   = true;
  button.innerHTML  = `<span class="spinner-border spinner-border-sm me-1"></span>Processing…`;

  try {
    const res  = await fetch(`${API}/borrowed/reserve`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body:    JSON.stringify({ bookId }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      window.location.href = "my-borrowed.html";
    } else {
      showToast(data.message || "Failed to reserve book.", "danger");
      button.disabled  = false;
      button.innerHTML = `<i class="bi bi-bookmark me-1"></i>Reserve`;
    }
  } catch (err) {
    showToast("Server error.", "danger");
    button.disabled  = false;
    button.innerHTML = `<i class="bi bi-bookmark me-1"></i>Reserve`;
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
loadBooks().then(() => {
  // Apply URL params after books are loaded
  const params  = new URLSearchParams(window.location.search);
  const faculty = (params.get("faculty") || "").toUpperCase();
  if (faculty === "IT" || faculty === "BA") {
    const select = document.getElementById("filterFaculty");
    if (select) {
      // Find the matching option — text contains "IT" or "BA"
      for (const opt of select.options) {
        const txt = opt.text.toUpperCase();
        if (faculty === "IT" && txt.includes("INFORMATION")) { select.value = opt.text; break; }
        if (faculty === "BA" && txt.includes("BUSINESS"))    { select.value = opt.text; break; }
      }
      renderBooks(getFiltered());
      // Scroll to book grid
      document.getElementById("bookGrid")?.closest("section,div")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
});
