import { api } from './api.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderBooksPage } from './pages/books.js';
import { renderMembersPage } from './pages/members.js';
import { renderLoansPage } from './pages/loans.js';
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
    renderDashboard();
  }

  // After login
  document.addEventListener('auth:login', () => {
    showDashboardLayout();
    try {
      const u = JSON.parse(localStorage.getItem('adminUser') || 'null');
      setSidebarUser(u);
    } catch (_) { setSidebarUser(null); }
    renderDashboard();
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
  const menuBtn       = document.getElementById('menuBtn');
  const sidebarEl     = document.getElementById('sidebar');
  const overlayEl     = document.getElementById('sidebarOverlay');
  menuBtn?.addEventListener('click', () => sidebarEl?.classList.toggle('open'));
  overlayEl?.addEventListener('click', () => sidebarEl?.classList.remove('open'));
}
