import { api } from '../api.js';
import { showToast } from '../utils.js';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderStats(data) {
  const map = {
    books:          'books',
    members:        'users',
    loans:          'borrowedActive',
    overdue:        'overdue',
    reserved:       'reserved',
    contacts:       'contacts',
  };
  Object.entries(map).forEach(([statKey, dataKey]) => {
    const el = document.querySelector(`[data-stat="${statKey}"]`);
    if (el && data[dataKey] != null) el.textContent = data[dataKey];
  });
}

function renderRecentLoans(rows) {
  const tbody = document.getElementById('recentLoansTable');
  if (!tbody) return;
  if (!rows || !rows.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">No recent loans</td></tr>';
    return;
  }
  tbody.innerHTML = rows.slice(0, 8).map((row) => {
    const user  = row.userId  || {};
    const book  = row.bookId  || {};
    const name  = user.fullName || '—';
    const title = book.title  || '—';
    const borrowed = fmtDate(row.borrowDate);
    const due      = fmtDate(row.dueDate);
    const now      = new Date();
    const isOverdue = row.status === 'borrowed' && row.dueDate && new Date(row.dueDate) < now;
    const statusClass = isOverdue ? 'overdue' : row.status;
    const statusLabel = isOverdue ? 'Overdue' : (row.status || 'active');
    return `
      <tr>
        <td>
          <div class="member-cell">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}" alt="" />
            <span>${name}</span>
          </div>
        </td>
        <td>${title}</td>
        <td>${borrowed}</td>
        <td>${due}</td>
        <td><span class="status ${statusClass}">${statusLabel}</span></td>
      </tr>`;
  }).join('');
}

function renderPopular(list) {
  const container = document.getElementById('popularBooks');
  if (!container) return;
  if (!list || !list.length) {
    container.innerHTML = '<li style="color:var(--text-muted);padding:8px 0">No data available</li>';
    return;
  }
  container.innerHTML = list.slice(0, 6).map((b, i) => `
    <li>
      <span class="book-rank">${i + 1}</span>
      <div class="book-info">
        <strong>${b.title}</strong>
        <span>${b.author || ''}</span>
      </div>
      <span class="book-loans">${b.borrowCount || 0} loans</span>
    </li>
  `).join('');
}

export async function renderDashboard() {
  try {
    const statsRes = await api.get('/admin/dashboard');
    if (statsRes && statsRes.data) renderStats(statsRes.data);

    const loansRes = await api.get('/borrowed/admin/all?status=borrowed');
    if (loansRes && Array.isArray(loansRes.data)) {
      renderRecentLoans(loansRes.data);
    }

    const booksRes = await api.get('/books?includeInactive=false');
    if (booksRes && Array.isArray(booksRes.data)) {
      // Sort by most loaned isn't directly available; show newest books as popular fallback
      renderPopular(booksRes.data.slice(0, 6));
    }
  } catch (err) {
    showToast('Failed to load dashboard data');
    console.error(err);
  }
}
