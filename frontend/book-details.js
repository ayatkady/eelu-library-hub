// Check if user is logged in
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

// Header user data
const studentName = localStorage.getItem("userName") || "Student";
const faculty = localStorage.getItem("faculty") || "IT";
const academicYear = localStorage.getItem("academicYear") || "Year 1";

document.querySelector(".user-name").textContent = studentName;
document.querySelector(".user-meta").textContent =
`${faculty} - ${academicYear}`;


// Logout
const logoutBtn = document.querySelector(".btn-logout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "login.html";
  });
}


// Buttons
document.querySelector(".book-detail-main-btn")
?.addEventListener("click", function () {
  alert("Book borrowed successfully!");
});

document.querySelector(".book-detail-secondary-btn")
?.addEventListener("click", function () {
  alert("Book reserved successfully!");
});

document.querySelector(".book-detail-download-btn")
?.addEventListener("click", function () {
  alert("PDF download started!");
});


// Back button
document.querySelector(".book-detail-back-link")
?.addEventListener("click", function (e) {
  e.preventDefault();
  window.location.href = "search.html";
});


// ================= BOOK DATA =================

const books = {

1:{
title:"Data Structures and Algorithms in Java",
author:"Robert Lafore",
category:"Computer Science",
faculty:"IT",
year:"Year 2",
description:"Learn data structures and algorithms using Java.",
availability:"12 of 20 copies available",
image:"https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=800"
},

2:{
title:"Web Development with HTML, CSS, and JavaScript",
author:"Jon Duckett",
category:"Web Development",
faculty:"IT",
year:"Year 2",
description:"Learn HTML CSS and JavaScript development.",
availability:"10 of 18 copies available",
image:"https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800"
},

3:{
title:"Artificial Intelligence: A Modern Approach",
author:"Stuart Russell & Peter Norvig",
category:"Computer Science",
faculty:"IT",
year:"Year 3",
description:"Modern concepts of Artificial Intelligence.",
availability:"7 of 15 copies available",
image:"https://images.pexels.com/photos/1181273/pexels-photo-1181273.jpeg?auto=compress&cs=tinysrgb&w=800"
},
4:{
title:"Software Engineering: A Practitioner's Approach",
author:"Roger Pressman",
category:"Software Engineering",
faculty:"IT",
year:"Year 3",
description:"Software engineering principles, design models, testing and maintenance.",
availability:"6 of 14 copies available",
image:"https://images.pexels.com/photos/3861972/pexels-photo-3861972.jpeg?auto=compress&cs=tinysrgb&w=800"
},

5:{
title:"Cloud Computing Concepts & Architecture",
author:"Thomas Erl",
category:"Cloud Computing",
faculty:"IT",
year:"Year 4",
description:"Concepts of cloud computing architecture and distributed services.",
availability:"6 of 10 copies available",
image:"https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800"
},

6:{
title:"Cybersecurity Essentials",
author:"Charles J. Brooks",
category:"Cybersecurity",
faculty:"IT",
year:"Year 4",
description:"Cybersecurity concepts, threats, risk management and protection.",
availability:"5 of 12 copies available",
image:"https://images.pexels.com/photos/5380651/pexels-photo-5380651.jpeg?auto=compress&cs=tinysrgb&w=800"
},

7:{
title:"Principles of Marketing",
author:"Philip Kotler & Gary Armstrong",
category:"Marketing",
faculty:"BA",
year:"Year 1",
description:"Marketing fundamentals, strategy, branding and customer behavior.",
availability:"15 of 25 copies available",
image:"https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&w=800"
},

8:{
title:"Introduction to Business",
author:"Jeff Madura",
category:"Business Administration",
faculty:"BA",
year:"Year 1",
description:"Introduction to business concepts, management and entrepreneurship.",
availability:"11 of 20 copies available",

image:"https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800"
},

9:{
title:"Financial Accounting",
author:"Jerry J. Weygandt",
category:"Accounting",
faculty:"BA",
year:"Year 2",
description:"Accounting principles, financial statements and reporting.",
availability:"13 of 22 copies available",
image:"https://images.pexels.com/photos/164686/pexels-photo-164686.jpeg?auto=compress&cs=tinysrgb&w=800"
}
};


// ================= GET URL ID =================

const params = new URLSearchParams(window.location.search);

const id = params.get("id");

const book = books[id];


// ================= UPDATE PAGE =================

if(book){

document.querySelector(".book-detail-title").textContent =
book.title;

document.querySelector(".book-detail-author").textContent =
"by " + book.author;

document.querySelector(".book-detail-badge").textContent =
book.category;

document.querySelector(".badge-faculty").textContent =
book.faculty;

document.querySelector(".badge-year").textContent =
book.year;

document.querySelector(".availability-count").textContent =
book.availability;

document.querySelector(".book-detail-description p").textContent =
book.description;

document.querySelector(".book-detail-cover img").src =
book.image;

}