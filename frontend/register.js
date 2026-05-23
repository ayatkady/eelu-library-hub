const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function(e) {

  e.preventDefault();

  const fullName =
  document.getElementById("fullName").value.trim();

  const email =
  document.getElementById("universityEmail").value.trim();

  const password =
  document.getElementById("password").value.trim();

  const faculty =
  document.getElementById("faculty").value;

  const academicYear =
  document.getElementById("academicYear").value;

  // Validation

  if (!fullName || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  if (!email.includes("@")) {
    alert("Please enter valid email");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  fetch(
    "http://localhost:3000/api/auth/register",

    {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        fullName,
        email,
        password,
        faculty,
        academicYear

      })

    }
  )

  .then(res => res.json())

  .then(data => {

    alert(data.message);

    if (data.success) {

      window.location.href =
      "login.html";

    }

  })

  .catch(error => {

    console.error(error);

    alert("Server Error");

  });

});