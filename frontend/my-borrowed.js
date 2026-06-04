console.log("MY BORROWED JS LOADED");
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

// Browse books button
const browseBtn = document.querySelector(".borrowed-browse-btn");
if (browseBtn) {
  browseBtn.addEventListener("click", function(e) {
    e.preventDefault();
    window.location.href = "search.html";
  });
}
  

async function borrowBook(event, button) {
  event.stopPropagation();

  const bookId = button.dataset.id;
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login again");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/borrowed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        bookId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert("Book borrowed successfully!");
  } catch (error) {
    console.log(error);
    alert("Server error");
  }
}

async function loadBorrowedBooks() {

const token = localStorage.getItem("token");

try {

const response = await fetch(
"http://localhost:3000/api/borrowed",
{
method:"GET",
headers:{
Authorization:`Bearer ${token}`
}
}
);

const result = await response.json();

document.querySelector(".totalBorrowedCount").textContent =
result.totalBorrowed;

document.querySelector(".currentlyBorrowedTitle").textContent =
`Currently Borrowed (${result.totalBorrowed})`;

const container =
document.getElementById("borrowedContainer");

const emptyCard =
document.getElementById("borrowedEmpty");

container.innerHTML = "";

if(result.data.length === 0){

emptyCard.style.display = "block";

return;

}

emptyCard.style.display = "none";

result.data.forEach(book => {

const borrowDate =
new Date(book.borrowDate).toLocaleDateString();

const dueDate =
new Date(
new Date(book.borrowDate).getTime() +
14 * 24 * 60 * 60 * 1000
).toLocaleDateString();

container.innerHTML += `

<div class="col-lg-6">

  <div class="card h-100 border rounded-4 shadow-sm">

    <div class="card-body">

      <div class="d-flex">

        <img
          src="${book.bookId?.coverImage || 'https://placehold.co/95x130'}"
          alt="${book.bookId?.title}"
          class="rounded"
          width="95"
          height="130"
        >

        <div class="ms-3 flex-grow-1">

          <div class="d-flex justify-content-between">

            <h4 class="fw-semibold">
              ${book.bookId?.title || "Unknown Book"}
            </h4>

            <span class="badge bg-success align-self-start">
              ${book.status}
            </span>

          </div>

          <p class="text-secondary mb-2">
            by ${book.bookId?.author || "Unknown Author"}
          </p>

          <span class="badge text-dark border">
            ${book.bookId?.category || "Book"}
          </span>

          <div class="mt-4">

            <p class="mb-2">
              <i class="bi bi-calendar-event me-2"></i>
              Borrowed: ${borrowDate}
            </p>

            <p class="mb-0">
              <i class="bi bi-clock me-2"></i>
              Due: ${dueDate}
            </p>

          </div>

        </div>

      </div>

      <div class="row mt-4 g-2">

        <div class="col-6">
          <button
            class="btn btn-outline-danger w-100"
            onclick="returnBook('${book._id}')"
          >
            <i class="bi bi-arrow-return-left me-2"></i>
            Return Book
          </button>
        </div>

        <div class="col-6">
          <button
            class="btn btn-outline-secondary w-100"
          >
            View Details
          </button>
        </div>

      </div>

    </div>

  </div>

</div>

`;

});

}

catch(error){

console.log(error);

}

}

loadBorrowedBooks();