const API = "http://localhost:3000/api";

// ── Auth guard ────────────────────────────────────────────────────
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// ── Header user info ──────────────────────────────────────────────
const nameEl = document.querySelector(".user-name");
const metaEl = document.querySelector(".user-meta");
if (nameEl) nameEl.textContent = localStorage.getItem("userName") || "Student";
if (metaEl) metaEl.textContent = `${localStorage.getItem("faculty") || "IT"} - ${localStorage.getItem("academicYear") || "Year 1"}`;

// ── Logout ────────────────────────────────────────────────────────
document.querySelector(".btn-logout")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ── Contact form ──────────────────────────────────────────────────
const sendBtn = document.querySelector(".contact-send-btn");

if (sendBtn) {
  sendBtn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Collect values
    const inputs   = document.querySelectorAll(".contact-input");
    const vals     = [...inputs].map((i) => i.value.trim());
    const [name, email, , subject, message] = vals;

    // Validate
    if (vals.some((v) => v === "")) {
      showToast("Please fill in all required fields.", "danger");
      return;
    }

    sendBtn.disabled    = true;
    sendBtn.textContent = "Sending…";

    const token = localStorage.getItem("token");

    try {
      const res  = await fetch(`${API}/contact`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("✔ Message sent! We'll get back to you soon.", "success");
        document.querySelector("form")?.reset();
      } else {
        showToast(data.message || "Failed to send message. Please try again.", "danger");
      }

    } catch (err) {
      console.error(err);
      showToast("Server error. Please try again later.", "danger");
    } finally {
      sendBtn.disabled    = false;
      sendBtn.innerHTML   = `<i class="bi bi-send me-1"></i> Send Message`;
    }
  });
}

// ── Toast ─────────────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const toastEl   = document.getElementById("contactToast");
  const toastBody = toastEl?.querySelector(".toast-body");
  if (!toastEl || !toastBody) return;

  toastEl.classList.remove("text-bg-success", "text-bg-danger");
  toastEl.classList.add(`text-bg-${type}`);
  toastBody.innerHTML = msg;

  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}
