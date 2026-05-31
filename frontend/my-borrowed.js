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
  console.log("LOAD FUNCTION STARTED");


const token =
localStorage.getItem("token");

try {

const response =
await fetch(
"http://localhost:3000/api/borrowed",
{
method:"GET",

headers:{
Authorization:
`Bearer ${token}`
}
}
);
console.log(response);

const result =
await response.json();

document.querySelector(
".totalBorrowedCount"
).textContent =
result.totalBorrowed;

const container =
document.getElementById(
"borrowedContainer"
);

const emptyCard =
document.getElementById(
"borrowedEmpty"
);

container.innerHTML = "";



if(result.data.length===0){

emptyCard.style.display="block";

return;

}

emptyCard.style.display="none";



result.data.forEach(book=>{

container.innerHTML += `

<article class="book-card">

<div class="book-card-body">

<div class="book-meta-row">

<span class="badge-faculty">
${book.bookId?.category || "Book"}
</span>

<span class="badge-year">
${book.borrowedDays} days
</span>

</div>

<div class="book-title">
${book.bookId?.title || "Unknown Book"}
</div>

<div class="book-author">
by ${book.bookId?.author || "Unknown Author"}
</div>

<ul class="book-info-list">

<li class="book-info-row">

<i class="bi bi-check-circle"></i>

<span>
Status:
${book.status}
</span>

</li>

<li class="book-info-row">

<i class="bi bi-calendar"></i>

<span>

Borrowed:

${new Date(
book.borrowDate
).toLocaleDateString()}

</span>

</li>

</ul>

<button
class="btn btn-danger mt-3 w-100"
onclick="returnBook(
'${book._id}'
)">

Return Book

</button>

</div>

</article>

`;

});

}

catch(error){

console.log(error);

}

}
loadBorrowedBooks();