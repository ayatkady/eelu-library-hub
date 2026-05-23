const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await res.json();

    alert(data.message);

    if (data.success) {
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("isLoggedIn", "true");

      window.location.href = "combined.html";
    }

  } catch (err) {
    console.error(err);
    alert("Server Error");
  }
});