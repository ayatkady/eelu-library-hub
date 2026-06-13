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
  return `https://placehold.co/95x130/${color}/ffffff?text=${label}&font=open-sans`;
}

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

// ── Browse button ─────────────────────────────────────────────────
document.querySelector(".borrowed-browse-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "search.html";
});

// ── Helpers ───────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLeft(dueDate) {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function statusBadge(loan) {
  const now     = new Date();
  const overdue = loan.status === "borrowed" && loan.dueDate && new Date(loan.dueDate) < now;
  if (overdue)              return `<span class="badge bg-danger">Overdue</span>`;
  if (loan.status === "borrowed")  return `<span class="badge bg-success">Active</span>`;
  if (loan.status === "reserved")  return `<span class="badge bg-warning text-dark">Reserved</span>`;
  if (loan.status === "returned")  return `<span class="badge bg-secondary">Returned</span>`;
  if (loan.status === "cancelled") return `<span class="badge bg-secondary">Cancelled</span>`;
  return `<span class="badge bg-secondary">${loan.status}</span>`;
}

// ── Load borrowed books ───────────────────────────────────────────
async function loadBorrowedBooks() {
  const token     = localStorage.getItem("token");
  const container = document.getElementById("borrowedContainer");
  const emptyCard = document.getElementById("borrowedEmpty");

  if (container) container.innerHTML = `
    <div class="col-12 text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Loading your books…</p>
    </div>`;

  try {
    const res    = await fetch(`${API}/borrowed/my`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const result = await res.json();

    if (!res.ok || !result.success) {
      if (container) container.innerHTML = `<div class="col-12"><div class="alert alert-danger">Failed to load books.</div></div>`;
      return;
    }

    const loans = result.data || [];

    // ── Stats ──────────────────────────────────────────────────
    const now      = new Date();
    const active   = loans.filter((l) => l.status === "borrowed");
    const reserved = loans.filter((l) => l.status === "reserved");
    const overdue  = active.filter((l) => l.dueDate && new Date(l.dueDate) < now);
    const dueSoon  = active.filter((l) => {
      const d = daysLeft(l.dueDate);
      return d !== null && d >= 0 && d <= 3;
    });

    // Update stat cards — target the h2 directly by ID
    const setCount = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setCount("statBorrowed", active.length);
    setCount("statReserved", reserved.length);
    setCount("statDueSoon",  dueSoon.length + overdue.length);

    // Update section heading
    const headingEl = document.getElementById("currentlyBorrowedTitle");
    if (headingEl) headingEl.textContent = `Currently Borrowed (${active.length + reserved.length})`;

    // ── Cards ──────────────────────────────────────────────────
    if (!container) return;

    // Filter to active + reserved only (not returned/cancelled)
    const current = loans.filter((l) => l.status === "borrowed" || l.status === "reserved");

    if (!current.length) {
      if (emptyCard) emptyCard.style.display = "block";
      container.innerHTML = "";
      return;
    }

    if (emptyCard) emptyCard.style.display = "none";

    container.innerHTML = current.map((loan) => {
      const book   = loan.bookId || {};
      const title  = book.title  || "Unknown Book";
      const author = book.author || "Unknown Author";
      const cat    = book.category || "";
      const cover  = `<img src="${bookCoverUrl(book.coverImageUrl, title)}" alt="${title}" class="rounded" width="95" height="130" style="object-fit:cover" onerror="this.onerror=null;this.src='https://placehold.co/95x130/0f2a4a/ffffff?text=Book'">`;

      const borrowed  = fmtDate(loan.borrowDate);
      const due       = fmtDate(loan.dueDate);
      const days      = daysLeft(loan.dueDate);
      const dueLabel  = days !== null
        ? (days < 0  ? `<span class="text-danger fw-semibold">Overdue by ${Math.abs(days)} day(s)</span>`
          : days === 0 ? `<span class="text-warning fw-semibold">Due today!</span>`
          : `${days} day(s) remaining`)
        : "";

      const actionBtn = loan.status === "borrowed"
        ? `<button class="btn btn-outline-danger w-100" onclick="returnBook('${loan._id}', this)">
             <i class="bi bi-arrow-return-left me-1"></i> Return Book
           </button>`
        : loan.status === "reserved"
        ? `<button class="btn btn-outline-warning w-100" onclick="cancelReservation('${loan._id}', this)">
             <i class="bi bi-x-circle me-1"></i> Cancel Reservation
           </button>`
        : "";

      return `
        <div class="col-lg-6" id="loan-${loan._id}">
          <div class="card h-100 border rounded-4 shadow-sm">
            <div class="card-body">
              <div class="d-flex">
                ${cover}
                <div class="ms-3 flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start gap-2">
                    <h4 class="fw-semibold mb-1" style="font-size:1rem">${title}</h4>
                    ${statusBadge(loan)}
                  </div>
                  <p class="text-secondary mb-1 small">by ${author}</p>
                  ${cat ? `<span class="badge text-dark border small">${cat}</span>` : ""}
                  <div class="mt-3">
                    <p class="mb-1 small"><i class="bi bi-calendar-event me-2"></i>Borrowed: ${borrowed}</p>
                    <p class="mb-1 small"><i class="bi bi-clock me-2"></i>Due: ${due} ${dueLabel ? `(${dueLabel})` : ""}</p>
                  </div>
                </div>
              </div>
              <div class="row mt-3 g-2">
                <div class="col-6">${actionBtn}</div>
                <div class="col-6">
                  <button class="btn btn-outline-secondary w-100"
                    onclick="window.location.href='book-details.html?id=${book._id}'">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }).join("");

  } catch (err) {
    console.error(err);
    if (container) container.innerHTML = `<div class="col-12"><div class="alert alert-danger">Server error. Please try again.</div></div>`;
  }
}

// ── Return book ───────────────────────────────────────────────────
async function returnBook(loanId, btn) {
  if (!confirm("Return this book?")) return;
  const token = localStorage.getItem("token");
  btn.disabled    = true;
  btn.textContent = "Processing…";
  try {
    const res  = await fetch(`${API}/borrowed/${loanId}/return`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast("Book returned successfully.", "success");
      await loadBorrowedBooks();
    } else {
      showToast(data.message || "Could not return book.", "danger");
      btn.disabled    = false;
      btn.textContent = "Return Book";
    }
  } catch (err) {
    showToast("Server error.", "danger");
    btn.disabled    = false;
    btn.textContent = "Return Book";
  }
}

// ── Cancel reservation ────────────────────────────────────────────
async function cancelReservation(loanId, btn) {
  if (!confirm("Cancel this reservation?")) return;
  const token = localStorage.getItem("token");
  btn.disabled    = true;
  btn.textContent = "Processing…";
  try {
    const res  = await fetch(`${API}/borrowed/${loanId}/cancel`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast("Reservation cancelled.", "success");
      await loadBorrowedBooks();
    } else {
      showToast(data.message || "Could not cancel reservation.", "danger");
      btn.disabled    = false;
      btn.textContent = "Cancel Reservation";
    }
  } catch (err) {
    showToast("Server error.", "danger");
    btn.disabled    = false;
    btn.textContent = "Cancel Reservation";
  }
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg, type = "success") {
  let t = document.getElementById("borrowedToast");
  if (!t) {
    t = document.createElement("div");
    t.id        = "borrowedToast";
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

// ── Init ──────────────────────────────────────────────────────────
loadBorrowedBooks();
