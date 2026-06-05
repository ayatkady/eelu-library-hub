import { api } from '../api.js';
import { showToast } from '../utils.js';

let allLoans = [];

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(loan) {
  return loan.status === 'borrowed' && loan.dueDate && new Date(loan.dueDate) < new Date();
}

function statusLabel(loan) {
  if (isOverdue(loan)) return { cls: 'overdue', label: 'Overdue' };
  const map = { borrowed: 'borrowed', reserved: 'reserved', returned: 'returned', cancelled: 'cancelled' };
  return { cls: map[loan.status] || loan.status, label: loan.status || '—' };
}

function renderTable(loans) {
  const tbody = document.getElementById('allLoansTable');
  if (!tbody) return;
  if (!loans.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px">No records found</td></tr>';
    return;
  }
  tbody.innerHTML = loans.map((row) => {
    const user  = row.userId  || {};
    const book  = row.bookId  || {};
    const name  = user.fullName || '—';
    const title = book.title   || '—';
    const { cls, label } = statusLabel(row);
    const canReturn  = row.status === 'borrowed';
    const canCancel  = row.status === 'reserved';
    const idShort    = row._id ? row._id.slice(-6).toUpperCase() : '—';
    return `
      <tr>
        <td style="font-family:monospace;font-size:0.8rem">#${idShort}</td>
        <td>
          <div class="member-cell">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}" alt="" />
            <div>
              <span style="display:block">${name}</span>
              <span style="font-size:0.72rem;color:var(--text-muted)">${user.email || ''}</span>
            </div>
          </div>
        </td>
        <td>${title}</td>
        <td>${fmtDate(row.borrowDate)}</td>
        <td>${fmtDate(row.dueDate)}</td>
        <td><span class="status ${cls}">${label}</span></td>
        <td>
          ${canReturn
            ? `<button class="btn btn--primary btn-sm return-loan-btn" data-id="${row._id}" style="font-size:0.75rem;padding:4px 10px">Return</button>`
            : ''}
          ${canCancel
            ? `<button class="btn btn--ghost btn-sm cancel-loan-btn" data-id="${row._id}" style="font-size:0.75rem;padding:4px 10px">Cancel</button>`
            : ''}
        </td>
      </tr>`;
  }).join('');
}

function getFiltered() {
  const status = document.getElementById('loanStatusFilter')?.value || '';
  const q      = (document.getElementById('loanSearch')?.value || '').toLowerCase();
  return allLoans.filter((row) => {
    const user  = row.userId || {};
    const book  = row.bookId || {};
    const matchQ = !q || (user.fullName || '').toLowerCase().includes(q) || (book.title || '').toLowerCase().includes(q);
    if (!matchQ) return false;
    if (!status) return true;
    if (status === 'overdue') return isOverdue(row);
    return row.status === status;
  });
}

async function loadLoans() {
  try {
    const res = await api.get('/borrowed/admin/all');
    if (res && Array.isArray(res.data)) {
      allLoans = res.data;
      updateStats();
      renderTable(getFiltered());
    }
  } catch (err) {
    showToast('Failed to load loans: ' + err.message);
  }
}

function updateStats() {
  const now = new Date();
  const counts = { borrowed: 0, reserved: 0, returned: 0, overdue: 0 };
  allLoans.forEach((l) => {
    counts[l.status] = (counts[l.status] || 0) + 1;
    if (l.status === 'borrowed' && l.dueDate && new Date(l.dueDate) < now) counts.overdue++;
  });
  const map = { loanStatBorrowed: 'borrowed', loanStatReserved: 'reserved', loanStatReturned: 'returned', loanStatOverdue: 'overdue' };
  Object.entries(map).forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    if (el) el.textContent = counts[key] ?? 0;
  });
}

async function handleTableClick(e) {
  const returnBtn = e.target.closest('.return-loan-btn');
  const cancelBtn = e.target.closest('.cancel-loan-btn');

  if (returnBtn) {
    const id = returnBtn.dataset.id;
    if (!confirm('Mark this book as returned?')) return;
    try {
      await api.put(`/borrowed/${id}/return`, {});
      showToast('Book returned successfully');
      await loadLoans();
    } catch (err) {
      showToast(err.message || 'Action failed');
    }
  }

  if (cancelBtn) {
    const id = cancelBtn.dataset.id;
    if (!confirm('Cancel this reservation?')) return;
    try {
      await api.put(`/borrowed/${id}/cancel`, {});
      showToast('Reservation cancelled');
      await loadLoans();
    } catch (err) {
      showToast(err.message || 'Action failed');
    }
  }
}

function buildLoansPage() {
  const section = document.getElementById('page-loans');
  if (!section) return;

  section.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Loans &amp; Returns</h1>
        <p class="page-desc">Track all borrowing and return transactions</p>
      </div>
    </div>

    <!-- Quick stats -->
    <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:24px">
      <article class="stat-card">
        <div class="stat-card__icon stat-card__icon--amber">📖</div>
        <div class="stat-card__body">
          <span class="stat-card__label">Borrowed</span>
          <span class="stat-card__value" id="loanStatBorrowed">—</span>
        </div>
      </article>
      <article class="stat-card">
        <div class="stat-card__icon stat-card__icon--blue">🔖</div>
        <div class="stat-card__body">
          <span class="stat-card__label">Reserved</span>
          <span class="stat-card__value" id="loanStatReserved">—</span>
        </div>
      </article>
      <article class="stat-card">
        <div class="stat-card__icon stat-card__icon--green">✅</div>
        <div class="stat-card__body">
          <span class="stat-card__label">Returned</span>
          <span class="stat-card__value" id="loanStatReturned">—</span>
        </div>
      </article>
      <article class="stat-card">
        <div class="stat-card__icon stat-card__icon--red">⚠️</div>
        <div class="stat-card__body">
          <span class="stat-card__label">Overdue</span>
          <span class="stat-card__value" id="loanStatOverdue">—</span>
        </div>
      </article>
    </div>

    <div class="card">
      <div class="table-toolbar" style="flex-wrap:wrap;gap:8px">
        <input type="search" class="input" id="loanSearch" placeholder="Search member or book…" style="flex:1;min-width:200px" />
        <select class="select" id="loanStatusFilter">
          <option value="">All Status</option>
          <option value="borrowed">Borrowed</option>
          <option value="reserved">Reserved</option>
          <option value="returned">Returned</option>
          <option value="cancelled">Cancelled</option>
          <option value="overdue">Overdue</option>
        </select>
        <button class="btn btn--ghost" id="refreshLoansBtn">↺ Refresh</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Member</th>
              <th>Book</th>
              <th>Borrowed</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="allLoansTable"><tr><td colspan="7" style="text-align:center;padding:32px">Loading…</td></tr></tbody>
        </table>
      </div>
    </div>`;
}

export function renderLoansPage() {
  buildLoansPage();

  document.getElementById('loanStatusFilter')?.addEventListener('change', () => renderTable(getFiltered()));
  document.getElementById('loanSearch')?.addEventListener('input', () => renderTable(getFiltered()));
  document.getElementById('refreshLoansBtn')?.addEventListener('click', loadLoans);
  document.getElementById('allLoansTable')?.addEventListener('click', handleTableClick);

  loadLoans();
}

export { loadLoans };
