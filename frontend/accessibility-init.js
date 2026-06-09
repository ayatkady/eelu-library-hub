// ══════════════════════════════════════════════════════════════════
// accessibility-init.js
// يتحمل في كل الصفحات — يطبق إعدادات الـ Accessibility المحفوظة
// ══════════════════════════════════════════════════════════════════

(function () {
  // ── Font Size ────────────────────────────────────────────────────
  const savedFontSize = parseInt(localStorage.getItem("fontSize") || "100");
  document.documentElement.style.fontSize = savedFontSize + "%";

  // ── High Contrast ────────────────────────────────────────────────
  if (localStorage.getItem("highContrast") === "true") {
    document.body.classList.add("high-contrast");
  }

  // ── Screen Reader live region ────────────────────────────────────
  if (localStorage.getItem("screenReader") === "true") {
    const liveRegion = document.createElement("div");
    liveRegion.id = "srLiveRegion";
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "visually-hidden";
    document.body.appendChild(liveRegion);
  }
})();

// ── Mobile Nav (Hamburger + User block) ────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("navToggle");
  const menu   = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  // ── Inject mobile user block at the bottom of the nav dropdown ──
  const userName  = localStorage.getItem("userName")     || "Student";
  const faculty   = localStorage.getItem("faculty")      || "IT";
  const year      = localStorage.getItem("academicYear") || "Year 1";

  const mobileUser = document.createElement("div");
  mobileUser.className = "nav-mobile-user";
  mobileUser.innerHTML = `
    <div class="nav-mobile-user-info">
      <div class="nav-mobile-avatar"><i class="bi bi-person-fill"></i></div>
      <div>
        <div class="nav-mobile-name">${userName}</div>
        <div class="nav-mobile-meta">${faculty} · ${year}</div>
      </div>
    </div>
    <button class="nav-mobile-logout" id="mobileLogoutBtn">
      <i class="bi bi-box-arrow-right"></i> Logout
    </button>`;
  menu.appendChild(mobileUser);

  // Logout from mobile menu
  document.getElementById("mobileLogoutBtn")?.addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // ── Toggle open/close ──────────────────────────────────────────
  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    const isOpen = menu.classList.toggle("nav-open");
    toggle.classList.toggle("nav-hamburger--open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close when a nav link clicked
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("nav-open");
      toggle.classList.remove("nav-hamburger--open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close when clicking outside
  document.addEventListener("click", function (e) {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove("nav-open");
      toggle.classList.remove("nav-hamburger--open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
});
