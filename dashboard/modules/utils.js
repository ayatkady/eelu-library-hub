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

// ── Inline SVG initials avatar — no external requests ─────────────
export function avatarDataUri(name, size) {
  size = size || 72;
  const parts    = (name || '?').trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0][0] || '?').toUpperCase();
  const palette  = ['#0f2a4a','#173c6b','#1a4a7a','#0b5bb5','#1e3a5f','#2d6a9f','#1b5e8a','#0d4275'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  const bg   = palette[Math.abs(hash) % palette.length];
  const fs   = Math.round(size * 0.36);
  const svg  = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${bg}"/><text x="${size/2}" y="${size/2}" dy="0.35em" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="${fs}" font-weight="600" fill="#fff">${initials}</text></svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

export function setSidebarUser(user) {
  const nameEl = document.getElementById('sidebarUserName');
  const roleEl = document.getElementById('sidebarUserRole');
  const avatar = document.getElementById('sidebarAvatar');
  if (!user) {
    if (nameEl) nameEl.textContent = 'Guest';
    if (roleEl) roleEl.textContent = '';
    if (avatar) avatar.src = avatarDataUri('Guest', 40);
    return;
  }
  if (nameEl) nameEl.textContent = user.fullName || user.name || user.email;
  if (roleEl) roleEl.textContent = user.role ? (user.role === 'admin' ? 'Administrator' : user.role) : '';
  if (avatar) avatar.src = avatarDataUri(user.fullName || user.email || 'Admin', 40);
}
