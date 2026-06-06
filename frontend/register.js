const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName     = document.getElementById("fullName").value.trim();
  const email        = document.getElementById("universityEmail").value.trim();
  const password     = document.getElementById("password").value;
  const faculty      = document.getElementById("faculty").value;
  const academicYear = document.getElementById("academicYear").value;

  // Validation
  if (!fullName || !email || !password || !faculty || !academicYear) {
    showError("Please fill in all fields.");
    return;
  }

  if (password.length < 8) {
    showError("Password must be at least 8 characters.");
    return;
  }

  clearError();

  const submitBtn = registerForm.querySelector("button[type='submit']");
  submitBtn.disabled = true;
  submitBtn.textContent = "Registering…";

  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password, faculty, academicYear }),
    });

    const data = await res.json();

    if (data.success) {
      showSuccess("Account created successfully! Redirecting to login…");
      setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } else {
      showError(data.message || "Registration failed. Please try again.");
    }

  } catch (err) {
    console.error(err);
    showError("Cannot connect to server. Please try again later.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Register";
  }
});

function showError(msg) {
  let el = document.getElementById("formAlert");
  if (!el) {
    el = document.createElement("div");
    el.id = "formAlert";
    registerForm.prepend(el);
  }
  el.className = "alert alert-danger py-2 mb-3";
  el.textContent = msg;
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showSuccess(msg) {
  let el = document.getElementById("formAlert");
  if (!el) {
    el = document.createElement("div");
    el.id = "formAlert";
    registerForm.prepend(el);
  }
  el.className = "alert alert-success py-2 mb-3";
  el.textContent = msg;
}

function clearError() {
  const el = document.getElementById("formAlert");
  if (el) el.remove();
}
