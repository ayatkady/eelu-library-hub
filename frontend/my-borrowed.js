// =========================
// LOGIN CHECK
// =========================

if (localStorage.getItem("isLoggedIn") !== "true") {

window.location.href="login.html";

}



// =========================
// USER DATA
// =========================

const studentName =
localStorage.getItem("userName")
|| "Student";

const faculty =
localStorage.getItem("faculty")
|| "IT";

const academicYear =
localStorage.getItem("academicYear")
|| "Year 1";


document.querySelector(".user-name")
.textContent =
studentName;


document.querySelector(".user-meta")
.textContent =
`${faculty} - ${academicYear}`;




// =========================
// LOGOUT
// =========================

const logoutBtn =
document.querySelector(".btn-logout");

if(logoutBtn){

logoutBtn.addEventListener("click",()=>{

localStorage.removeItem(
"isLoggedIn"
);

window.location.href=
"login.html";

});

}




// =========================
// LOAD BOOKS
// =========================

let books =
JSON.parse(
localStorage.getItem(
"borrowedBooks"
)
) || [];




// =========================
// DOM ELEMENTS
// =========================

const statsCards =
document.querySelectorAll(
".borrowed-stat-value"
);

const emptyCard =
document.querySelector(
".borrowed-empty-card"
);

const container =
document.querySelector(
".container-xl"
);




// =========================
// BOOKS CONTAINER
// =========================

const booksList =
document.createElement("div");

booksList.className =
"borrowed-books-list mt-4";

container.appendChild(
booksList
);




// =========================
// DUE SOON CHECK
// =========================

function isDueSoon(book){

if(
book.status==="Reserved"
||
book.dueDate==="Waiting"
){

return false;

}

const today =
new Date();

const dueDate =
new Date(book.dueDate);

const diffDays =
(dueDate - today) /
(1000*60*60*24);

return diffDays <=3
&& diffDays >=0;

}




// =========================
// UPDATE STATS
// =========================

function updateStats(){

const borrowedCount =
books.filter(
book=>
book.status==="Borrowed"
).length;


const reservedCount =
books.filter(
book=>
book.status==="Reserved"
).length;


const dueSoonCount =
books.filter(
isDueSoon
).length;



statsCards[0].textContent =
borrowedCount;

statsCards[1].textContent =
reservedCount;

statsCards[2].textContent =
dueSoonCount;

}




// =========================
// RENDER BOOKS
// =========================

function renderBooks(){

booksList.innerHTML="";



if(books.length===0){

emptyCard.style.display=
"block";

updateStats();

return;

}


emptyCard.style.display=
"none";



books.forEach(book=>{


const dueClass =
isDueSoon(book)
?
"border-warning"
:
"";



const card =
document.createElement("div");

card.className =
`card mb-4 shadow-sm p-3 ${dueClass}`;



card.innerHTML=`

<div class="row align-items-center">

<div class="col-md-2">

<img
src="${book.image}"
alt="${book.title}"
class="img-fluid rounded"
style="
height:160px;
object-fit:cover;
width:100%;
">

</div>


<div class="col-md-7">

<h4 class="mb-2">

${book.title}

</h4>


<p class="text-muted mb-2">

${book.author}

</p>


<p>

Status:

<strong>

${book.status}

</strong>

</p>


<p>

Due Date:

<strong>

${book.dueDate}

</strong>

</p>


${
isDueSoon(book)

?

`<div class="alert alert-warning p-2 mt-2">

Due soon!

</div>`

:

""

}


</div>


<div class="col-md-3 text-md-end">

<button
class="btn btn-danger return-btn"
data-id="${book.id}">

${
book.status==="Borrowed"

?

"Return Book"

:

"Cancel Reservation"

}

</button>

</div>

</div>

`;



booksList.appendChild(
card
);

});


attachEvents();

updateStats();

}




// =========================
// BUTTON EVENTS
// =========================

function attachEvents(){

const buttons =
document.querySelectorAll(
".return-btn"
);



buttons.forEach(btn=>{


btn.addEventListener("click",()=>{

const id =
btn.dataset.id;



books =
books.filter(
book=>
book.id != id
);



localStorage.setItem(

"borrowedBooks",

JSON.stringify(
books
)

);



renderBooks();

});

});

}




// =========================
// INITIAL RENDER
// =========================

renderBooks();