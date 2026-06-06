import { api } from '../api.js';
import { showToast } from '../utils.js';

let allMembers = [];

function renderGrid(members) {
  const grid = document.getElementById('membersGrid');
  if (!grid) return;
  if (!members.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);padding:32px 0;text-align:center">No members found</p>';
    return;
  }
  grid.innerHTML = members.map((m) => {
    const name    = m.fullName || m.email || '—';
    const roleLabel = m.role === 'admin' ? 'Administrator' : 'Student';
    const roleColor = m.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)';
    const statusCls = m.isActive ? 'active' : 'inactive';
    const statusLabel = m.isActive ? 'Active' : 'Inactive';
    return `
      <article class="member-card" data-id="${m._id}">
        <div style="position:relative">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}" alt="${name}" />
          <span class="status ${statusCls}" style="position:absolute;top:4px;right:4px;font-size:0.65rem">${statusLabel}</span>
        </div>
        <h3>${name}</h3>
        <p class="role" style="color:${roleColor}">${roleLabel}</p>
        <p class="meta">${m.faculty || ''} · ${m.academicYear || ''}</p>
        <p style="font-size:0.75rem;color:var(--text-muted)">${m.email}</p>
        <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center">
          <button class="btn btn--ghost btn-sm promote-btn"
            data-id="${m._id}"
            data-role="${m.role}"
            style="font-size:0.72rem;padding:4px 10px">
            ${m.role === 'admin' ? 'Demote to Student' : 'Make Admin'}
          </button>
          <button class="btn btn--ghost btn-sm toggle-status-btn"
            data-id="${m._id}"
            data-active="${m.isActive}"
            style="font-size:0.72rem;padding:4px 10px;${!m.isActive ? 'border-color:var(--success);color:var(--success)' : 'border-color:var(--danger);color:var(--danger)'}">
            ${m.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </article>`;
  }).join('');
}

function getFiltered() {
  const q      = (document.getElementById('memberSearch')?.value || '').toLowerCase();
  const role   = document.getElementById('memberRoleFilter')?.value || '';
  const status = document.getElementById('memberStatusFilter')?.value || '';
  const fac    = document.getElementById('memberFacultyFilter')?.value || '';

  return allMembers.filter((m) => {
    const name = (m.fullName || m.email || '').toLowerCase();
    const matchQ = !q || name.includes(q) || (m.email || '').toLowerCase().includes(q);
    const matchR = !role   || m.role === role;
    const matchS = status === '' || (status === 'active' ? m.isActive : !m.isActive);
    const matchF = !fac    || m.faculty === fac;
    return matchQ && matchR && matchS && matchF;
  });
}

async function loadMembers() {
  try {
    const res = await api.get('/admin/users');
    if (res && Array.isArray(res.data)) {
      allMembers = res.data;
      updateMemberStats();
      renderGrid(getFiltered());
    }
  } catch (err) {
    showToast('Failed to load members: ' + err.message);
  }
}

function updateMemberStats() {
  const total    = allMembers.length;
  const admins   = allMembers.filter((m) => m.role === 'admin').length;
  const students = allMembers.filter((m) => m.role === 'student').length;
  const inactive = allMembers.filter((m) => !m.isActive).length;

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('memberStatTotal',    total);
  set('memberStatAdmins',   admins);
  set('memberStatStudents', students);
  set('memberStatInactive', inactive);
}

async function handleGridClick(e) {
  const promote = e.target.closest('.promote-btn');
  const toggle  = e.target.closest('.toggle-status-btn');

  if (promote) {
    const id      = promote.dataset.id;
    const curRole = promote.dataset.role;
    const newRole = curRole === 'admin' ? 'student' : 'admin';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      await api.patch(`/admin/users/${id}/role`, { role: newRole });
      showToast(`User role updated to ${newRole}`);
      await loadMembers();
    } catch (err) {
      showToast(err.message || 'Action failed');
    }
  }

  if (toggle) {
    const id     = toggle.dataset.id;
    const active = toggle.dataset.active === 'true';
    if (!confirm(`${active ? 'Deactivate' : 'Activate'} this user?`)) return;
    try {
      await api.patch(`/admin/users/${id}/status`, {});
      showToast(`User ${active ? 'deactivated' : 'activated'}`);
      await loadMembers();
    } catch (err) {
      showToast(err.message || 'Action failed');
    }
  }
}

function buildMembersPage() {
  const section = document.getElementById('page-members');
  if (!section) return;

  section.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Members</h1>
        <p class="page-desc">Students, faculty, and staff accounts</p>
      </div>
      <button class="btn btn--ghost" id="refreshMembersBtn">↺ Refresh</button>
    </div>

    <!-- Stats -->
    <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin-bottom:24px">
      <article class="stat-card">
        <div class="stat-card__icon stat-card__icon--blue">👥</div>
        <div class="stat-card__body">
          <span class="stat-card__label">Total</span>
          <span class="stat-card__value" id="memberStatTotal">—</span>
        </div>
      </article>
      <article class="stat-card">
        <div class="stat-card__icon stat-card__icon--green">🎓</div>
        <div class="stat-card__body">
          <span class="stat-card__label">Students</span>
          <span class="stat-card__value" id="memberStatStudents">—</span>
        </div>
      </article>
      <article class="stat-card">
        <div class="stat-card__icon stat-card__icon--amber">🔑</div>
        <div class="stat-card__body">
          <span class="stat-card__label">Admins</span>
          <span class="stat-card__value" id="memberStatAdmins">—</span>
        </div>
      </article>
      <article class="stat-card">
        <div class="stat-card__icon stat-card__icon--red">🚫</div>
        <div class="stat-card__body">
          <span class="stat-card__label">Inactive</span>
          <span class="stat-card__value" id="memberStatInactive">—</span>
        </div>
      </article>
    </div>

    <!-- Filters -->
    <div class="table-toolbar" style="flex-wrap:wrap;gap:8px;margin-bottom:20px">
      <input type="search" class="input" id="memberSearch" placeholder="Search name or email…" style="flex:1;min-width:200px" />
      <select class="select" id="memberRoleFilter">
        <option value="">All Roles</option>
        <option value="student">Student</option>
        <option value="admin">Admin</option>
      </select>
      <select class="select" id="memberStatusFilter">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <select class="select" id="memberFacultyFilter">
        <option value="">All Faculties</option>
        <option value="IT">IT</option>
        <option value="BA">BA</option>
      </select>
    </div>

    <div class="members-grid" id="membersGrid">
      <p style="color:var(--text-muted);padding:32px 0;text-align:center">Loading…</p>
    </div>`;
}

export function renderMembersPage() {
  buildMembersPage();

  ['memberSearch', 'memberRoleFilter', 'memberStatusFilter', 'memberFacultyFilter'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input',  () => renderGrid(getFiltered()));
    document.getElementById(id)?.addEventListener('change', () => renderGrid(getFiltered()));
  });

  document.getElementById('refreshMembersBtn')?.addEventListener('click', loadMembers);
  document.getElementById('membersGrid')?.addEventListener('click', handleGridClick);

  // ⚠️ loadMembers() is NOT called here — app.js calls it after auth is confirmed
}

export { loadMembers };
