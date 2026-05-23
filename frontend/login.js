const loginForm =
document.getElementById("loginForm");

loginForm.addEventListener("submit", function(e) {

  e.preventDefault();

  const email =
  document.getElementById("loginEmail").value.trim();

  const password =
  document.getElementById("loginPassword").value.trim();

  if (!email || !password) {

    alert("Please fill all fields");

    return;

  }

  fetch(
    "http://localhost:3000/api/auth/login",

    {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        email,
        password

      })

    }
  )

  .then(res => res.json())

  .then(data => {

    alert(data.message);

    if (data.success) {

      localStorage.setItem(
        "currentUser",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      window.location.href =
      "combined.html";
    }

  })

  .catch(error => {

    console.error(error);

    alert("Server Error");

  });

});