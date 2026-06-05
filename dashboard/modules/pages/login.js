import { api } from '../api.js';
import { showToast } from '../utils.js';

export function renderLogin() {
  const section = document.getElementById('page-login');
  if (!section) return;

  // Build full-screen login UI
  section.innerHTML = `
    <div class="login-screen">

      <!-- Left panel — branding -->
      <div class="login-panel login-panel--left">
        <div class="login-brand">
          <div class="login-brand__logo">
            <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <rect x="4" y="4" width="40" height="40" rx="10" stroke="currentColor" stroke-width="2.5" fill="none"/>
              <path d="M12 14h24v3H12V14zm0 9h16v3H12v-3zm0 9h20v3H12v-3z" fill="currentColor"/>
            </svg>
          </div>
          <h1 class="login-brand__name">EELU Library</h1>
          <p class="login-brand__tagline">Admin Management System</p>
        </div>

        <ul class="login-features">
          <li>
            <span class="login-features__icon">📚</span>
            <div>
              <strong>Books Catalog</strong>
              <span>Add, edit and manage the full collection</span>
            </div>
          </li>
          <li>
            <span class="login-features__icon">📋</span>
            <div>
              <strong>Loans &amp; Returns</strong>
              <span>Track all borrowing activity in real time</span>
            </div>
          </li>
          <li>
            <span class="login-features__icon">👥</span>
            <div>
              <strong>Member Management</strong>
              <span>Control user roles and account status</span>
            </div>
          </li>
        </ul>

        <p class="login-panel__copy">© 2025 EELU – Egyptian E-Learning University</p>
      </div>

      <!-- Right panel — form -->
      <div class="login-panel login-panel--right">
        <div class="login-card">
          <div class="login-card__header">
            <div class="login-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to your admin account</p>
          </div>

          <form id="loginForm" class="login-form" autocomplete="off" novalidate>

            <div class="login-field">
              <label for="loginEmail">Email address</label>
              <div class="login-field__wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input type="email" id="loginEmail" placeholder="admin@eelu.edu.eg" required autocomplete="email" />
              </div>
              <span class="login-field__error" id="emailError"></span>
            </div>

            <div class="login-field">
              <label for="loginPassword">Password</label>
              <div class="login-field__wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input type="password" id="loginPassword" placeholder="••••••••" required autocomplete="current-password" />
                <button type="button" class="login-field__toggle" id="togglePassword" aria-label="Show password">
                  <svg class="eye-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg class="eye-closed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <span class="login-field__error" id="passwordError"></span>
            </div>

            <button type="submit" class="login-submit" id="loginSubmitBtn">
              <span class="login-submit__text">Sign In</span>
              <span class="login-submit__spinner" style="display:none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Signing in…
              </span>
            </button>

          </form>

          <p class="login-card__footer">
            EELU Library Management &nbsp;·&nbsp; Admin Access Only
          </p>
        </div>
      </div>

    </div>`;

  // ── Password visibility toggle ─────────────────────────
  const toggleBtn = document.getElementById('togglePassword');
  const pwdInput  = document.getElementById('loginPassword');
  const eyeOpen   = toggleBtn?.querySelector('.eye-open');
  const eyeClosed = toggleBtn?.querySelector('.eye-closed');

  toggleBtn?.addEventListener('click', () => {
    const isText = pwdInput.type === 'text';
    pwdInput.type = isText ? 'password' : 'text';
    eyeOpen.style.display  = isText ? 'block' : 'none';
    eyeClosed.style.display = isText ? 'none'  : 'block';
  });

  // ── Form submit ────────────────────────────────────────
  const form       = document.getElementById('loginForm');
  const submitBtn  = document.getElementById('loginSubmitBtn');
  const submitText = submitBtn?.querySelector('.login-submit__text');
  const spinner    = submitBtn?.querySelector('.login-submit__spinner');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    document.getElementById('emailError').textContent    = '';
    document.getElementById('passwordError').textContent = '';

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Basic client-side validation
    if (!email) {
      document.getElementById('emailError').textContent = 'Email is required';
      return;
    }
    if (!password) {
      document.getElementById('passwordError').textContent = 'Password is required';
      return;
    }

    // Loading state
    submitBtn.disabled         = true;
    submitText.style.display   = 'none';
    spinner.style.display      = 'flex';

    try {
      const res = await api.post('/auth/login', { email, password });

      if (res && res.token) {
        // Check admin role
        if (res.user && res.user.role !== 'admin') {
          showToast('Access denied. Admin accounts only.');
          return;
        }
        localStorage.setItem('adminToken', res.token);
        localStorage.setItem('adminUser', JSON.stringify(res.user || {}));
        showToast('Login successful');
        document.dispatchEvent(new Event('auth:login'));
      } else {
        showToast(res?.message || 'Login failed');
        document.getElementById('passwordError').textContent = res?.message || 'Invalid credentials';
      }
    } catch (err) {
      const msg = err.message || 'Login error';
      showToast(msg);
      document.getElementById('passwordError').textContent = msg;
    } finally {
      submitBtn.disabled        = false;
      submitText.style.display  = 'flex';
      spinner.style.display     = 'none';
    }
  });
}
