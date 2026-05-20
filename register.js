const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("universityEmail").value.trim();
  const password = document.getElementById("password").value.trim();
  const faculty = document.getElementById("faculty").value;
  const academicYear = document.getElementById("academicYear").value;

  // Validation
  if (!fullName || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  if (!email.includes("@")) {
    alert("Please enter a valid university email");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  const existingEmail = localStorage.getItem("userEmail");

  if (existingEmail && email === existingEmail) {
    alert("Account already exists with this email!");
    return;
  }

  localStorage.setItem("userName", fullName);
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userPassword", password);
  localStorage.setItem("faculty", faculty);
  localStorage.setItem("academicYear", academicYear);

  alert("Registration Successful! Please login.");
  window.location.href = "login.html";
});