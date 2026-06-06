// ── Auth guard ────────────────────────────────────────────────────
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// ── Header user info ──────────────────────────────────────────────
const nameEl = document.querySelector(".user-name");
const metaEl = document.querySelector(".user-meta");
if (nameEl) nameEl.textContent = localStorage.getItem("userName") || "Student";
if (metaEl) metaEl.textContent =
  `${localStorage.getItem("faculty") || "IT"} - ${localStorage.getItem("academicYear") || "Year 1"}`;

// ── Logout ────────────────────────────────────────────────────────
document.querySelector(".btn-logout")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ══════════════════════════════════════════════════════════════════
// FONT SIZE
// ══════════════════════════════════════════════════════════════════
const FONT_MIN     = 80;
const FONT_MAX     = 150;
const FONT_STEP    = 10;
const FONT_DEFAULT = 100;

let currentFontSize = parseInt(localStorage.getItem("fontSize") || FONT_DEFAULT);

function applyFontSize(size) {
  currentFontSize = Math.min(FONT_MAX, Math.max(FONT_MIN, size));
  document.documentElement.style.fontSize = currentFontSize + "%";
  localStorage.setItem("fontSize", currentFontSize);
  updateFontUI();
}

function updateFontUI() {
  // Current size label inside the card
  const cardLabel = document.querySelector(".access-text-current strong");
  if (cardLabel) cardLabel.textContent = currentFontSize + "%";

  // Current settings card
  const settingFontEl = document.getElementById("settingFontSize");
  if (settingFontEl) settingFontEl.textContent = currentFontSize + "%";

  // Disable/enable buttons at limits
  const decBtn = document.getElementById("fontDecBtn");
  const incBtn = document.getElementById("fontIncBtn");
  if (decBtn) decBtn.disabled = currentFontSize <= FONT_MIN;
  if (incBtn) incBtn.disabled = currentFontSize >= FONT_MAX;
}

document.getElementById("fontDecBtn")?.addEventListener("click", () => applyFontSize(currentFontSize - FONT_STEP));
document.getElementById("fontIncBtn")?.addEventListener("click", () => applyFontSize(currentFontSize + FONT_STEP));
document.getElementById("fontResetBtn")?.addEventListener("click", () => applyFontSize(FONT_DEFAULT));

// ══════════════════════════════════════════════════════════════════
// HIGH CONTRAST
// ══════════════════════════════════════════════════════════════════
let highContrast = localStorage.getItem("highContrast") === "true";

function applyHighContrast(val) {
  highContrast = val;
  document.body.classList.toggle("high-contrast", val);
  localStorage.setItem("highContrast", val);
  updateContrastUI();
}

function updateContrastUI() {
  const toggle = document.getElementById("contrastToggle");
  if (toggle) toggle.classList.toggle("toggle-switch--on", highContrast);

  const settingEl = document.getElementById("settingContrast");
  if (settingEl) {
    settingEl.textContent = highContrast ? "ON" : "OFF";
    settingEl.className   = highContrast
      ? "access-current-item-value access-current-item-value--on"
      : "access-current-item-value access-current-item-value--off";
  }
}

document.getElementById("contrastToggle")?.addEventListener("click", () => applyHighContrast(!highContrast));

// ══════════════════════════════════════════════════════════════════
// SCREEN READER
// ══════════════════════════════════════════════════════════════════
let screenReader = localStorage.getItem("screenReader") === "true";

function applyScreenReader(val) {
  screenReader = val;
  localStorage.setItem("screenReader", val);

  // Add/remove extra ARIA live region
  let liveRegion = document.getElementById("srLiveRegion");
  if (val && !liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id            = "srLiveRegion";
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className     = "visually-hidden";
    document.body.appendChild(liveRegion);
  }
  if (!val && liveRegion) liveRegion.remove();

  // Announce if turning on
  if (val && liveRegion) {
    liveRegion.textContent = "Screen Reader Mode enabled. Enhanced ARIA labels are now active.";
  }

  updateScreenReaderUI();
}

function updateScreenReaderUI() {
  const toggle = document.getElementById("screenReaderToggle");
  if (toggle) toggle.classList.toggle("toggle-switch--on", screenReader);

  const settingEl = document.getElementById("settingScreenReader");
  if (settingEl) {
    settingEl.textContent = screenReader ? "ON" : "OFF";
    settingEl.className   = screenReader
      ? "access-current-item-value access-current-item-value--on"
      : "access-current-item-value access-current-item-value--off";
  }
}

document.getElementById("screenReaderToggle")?.addEventListener("click", () => applyScreenReader(!screenReader));

// ══════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUT HINTS  (Shift+C = contrast, Shift+R = reader)
// ══════════════════════════════════════════════════════════════════
document.addEventListener("keydown", (e) => {
  if (e.shiftKey && e.key === "C") applyHighContrast(!highContrast);
  if (e.shiftKey && e.key === "R") applyScreenReader(!screenReader);
  if (e.shiftKey && e.key === "+") applyFontSize(currentFontSize + FONT_STEP);
  if (e.shiftKey && e.key === "-") applyFontSize(currentFontSize - FONT_STEP);
});

// ══════════════════════════════════════════════════════════════════
// RESET ALL
// ══════════════════════════════════════════════════════════════════
document.getElementById("resetAllBtn")?.addEventListener("click", () => {
  applyFontSize(FONT_DEFAULT);
  applyHighContrast(false);
  applyScreenReader(false);
  showToast("All accessibility settings have been reset.", "success");
});

// ══════════════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════════════
function showToast(msg, type = "success") {
  let t = document.getElementById("accessToast");
  if (!t) {
    t = document.createElement("div");
    t.id        = "accessToast";
    t.className = "position-fixed bottom-0 end-0 p-3";
    t.style.zIndex = "9999";
    document.body.appendChild(t);
  }
  t.innerHTML = `
    <div class="toast show text-bg-${type} border-0" role="alert" aria-live="assertive">
      <div class="d-flex">
        <div class="toast-body">${msg}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto"
          onclick="this.closest('.toast').remove()"></button>
      </div>
    </div>`;
  setTimeout(() => { if (t) t.innerHTML = ""; }, 3500);
}

// ══════════════════════════════════════════════════════════════════
// INIT — apply saved preferences
// ══════════════════════════════════════════════════════════════════
applyFontSize(currentFontSize);
applyHighContrast(highContrast);
applyScreenReader(screenReader);
