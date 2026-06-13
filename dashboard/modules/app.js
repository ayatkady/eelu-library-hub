import { api } from './api.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderBooksPage, loadBooks } from './pages/books.js';
import { renderMembersPage, loadMembers } from './pages/members.js';
import { renderLoansPage, loadLoans } from './pages/loans.js';
import { renderLogin } from './pages/login.js';
import { setupTheme, setSidebarUser, logout } from './utils.js';

// ─── Auth-gated page navigation ───────────────────────────────────
function showLoginPage() {
  document.getElementById('sidebar').style.display = 'none';
  document.querySelector('.header__search').style.display = 'none';
  document.querySelector('.header__actions').style.display = 'none';
  document.querySelectorAll('.page').forEach((el) => {
    el.classList.remove('active');
    el.style.display = 'none';
  });
  const loginPage = document.getElementById('page-login');
  loginPage.style.display = '';
  loginPage.classList.add('active');
}

function showDashboardLayout() {
  document.getElementById('sidebar').style.display = '';
  document.querySelector('.header__search').style.display = '';
  document.querySelector('.header__actions').style.display = '';
  document.querySelectorAll('.page').forEach((el) => {
    el.style.display = '';
    el.classList.remove('active');
  });
  document.getElementById('page-login').style.display = 'none';
  document.getElementById('page-dashboard').classList.add('active');
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.toggle('active', el.dataset.page === 'dashboard');
  });
}

function navigateTo(page) {
  if (!localStorage.getItem('adminToken')) { showLoginPage(); return; }
  document.querySelectorAll('.nav-item').forEach((el) =>
    el.classList.toggle('active', el.dataset.page === page));
  document.querySelectorAll('.page').forEach((el) =>
    el.classList.toggle('active', el.id === `page-${page}`));
}

// ─── Global Search ────────────────────────────────────────────────
let searchDebounceTimer = null;

function initGlobalSearch() {
  const input = document.getElementById('globalSearch');
  if (!input) return;

  // Dropdown container
  const dropdown = document.createElement('div');
  dropdown.id = 'globalSearchDropdown';
  dropdown.style.cssText = `
    position:absolute; top:calc(100% + 6px); left:0; right:0;
    background:var(--bg-card); border:1px solid var(--border);
    border-radius:12px; box-shadow:var(--shadow-lg);
    z-index:500; overflow:hidden; display:none;
    max-height:400px; overflow-y:auto;
  `;
  input.closest('.header__search').style.position = 'relative';
  input.closest('.header__search').appendChild(dropdown);

  input.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    const q = input.value.trim();
    if (!q) { dropdown.style.display = 'none'; return; }
    searchDebounceTimer = setTimeout(() => runGlobalSearch(q, dropdown), 250);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!input.closest('.header__search').contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });

  // Close on Escape
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { dropdown.style.display = 'none'; input.value = ''; }
  });
}

async function runGlobalSearch(q, dropdown) {
  dropdown.style.display = 'block';
  dropdown.innerHTML = `<div style="padding:16px;color:var(--text-muted);text-align:center;font-size:0.875rem">Searching…</div>`;

  try {
    const token = localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };

    const [booksRes, usersRes, loansRes] = await Promise.allSettled([
      api.get(`/admin/books?q=${encodeURIComponent(q)}`),
      api.get(`/admin/users?q=${encodeURIComponent(q)}`),
      api.get(`/borrowed/admin/all?q=${encodeURIComponent(q)}`),
    ]);

    const books   = booksRes.status  === 'fulfilled' && Array.isArray(booksRes.value?.data)  ? booksRes.value.data  : [];
    const users   = usersRes.status  === 'fulfilled' && Array.isArray(usersRes.value?.data)  ? usersRes.value.data  : [];
    const loans   = loansRes.status  === 'fulfilled' && Array.isArray(loansRes.value?.data)  ? loansRes.value.data  : [];

    // Client-side filter as fallback (API may not support ?q)
    const ql = q.toLowerCase();
    const filteredBooks  = books.filter(b =>
      b.title?.toLowerCase().includes(ql) ||
      b.author?.toLowerCase().includes(ql) ||
      b.category?.toLowerCase().includes(ql)
    ).slice(0, 5);

    const filteredUsers  = users.filter(u =>
      u.fullName?.toLowerCase().includes(ql) ||
      u.email?.toLowerCase().includes(ql)
    ).slice(0, 5);

    const filteredLoans  = loans.filter(l => {
      const user = l.userId || {};
      const book = l.bookId || {};
      return user.fullName?.toLowerCase().includes(ql) ||
             book.title?.toLowerCase().includes(ql);
    }).slice(0, 4);

    const hasResults = filteredBooks.length || filteredUsers.length || filteredLoans.length;
    if (!hasResults) {
      dropdown.innerHTML = `<div style="padding:20px;color:var(--text-muted);text-align:center;font-size:0.875rem">No results for "<strong>${q}</strong>"</div>`;
      return;
    }

    let html = '';

    if (filteredBooks.length) {
      html += `<div style="padding:8px 14px 4px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted)">Books</div>`;
      html += filteredBooks.map(b => `
        <div class="gs-item" data-type="book" data-q="${escAttr(q)}"
          style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:background 0.15s">
          <div style="width:28px;height:36px;background:var(--primary-color);border-radius:4px;flex-shrink:0;
            display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.65rem;font-weight:700;text-align:center;line-height:1.2">
            ${b.title.substring(0,3).toUpperCase()}
          </div>
          <div style="min-width:0">
            <div style="font-size:0.875rem;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${highlight(b.title, q)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${b.author || ''} · ${b.faculty || ''}</div>
          </div>
          <div style="margin-left:auto;flex-shrink:0">
            <span style="font-size:0.7rem;padding:2px 7px;border-radius:999px;background:rgba(22,163,74,0.1);color:var(--success)">${b.availableCopies ?? 0} avail</span>
          </div>
        </div>`).join('');
    }

    if (filteredUsers.length) {
      html += `<div style="padding:8px 14px 4px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);border-top:1px solid var(--border);margin-top:4px">Members</div>`;
      html += filteredUsers.map(u => `
        <div class="gs-item" data-type="member" data-q="${escAttr(q)}"
          style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:background 0.15s">
          <div style="width:32px;height:32px;border-radius:50%;background:var(--primary-color);flex-shrink:0;
            display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.75rem;font-weight:700">
            ${(u.fullName || u.email || '?')[0].toUpperCase()}
          </div>
          <div style="min-width:0">
            <div style="font-size:0.875rem;font-weight:600;color:var(--text)">${highlight(u.fullName || '—', q)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${highlight(u.email || '', q)} · ${u.role || ''}</div>
          </div>
          <span style="margin-left:auto;font-size:0.7rem;padding:2px 7px;border-radius:999px;flex-shrink:0;
            background:${u.isActive ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)'};
            color:${u.isActive ? 'var(--success)' : 'var(--danger)'}">
            ${u.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>`).join('');
    }

    if (filteredLoans.length) {
      html += `<div style="padding:8px 14px 4px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);border-top:1px solid var(--border);margin-top:4px">Loans</div>`;
      html += filteredLoans.map(l => {
        const user  = l.userId || {};
        const book  = l.bookId || {};
        const isOD  = l.status === 'borrowed' && l.dueDate && new Date(l.dueDate) < new Date();
        const cls   = isOD ? 'overdue' : l.status;
        return `
        <div class="gs-item" data-type="loans" data-q="${escAttr(q)}"
          style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:background 0.15s">
          <div style="font-size:1rem;flex-shrink:0">📋</div>
          <div style="min-width:0">
            <div style="font-size:0.875rem;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${book.title || '—'}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${user.fullName || user.email || '—'}</div>
          </div>
          <span style="margin-left:auto;font-size:0.7rem;padding:2px 7px;border-radius:999px;flex-shrink:0" class="status ${cls}">${isOD ? 'Overdue' : l.status}</span>
        </div>`;
      }).join('');
    }

    // "View all results" footer
    html += `<div style="border-top:1px solid var(--border);padding:10px 14px;display:flex;gap:8px;flex-wrap:wrap">`;
    if (filteredBooks.length)  html += `<button class="gs-view-all" data-page="books"   data-q="${escAttr(q)}" style="font-size:0.78rem;padding:4px 10px;border-radius:8px;border:1px solid var(--border);background:transparent;cursor:pointer;color:var(--primary-color);font-weight:600">All Books →</button>`;
    if (filteredUsers.length)  html += `<button class="gs-view-all" data-page="members" data-q="${escAttr(q)}" style="font-size:0.78rem;padding:4px 10px;border-radius:8px;border:1px solid var(--border);background:transparent;cursor:pointer;color:var(--primary-color);font-weight:600">All Members →</button>`;
    if (filteredLoans.length)  html += `<button class="gs-view-all" data-page="loans"   data-q="${escAttr(q)}" style="font-size:0.78rem;padding:4px 10px;border-radius:8px;border:1px solid var(--border);background:transparent;cursor:pointer;color:var(--primary-color);font-weight:600">All Loans →</button>`;
    html += `</div>`;

    dropdown.innerHTML = html;

    // Hover effect
    dropdown.querySelectorAll('.gs-item').forEach(item => {
      item.addEventListener('mouseenter', () => item.style.background = 'var(--bg-card-hover)');
      item.addEventListener('mouseleave', () => item.style.background = '');
    });

    // Click on result row → go to page and apply filter
    dropdown.querySelectorAll('.gs-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.type === 'book' ? 'books' : item.dataset.type === 'member' ? 'members' : 'loans';
        goToPageWithSearch(page, q);
        dropdown.style.display = 'none';
        document.getElementById('globalSearch').value = '';
      });
    });

    // "View all" buttons
    dropdown.querySelectorAll('.gs-view-all').forEach(btn => {
      btn.addEventListener('click', () => {
        goToPageWithSearch(btn.dataset.page, btn.dataset.q);
        dropdown.style.display = 'none';
        document.getElementById('globalSearch').value = '';
      });
    });

  } catch (err) {
    dropdown.innerHTML = `<div style="padding:16px;color:var(--danger);text-align:center;font-size:0.875rem">Search failed. Please try again.</div>`;
    console.error('Global search error:', err);
  }
}

function goToPageWithSearch(page, q) {
  navigateTo(page);
  // Inject query into the page's own search input
  setTimeout(() => {
    const inputMap = { books: 'bookFilter', members: 'memberSearch', loans: 'loanSearch' };
    const el = document.getElementById(inputMap[page]);
    if (el) {
      el.value = q;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, 60);
}

function highlight(text, q) {
  if (!q || !text) return text || '';
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(text).replace(new RegExp(`(${escaped})`, 'gi'),
    '<mark style="background:rgba(11,91,181,0.18);color:inherit;border-radius:2px;padding:0 1px">$1</mark>');
}

function escAttr(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ─── App init ─────────────────────────────────────────────────────
export function initApp() {
  setupTheme();

  // Render all page shells once
  renderLogin();
  renderBooksPage();
  renderMembersPage();
  renderLoansPage();

  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      if (!localStorage.getItem('adminToken')) { showLoginPage(); return; }
      navigateTo(item.dataset.page);
    });
  });

  // "View all" links inside dashboard
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-nav]');
    if (link) { e.preventDefault(); navigateTo(link.dataset.nav); }
  });

  // Auth state
  const token = localStorage.getItem('adminToken');
  if (!token) {
    showLoginPage();
  } else {
    showDashboardLayout();
    try {
      const u = JSON.parse(localStorage.getItem('adminUser') || 'null');
      setSidebarUser(u);
    } catch (_) { setSidebarUser(null); }
    initGlobalSearch();
    loadAllData();
  }

  // After login
  document.addEventListener('auth:login', () => {
    showDashboardLayout();
    try {
      const u = JSON.parse(localStorage.getItem('adminUser') || 'null');
      setSidebarUser(u);
    } catch (_) { setSidebarUser(null); }
    initGlobalSearch();
    loadAllData();
  });

  // Token expired
  document.addEventListener('auth:expired', () => {
    showLoginPage();
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
    showLoginPage();
  });

  // Mobile sidebar
  const menuBtn   = document.getElementById('menuBtn');
  const sidebarEl = document.getElementById('sidebar');
  const overlayEl = document.getElementById('sidebarOverlay');
  menuBtn?.addEventListener('click', () => sidebarEl?.classList.toggle('open'));
  overlayEl?.addEventListener('click', () => sidebarEl?.classList.remove('open'));
}

// Load all data — only called when token is confirmed valid
function loadAllData() {
  renderDashboard();
  loadBooks();
  loadLoans();
  loadMembers();
}
