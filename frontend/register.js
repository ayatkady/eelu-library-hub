const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("universityEmail").value.trim();
  const password = document.getElementById("password").value.trim();
  const faculty = document.getElementById("faculty").value;
  const academicYear = document.getElementById("academicYear").value;

  if (!fullName || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
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
    });

    const data = await res.json();

    alert(data.message);

    if (data.success) {
      window.location.href = "login.html";
    }

  } catch (err) {
    console.error(err);
    alert("Server Error");
  }
});