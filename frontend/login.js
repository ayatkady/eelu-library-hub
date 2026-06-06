const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  clearAlert();

  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showAlert("Please fill in all fields.", "danger");
    return;
  }

  const btn = loginForm.querySelector("button[type='submit']");
  btn.disabled    = true;
  btn.textContent = "Signing in…";

  try {
    const res  = await fetch("http://localhost:3000/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success && data.token) {
      const user = data.user || {};

      // Store auth data
      localStorage.setItem("token",        data.token);
      localStorage.setItem("currentUser",  JSON.stringify(user));
      localStorage.setItem("userName",     user.fullName  || user.email || "Student");
      localStorage.setItem("faculty",      user.faculty   || "IT");
      localStorage.setItem("academicYear", user.academicYear || "Year 1");
      localStorage.setItem("userRole",     user.role      || "student");

      // Redirect admin to dashboard, students to search
      if (user.role === "admin") {
        window.location.href = "http://localhost:3000/dashboard";
      } else {
        window.location.href = "search.html";
      }
    } else {
      showAlert(data.message || "Invalid credentials. Please try again.", "danger");
    }

  } catch (err) {
    console.error(err);
    showAlert("Cannot connect to server. Please check your connection.", "danger");
  } finally {
    btn.disabled    = false;
    btn.textContent = "Login";
  }
});

function showAlert(msg, type = "danger") {
  let el = document.getElementById("loginAlert");
  if (!el) {
    el    = document.createElement("div");
    el.id = "loginAlert";
    loginForm.prepend(el);
  }
  el.className  = `alert alert-${type} py-2 mb-3`;
  el.textContent = msg;
}

function clearAlert() {
  const el = document.getElementById("loginAlert");
  if (el) el.remove();
}
