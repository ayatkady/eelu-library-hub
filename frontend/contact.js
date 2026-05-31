// Check if user is logged in
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// Update user data in header
const studentName = localStorage.getItem("userName") || "Student";
const faculty = localStorage.getItem("faculty") || "IT";
const academicYear = localStorage.getItem("academicYear") || "Year 1";

document.querySelector(".user-name").textContent = studentName;
document.querySelector(".user-meta").textContent = `${faculty} - ${academicYear}`;

// Logout functionality
const logoutBtn = document.querySelector(".btn-logout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function() {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// Contact form submission
const sendBtn = document.querySelector(".contact-send-btn");
if (sendBtn) {
  sendBtn.addEventListener("click", function(e) {
    e.preventDefault();
    
    const nameInput = document.querySelector(".contact-form-label").parentElement.querySelector(".contact-input");
    const name = nameInput.value.trim();
    
    if (name) {
      alert("Thank you for your message! We will get back to you soon.");
      // Reset form
      document.querySelector("form").reset();
    } else {
      alert("Please fill in all required fields.");
    }
  });
}
