const API = "http://localhost:3000/api";

// ── Auth guard ────────────────────────────────────────────────────
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// ── Header ────────────────────────────────────────────────────────
const _hn = document.getElementById("headerUserName");
const _hm = document.getElementById("headerUserMeta");
if (_hn) _hn.textContent = localStorage.getItem("userName") || "Student";
if (_hm) _hm.textContent = `${localStorage.getItem("faculty") || "IT"} - ${localStorage.getItem("academicYear") || "Year 1"}`;

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ── Get book ID ───────────────────────────────────────────────────
const bookId = new URLSearchParams(window.location.search).get("id");
if (!bookId) window.location.href = "search.html";

// ── Load book ─────────────────────────────────────────────────────
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
    showError("Failed to load book details. Please try again.");
  }
}

// ── Render ────────────────────────────────────────────────────────
function renderBook(b) {
  const avail = b.availableCopies ?? 0;
  const total = b.totalCopies     ?? 0;
  const pct   = total > 0 ? Math.round((avail / total) * 100) : 0;

  // Cover
  const coverImg = document.getElementById("bdCoverImg");
  if (coverImg) {
    coverImg.src = b.coverImageUrl || "https://placehold.co/300x420?text=No+Cover";
    coverImg.alt = b.title;
  }

  // Availability badge
  const availBadge = document.getElementById("bdAvailBadge");
  if (availBadge) {
    availBadge.textContent = avail > 0 ? "Available" : "Not Available";
    availBadge.className   = avail > 0
      ? "bd-avail-badge bd-avail-badge--ok"
      : "bd-avail-badge bd-avail-badge--no";
  }

  // Copies row
  const copiesText = document.getElementById("bdCopiesText");
  if (copiesText) copiesText.textContent = `${avail} of ${total} copies available`;

  // Availability bar
  const fill  = document.getElementById("bdAvailFill");
  const label = document.getElementById("bdAvailLabel");
  if (fill)  { fill.style.width = pct + "%"; fill.style.background = avail > 0 ? "#16a34a" : "#dc2626"; }
  if (label) label.textContent = avail > 0
    ? `${avail} copies currently available out of ${total}`
    : "All copies are currently borrowed";

  // Badges
  setText("bdFaculty",  b.faculty);
  setText("bdYear",     b.academicYear);
  setText("bdCategory", b.category);

  // Title + Author
  setText("bdTitle",  b.title);
  setText("bdAuthor", `by ${b.author}`);

  // Description
  setText("bdDescription", b.description || "No description available.");

  // Info grid
  setText("infoAuthor",   b.author);
  setText("infoCategory", b.category);
  setText("infoFaculty",  b.faculty);
  setText("infoYear",     b.academicYear);
  setText("infoTotal",    total + " copies");
  setText("infoAvail",    avail + " copies");

  // Page title
  document.title = `${b.title} – EELU Library Hub`;

  // Wire buttons
  wireBorrowBtn(b._id, avail);
  wireReserveBtn(b._id);
  wirePdfBtn(b.pdfUrl);

  // Show content
  document.getElementById("bdLoading").style.display = "none";
  document.getElementById("bdContent").style.display  = "";
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || "—";
}

// ── Borrow ────────────────────────────────────────────────────────
function wireBorrowBtn(id, avail) {
  const btn = document.getElementById("bdBorrowBtn");
  if (!btn) return;

  if (avail <= 0) {
    btn.disabled = true;
    btn.innerHTML = `<i class="bi bi-slash-circle me-1"></i>No Copies Available<span class="bd-btn-sub">All copies borrowed</span>`;
    btn.classList.add("bd-btn-primary--disabled");
    return;
  }

  btn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Processing…<span class="bd-btn-sub">Please wait</span>`;

    try {
      const res  = await fetch(`${API}/borrowed`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ bookId: id }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Book borrowed successfully!", "success");
        btn.innerHTML = `<i class="bi bi-check-circle me-1"></i>Borrowed!<span class="bd-btn-sub">Check My Books</span>`;
        setTimeout(() => { window.location.href = "my-borrowed.html"; }, 1200);
      } else {
        showToast(data.message || "Could not borrow book.", "danger");
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-book-half me-1"></i>Borrow Book<span class="bd-btn-sub">14 days loan</span>`;
      }
    } catch (err) {
      showToast("Server error. Please try again.", "danger");
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-book-half me-1"></i>Borrow Book<span class="bd-btn-sub">14 days loan</span>`;
    }
  });
}

// ── Reserve ───────────────────────────────────────────────────────
function wireReserveBtn(id) {
  const btn = document.getElementById("bdReserveBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Processing…<span class="bd-btn-sub">Please wait</span>`;

    try {
      const res  = await fetch(`${API}/borrowed/reserve`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ bookId: id }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("Book reserved successfully!", "success");
        btn.innerHTML = `<i class="bi bi-check-circle me-1"></i>Reserved!<span class="bd-btn-sub">Check My Books</span>`;
        setTimeout(() => { window.location.href = "my-borrowed.html"; }, 1200);
      } else {
        showToast(data.message || "Could not reserve book.", "danger");
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-bookmark me-1"></i>Reserve Book<span class="bd-btn-sub">Hold for 3 days</span>`;
      }
    } catch (err) {
      showToast("Server error.", "danger");
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-bookmark me-1"></i>Reserve Book<span class="bd-btn-sub">Hold for 3 days</span>`;
    }
  });
}

// ── PDF ───────────────────────────────────────────────────────────
function wirePdfBtn(pdfUrl) {
  const btn = document.getElementById("bdPdfBtn");
  if (!btn) return;
  if (pdfUrl) {
    btn.addEventListener("click", () => window.open(pdfUrl, "_blank"));
  } else {
    btn.disabled = true;
    btn.innerHTML = `<i class="bi bi-file-earmark-x me-1"></i>PDF Not Available`;
  }
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg, type = "success") {
  let t = document.getElementById("bdToast");
  if (!t) {
    t = document.createElement("div");
    t.id        = "bdToast";
    t.className = "position-fixed bottom-0 end-0 p-3";
    t.style.zIndex = "9999";
    document.body.appendChild(t);
  }
  t.innerHTML = `
    <div class="toast show text-bg-${type} border-0" role="alert">
      <div class="d-flex align-items-center">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto"
          onclick="this.closest('.toast').remove()"></button>
      </div>
    </div>`;
  setTimeout(() => { if (t) t.innerHTML = ""; }, 4000);
}

// ── Error ─────────────────────────────────────────────────────────
function showError(msg) {
  document.getElementById("bdLoading").style.display = "none";
  const wrap = document.querySelector(".bd-container");
  if (wrap) {
    const err = document.createElement("div");
    err.className = "bd-error-state";
    err.innerHTML = `
      <i class="bi bi-exclamation-circle"></i>
      <h2>${msg}</h2>
      <a href="search.html" class="bd-btn-primary" style="text-decoration:none;display:inline-flex">
        <i class="bi bi-arrow-left me-1"></i>Back to Search
      </a>`;
    wrap.appendChild(err);
  }
}

// ── Init ──────────────────────────────────────────────────────────
loadBook();
