import { api } from '../api.js';
import { showToast } from '../utils.js';

const FACULTIES     = ['IT', 'BA'];
const YEARS         = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];
const CATEGORIES    = ['Computer Science', 'Web Development', 'Artificial Intelligence',
                       'Software Engineering', 'Cloud Computing', 'Cybersecurity',
                       'Marketing', 'Business Administration', 'Accounting', 'Other'];

let allBooks = [];
let editingId = null;

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderTable(books) {
  const tbody = document.getElementById('booksTable');
  if (!tbody) return;
  if (!books.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px">No books found</td></tr>';
    return;
  }
  tbody.innerHTML = books.map((b) => {
    const status   = b.isActive ? 'active' : 'inactive';
    const label    = b.isActive ? 'Active' : 'Archived';
    const avail    = b.availableCopies ?? 0;
    const total    = b.totalCopies ?? 0;
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            ${b.coverImageUrl
              ? `<img src="${b.coverImageUrl}" alt="" style="width:36px;height:48px;object-fit:cover;border-radius:4px;flex-shrink:0">`
              : `<div style="width:36px;height:48px;background:var(--border);border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px">📚</div>`}
            <div>
              <strong style="display:block">${b.title}</strong>
              <span style="font-size:0.75rem;color:var(--text-muted)">${b.faculty} · ${b.academicYear}</span>
            </div>
          </div>
        </td>
        <td>${b.author}</td>
        <td>${b.category}</td>
        <td style="text-align:center">
          <span style="font-weight:600;color:${avail === 0 ? 'var(--danger)' : 'var(--success)'}">${avail}</span>
          <span style="color:var(--text-muted)"> / ${total}</span>
        </td>
        <td><span class="status ${status}">${label}</span></td>
        <td>${fmtDate(b.createdAt)}</td>
        <td>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn--ghost btn-sm edit-book-btn"   data-id="${b._id}">Edit</button>
            <button class="btn btn--ghost btn-sm toggle-book-btn" data-id="${b._id}" data-active="${b.isActive}">
              ${b.isActive ? 'Archive' : 'Restore'}
            </button>
            <button class="btn btn-sm delete-book-btn" data-id="${b._id}"
              style="background:transparent;border:1px solid var(--danger);color:var(--danger);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.75rem">
              Delete
            </button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function getFilteredBooks() {
  const q      = (document.getElementById('bookFilter')?.value || '').toLowerCase();
  const fac    = document.getElementById('bookFacultyFilter')?.value || '';
  const yr     = document.getElementById('bookYearFilter')?.value || '';
  const status = document.getElementById('bookStatusFilter')?.value || '';

  return allBooks.filter((b) => {
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.category.toLowerCase().includes(q);
    const matchF = !fac    || b.faculty === fac;
    const matchY = !yr     || b.academicYear === yr;
    const matchS = status === '' || (status === 'active' ? b.isActive : !b.isActive);
    return matchQ && matchF && matchY && matchS;
  });
}

async function loadBooks() {
  try {
    const res = await api.get('/admin/books');
    if (res && Array.isArray(res.data)) {
      allBooks = res.data;
      renderTable(getFilteredBooks());
    }
  } catch (err) {
    showToast('Failed to load books: ' + err.message);
  }
}

// ─── Book Modal ───────────────────────────────────────────────────
function openBookModal(book = null) {
  editingId = book ? book._id : null;

  const modal   = document.getElementById('bookModal');
  const title   = document.getElementById('bookModalTitle');
  const form    = document.getElementById('bookForm');
  if (!modal || !form) return;

  title.textContent = book ? 'Edit Book' : 'Add New Book';
  form.reset();

  if (book) {
    form.bTitle.value         = book.title       || '';
    form.bAuthor.value        = book.author      || '';
    form.bCategory.value      = book.category    || '';
    form.bFaculty.value       = book.faculty     || '';
    form.bYear.value          = book.academicYear|| '';
    form.bDescription.value   = book.description || '';
    form.bCoverUrl.value      = book.coverImageUrl|| '';
    form.bPdfUrl.value        = book.pdfUrl      || '';
    form.bTotalCopies.value   = book.totalCopies ?? 1;
    form.bAvailCopies.value   = book.availableCopies ?? 1;
  }

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeBookModal() {
  const modal = document.getElementById('bookModal');
  if (modal) { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
  editingId = null;
}

async function handleBookFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const body = {
    title:          form.bTitle.value.trim(),
    author:         form.bAuthor.value.trim(),
    category:       form.bCategory.value.trim(),
    faculty:        form.bFaculty.value,
    academicYear:   form.bYear.value,
    description:    form.bDescription.value.trim(),
    coverImageUrl:  form.bCoverUrl.value.trim(),
    pdfUrl:         form.bPdfUrl.value.trim(),
    totalCopies:    Number(form.bTotalCopies.value),
    availableCopies:Number(form.bAvailCopies.value),
  };

  try {
    if (editingId) {
      await api.put(`/books/${editingId}`, body);
      showToast('Book updated successfully');
    } else {
      await api.post('/books', body);
      showToast('Book added successfully');
    }
    closeBookModal();
    await loadBooks();
  } catch (err) {
    showToast(err.message || 'Save failed');
  }
}

// ─── Table actions (delegate) ──────────────────────────────────────
async function handleTableClick(e) {
  const editBtn   = e.target.closest('.edit-book-btn');
  const toggleBtn = e.target.closest('.toggle-book-btn');
  const deleteBtn = e.target.closest('.delete-book-btn');

  if (editBtn) {
    const id   = editBtn.dataset.id;
    const book = allBooks.find((b) => b._id === id);
    if (book) openBookModal(book);
  }

  if (toggleBtn) {
    const id     = toggleBtn.dataset.id;
    const active = toggleBtn.dataset.active === 'true';
    const label  = active ? 'archive' : 'restore';
    if (!confirm(`Are you sure you want to ${label} this book?`)) return;
    try {
      await api.patch(`/books/${id}/toggle-status`, {});
      showToast(`Book ${active ? 'archived' : 'restored'} successfully`);
      await loadBooks();
    } catch (err) {
      showToast(err.message || 'Action failed');
    }
  }

  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    if (!confirm('Permanently delete this book? This cannot be undone.')) return;
    try {
      await api.del(`/books/${id}`);
      showToast('Book deleted');
      await loadBooks();
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
  }
}

// ─── Build the books page HTML ─────────────────────────────────────
function buildBooksPage() {
  const section = document.getElementById('page-books');
  if (!section) return;

  const facultyOpts = FACULTIES.map((f) => `<option value="${f}">${f}</option>`).join('');
  const yearOpts    = YEARS.map((y) => `<option value="${y}">${y}</option>`).join('');
  const catOpts     = CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('');

  section.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Books Catalog</h1>
        <p class="page-desc">Manage your library collection</p>
      </div>
      <button class="btn btn--primary" id="addBookBtn">+ Add New Book</button>
    </div>

    <div class="card">
      <div class="table-toolbar" style="flex-wrap:wrap;gap:8px">
        <input type="search" class="input" placeholder="Search title, author, category…" id="bookFilter" style="flex:1;min-width:200px" />
        <select class="select" id="bookFacultyFilter">
          <option value="">All Faculties</option>
          ${facultyOpts}
        </select>
        <select class="select" id="bookYearFilter">
          <option value="">All Years</option>
          ${yearOpts}
        </select>
        <select class="select" id="bookStatusFilter">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Archived</option>
        </select>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Author</th>
              <th>Category</th>
              <th style="text-align:center">Copies</th>
              <th>Status</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="booksTable"><tr><td colspan="8" style="text-align:center;padding:32px">Loading…</td></tr></tbody>
        </table>
      </div>
    </div>

    <!-- Book Modal -->
    <div class="modal" id="bookModal" aria-hidden="true">
      <div class="modal__backdrop" id="bookModalBackdrop"></div>
      <div class="modal__dialog" style="max-width:560px;max-height:90vh;overflow-y:auto">
        <div class="modal__header">
          <h2 id="bookModalTitle">Add New Book</h2>
          <button class="icon-btn" id="closeBookModal" aria-label="Close">&times;</button>
        </div>
        <form class="modal__form" id="bookForm" autocomplete="off">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div style="grid-column:1/-1">
              <label class="form-label">Title *</label>
              <input type="text" class="input" name="bTitle" required placeholder="Book title" />
            </div>
            <div>
              <label class="form-label">Author *</label>
              <input type="text" class="input" name="bAuthor" required placeholder="Author name" />
            </div>
            <div>
              <label class="form-label">Category *</label>
              <input type="text" class="input" name="bCategory" required placeholder="e.g. Computer Science" list="categoryList" />
              <datalist id="categoryList">${catOpts}</datalist>
            </div>
            <div>
              <label class="form-label">Faculty *</label>
              <select class="select" name="bFaculty" required>
                <option value="">Select faculty</option>
                ${facultyOpts}
              </select>
            </div>
            <div>
              <label class="form-label">Academic Year *</label>
              <select class="select" name="bYear" required>
                <option value="">Select year</option>
                ${yearOpts}
              </select>
            </div>
            <div>
              <label class="form-label">Total Copies *</label>
              <input type="number" class="input" name="bTotalCopies" required min="0" value="1" />
            </div>
            <div>
              <label class="form-label">Available Copies *</label>
              <input type="number" class="input" name="bAvailCopies" required min="0" value="1" />
            </div>
            <div style="grid-column:1/-1">
              <label class="form-label">Description *</label>
              <textarea class="input" name="bDescription" required rows="3" placeholder="Short description…" style="resize:vertical"></textarea>
            </div>
            <div style="grid-column:1/-1">
              <label class="form-label">Cover Image URL</label>
              <input type="url" class="input" name="bCoverUrl" placeholder="https://…" />
            </div>
            <div style="grid-column:1/-1">
              <label class="form-label">PDF URL</label>
              <input type="url" class="input" name="bPdfUrl" placeholder="https://…" />
            </div>
          </div>
          <div class="modal__actions">
            <button type="button" class="btn btn--ghost" id="cancelBookModal">Cancel</button>
            <button type="submit" class="btn btn--primary" id="bookFormSubmitBtn">Save Book</button>
          </div>
        </form>
      </div>
    </div>`;
}

export function renderBooksPage() {
  buildBooksPage();

  // Wire modal open/close
  document.getElementById('addBookBtn')?.addEventListener('click', () => openBookModal());
  document.getElementById('closeBookModal')?.addEventListener('click', closeBookModal);
  document.getElementById('cancelBookModal')?.addEventListener('click', closeBookModal);
  document.getElementById('bookModalBackdrop')?.addEventListener('click', closeBookModal);

  // Form submit
  document.getElementById('bookForm')?.addEventListener('submit', handleBookFormSubmit);

  // Filters
  ['bookFilter', 'bookFacultyFilter', 'bookYearFilter', 'bookStatusFilter'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', () => renderTable(getFilteredBooks()));
    document.getElementById(id)?.addEventListener('change', () => renderTable(getFilteredBooks()));
  });

  // Table actions
  document.getElementById('booksTable')?.addEventListener('click', handleTableClick);

  // ⚠️ loadBooks() is NOT called here — app.js calls it after auth is confirmed
}

// Re-export so app.js can call reload after login
export { loadBooks };
