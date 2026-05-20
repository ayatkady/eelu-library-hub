const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  // Validation
  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  if (!email.includes("@")) {
    alert("Please enter a valid email");
    return;
  }

  const storedEmail = localStorage.getItem("userEmail");
  const storedPassword = localStorage.getItem("userPassword");

  if (storedEmail && storedPassword) {
    if (email === storedEmail && password === storedPassword) {
      localStorage.setItem("isLoggedIn", "true");
      alert("Login Successful!");
      window.location.href = "combined.html";
    } else {
      alert("Invalid Email or Password");
    }
  } else {
    // First login - demo mode
    localStorage.setItem("userName", email.split("@")[0]);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);
    localStorage.setItem("faculty", "Information Technology");
    localStorage.setItem("academicYear", "Year 1");
    localStorage.setItem("isLoggedIn", "true");
    alert("Demo Login Successful!");
    window.location.href = "combined.html";
  }
});