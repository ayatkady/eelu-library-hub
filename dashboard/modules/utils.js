export function setupTheme() {
  const t = localStorage.getItem('library-theme');
  document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('library-theme', next);
  });
}

export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

export function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
}

export function setSidebarUser(user) {
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  const avatar = document.getElementById('sidebarAvatar');
  if (!user) {
    if (nameEl) nameEl.textContent = 'Guest';
    if (roleEl) roleEl.textContent = '';
    if (avatar) avatar.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest';
    return;
  }
  if (nameEl) nameEl.textContent = user.fullName || user.name || user.email;
  if (roleEl) roleEl.textContent = user.role ? (user.role === 'admin' ? 'Administrator' : user.role) : '';
  if (avatar) avatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullName||user.email||'admin')}`;
}
