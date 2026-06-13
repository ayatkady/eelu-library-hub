// ══════════════════════════════════════════════════════════════════
// accessibility-init.js — loads on every page
// ══════════════════════════════════════════════════════════════════

(function () {
  // ── Font Size ──────────────────────────────────────────────────
  var savedFontSize = parseInt(localStorage.getItem("fontSize") || "100");
  document.documentElement.style.fontSize = savedFontSize + "%";

  // ── High Contrast ──────────────────────────────────────────────
  if (localStorage.getItem("highContrast") === "true") {
    document.body.classList.add("high-contrast");
  }

  // ── Screen Reader live region ──────────────────────────────────
  if (localStorage.getItem("screenReader") === "true") {
    var lr = document.createElement("div");
    lr.id = "srLiveRegion";
    lr.setAttribute("aria-live", "polite");
    lr.setAttribute("aria-atomic", "true");
    lr.className = "visually-hidden";
    document.body.appendChild(lr);
  }
})();

// ── Mobile Sidebar Nav ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {

  var toggle = document.getElementById("navToggle");
  var menu   = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  // ── Create overlay and append to body ─────────────────────────
  var overlay = document.createElement("div");
  overlay.className = "nav-sidebar-overlay";
  document.body.appendChild(overlay);

  // ── Inject sidebar header (close btn + title) ─────────────────
  var sidebarHeader = document.createElement("div");
  sidebarHeader.className = "nav-sidebar-header";
  sidebarHeader.innerHTML =
    '<span class="nav-sidebar-title"><i class="bi bi-book me-2"></i>EELU Library</span>' +
    '<button class="nav-sidebar-close" id="navClose" aria-label="Close menu">' +
      '<i class="bi bi-x-lg"></i>' +
    '</button>';
  menu.insertBefore(sidebarHeader, menu.firstChild);

  // ── Inject mobile user block at bottom of sidebar ─────────────
  var uName = localStorage.getItem("userName") || "Student";
  var uFac  = localStorage.getItem("faculty")  || "IT";
  var uYear = localStorage.getItem("academicYear") || "Year 1";

  var mobileUser = document.createElement("div");
  mobileUser.className = "nav-mobile-user";
  mobileUser.innerHTML =
    '<div class="nav-mobile-user-info">' +
      '<div class="nav-mobile-avatar"><i class="bi bi-person-fill"></i></div>' +
      '<div>' +
        '<div class="nav-mobile-name">' + uName + '</div>' +
        '<div class="nav-mobile-meta">' + uFac + ' · ' + uYear + '</div>' +
      '</div>' +
    '</div>' +
    '<button class="nav-mobile-logout" id="mobileLogoutBtn">' +
      '<i class="bi bi-box-arrow-right"></i> Logout' +
    '</button>';
  menu.appendChild(mobileUser);

  document.getElementById("mobileLogoutBtn").addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // ── Open / Close helpers ───────────────────────────────────────
  function openSidebar() {
    menu.classList.add("nav-open");
    overlay.classList.add("overlay-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    menu.classList.remove("nav-open");
    overlay.classList.remove("overlay-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  // ── Toggle button ──────────────────────────────────────────────
  toggle.addEventListener("click", function () {
    if (menu.classList.contains("nav-open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // ── Close button inside sidebar ────────────────────────────────
  document.getElementById("navClose").addEventListener("click", closeSidebar);

  // ── Overlay click closes sidebar ───────────────────────────────
  overlay.addEventListener("click", closeSidebar);

  // ── Nav links — navigate directly (no delay tricks) ───────────
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      closeSidebar();
      // Let the browser follow the href naturally — no preventDefault
    });
  });

  // ── Escape key ─────────────────────────────────────────────────
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSidebar();
  });

  // ── Reset on desktop resize ────────────────────────────────────
  window.addEventListener("resize", function () {
    if (window.innerWidth > 991) closeSidebar();
  });
});
