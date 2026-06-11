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

// ── Mobile Sidebar Nav ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  var MOBILE_BP = 991; // same breakpoint as CSS

  var toggle = document.getElementById("navToggle");
  var menu   = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  // ── Overlay ────────────────────────────────────────────────────
  var overlay = document.createElement("div");
  overlay.id        = "navOverlay";
  overlay.className = "nav-sidebar-overlay";
  document.body.appendChild(overlay);

  // ── Sidebar header (close button) ─────────────────────────────
  var sidebarHeader = document.createElement("div");
  sidebarHeader.id        = "navSidebarHeader";
  sidebarHeader.className = "nav-sidebar-header";
  sidebarHeader.innerHTML =
    '<span class="nav-sidebar-title"><i class="bi bi-book me-2"></i>EELU Library</span>' +
    '<button class="nav-sidebar-close" id="navClose" aria-label="Close menu">' +
      '<i class="bi bi-x-lg"></i>' +
    '</button>';
  menu.insertBefore(sidebarHeader, menu.firstChild);

  // ── Mobile user info block ─────────────────────────────────────
  var userName = localStorage.getItem("userName")     || "Student";
  var faculty  = localStorage.getItem("faculty")      || "IT";
  var year     = localStorage.getItem("academicYear") || "Year 1";

  var mobileUser = document.createElement("div");
  mobileUser.className = "nav-mobile-user";
  mobileUser.innerHTML =
    '<div class="nav-mobile-user-info">' +
      '<div class="nav-mobile-avatar"><i class="bi bi-person-fill"></i></div>' +
      '<div>' +
        '<div class="nav-mobile-name">' + userName + '</div>' +
        '<div class="nav-mobile-meta">' + faculty + ' · ' + year + '</div>' +
      '</div>' +
    '</div>' +
    '<button class="nav-mobile-logout" id="mobileLogoutBtn">' +
      '<i class="bi bi-box-arrow-right"></i> Logout' +
    '</button>';
  menu.appendChild(mobileUser);

  document.getElementById("mobileLogoutBtn")?.addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // ── Open / Close ───────────────────────────────────────────────
  function isMobile() {
    return window.innerWidth <= MOBILE_BP;
  }

  function openSidebar() {
    if (!isMobile()) return;
    menu.classList.add("nav-open");
    overlay.classList.add("overlay-open");
    toggle.classList.add("nav-hamburger--open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    menu.classList.remove("nav-open");
    overlay.classList.remove("overlay-open");
    toggle.classList.remove("nav-hamburger--open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  // Reset sidebar state when resizing to desktop
  window.addEventListener("resize", function () {
    if (!isMobile()) closeSidebar();
  });

  // ── Events ─────────────────────────────────────────────────────
  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    menu.classList.contains("nav-open") ? closeSidebar() : openSidebar();
  });

  document.getElementById("navClose")?.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (!isMobile()) return;
      var href = link.getAttribute("href");
      // Close first, then navigate after a tiny delay so the browser doesn't cancel
      e.preventDefault();
      closeSidebar();
      setTimeout(function () {
        window.location.href = href;
      }, 120);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isMobile()) closeSidebar();
  });
});
