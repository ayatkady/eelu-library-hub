// Check if user is logged in
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

const searchInput = document.getElementById("searchInput");
const facultyFilter = document.getElementById("filterFaculty");
const yearFilter = document.getElementById("filterYear");
const categoryFilter = document.getElementById("filterCategory");
const cards = document.querySelectorAll(".book-card");
const resultsCount = document.getElementById("resultsCount");


function filterBooks() {
  const searchValue = searchInput.value.toLowerCase();
  const facultyValue = facultyFilter.value.toLowerCase();
  const yearValue = yearFilter.value.toLowerCase();
  const categoryValue = categoryFilter.value.toLowerCase();

  let visibleCount = 0;

  cards.forEach(function(card) {
    const title = card.dataset.title.toLowerCase();
    const author = card.dataset.author.toLowerCase();
    const category = card.dataset.category.toLowerCase();
    const faculty = card.dataset.faculty.toLowerCase();
    const year = card.dataset.year.toLowerCase();

    const matchesSearch = 
      title.includes(searchValue) || 
      author.includes(searchValue) || 
      category.includes(searchValue);

    const matchesFaculty = 
      facultyValue === "all faculties" || 
      faculty.includes(
        facultyValue.includes("business")
          ? "ba"
          : facultyValue.includes("information")
          ? "it"
          : facultyValue
      );

    const matchesYear = 
      yearValue === "all years" || 
      year === yearValue;

    const matchesCategory = 
      categoryValue === "all categories" || 
      category.includes(categoryValue);

    if (matchesSearch && matchesFaculty && matchesYear && matchesCategory) {
      card.style.display = "block";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  resultsCount.textContent = `Showing ${visibleCount} of ${cards.length} books`;
}

searchInput.addEventListener("input", filterBooks);
facultyFilter.addEventListener("change", filterBooks);
yearFilter.addEventListener("change", filterBooks);
categoryFilter.addEventListener("change", filterBooks);

const clearButton = document.querySelector(".btn-clear-filters");
if (clearButton) {
  clearButton.addEventListener("click", function() {
    searchInput.value = "";
    facultyFilter.selectedIndex = 0;
    yearFilter.selectedIndex = 0;
    categoryFilter.selectedIndex = 0;
    filterBooks();
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function() {
    localStorage.clear();
    window.location.href = "login.html";
  });
}


// function goToDetails(card) {
//   const title = encodeURIComponent(card.dataset.title);
//   const author = encodeURIComponent(card.dataset.author);
//   const category = encodeURIComponent(card.dataset.category);
//   const faculty = encodeURIComponent(card.dataset.faculty);
//   const year = encodeURIComponent(card.dataset.year);

//   window.location.href =
//     `book-details.html?title=${title}&author=${author}&category=${category}&faculty=${faculty}&year=${year}`;
// }


function goToDetails(card){

    const bookId = card.dataset.id;

    window.location.href =
    `book-details.html?id=${bookId}`;

}
  
async function borrowBook(event, button) {

  event.stopPropagation();

  const bookId = button.dataset.id;

  const token = localStorage.getItem("token"); // 👈 هنا

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
        "Authorization": `Bearer ${token}` // 👈 هنا أهم حاجة
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