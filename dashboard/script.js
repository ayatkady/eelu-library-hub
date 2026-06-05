/* University Library Management Dashboard */

const DATA = {
  recentLoans: [
    { member: "Ahmed Hassan", seed: "Ahmed", book: "Introduction to Algorithms", borrowed: "Jun 1, 2026", due: "Jun 15, 2026", status: "active" },
    { member: "Emily Chen", seed: "Emily", book: "Clean Architecture", borrowed: "May 28, 2026", due: "Jun 4, 2026", status: "due" },
    { member: "James Wilson", seed: "James", book: "The Great Gatsby", borrowed: "May 20, 2026", due: "May 27, 2026", status: "overdue" },
    { member: "Fatima Al-Rashid", seed: "Fatima", book: "Database System Concepts", borrowed: "Jun 2, 2026", due: "Jun 16, 2026", status: "active" },
    { member: "Maria Garcia", seed: "Maria", book: "Design Patterns", borrowed: "May 30, 2026", due: "Jun 13, 2026", status: "active" },
  ],
  books: [
    { title: "Introduction to Algorithms", author: "Cormen et al.", isbn: "978-0262046305", category: "Science & Tech", copies: 12, status: "available" },
    { title: "Clean Architecture", author: "Robert C. Martin", isbn: "978-0134494166", category: "Science & Tech", copies: 8, status: "borrowed" },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", category: "Humanities", copies: 15, status: "borrowed" },
    { title: "Principles of Economics", author: "Gregory Mankiw", isbn: "978-0357133804", category: "Business", copies: 10, status: "available" },
    { title: "Art History Vol. 1", author: "Marilyn Stokstad", isbn: "978-0134479279", category: "Arts", copies: 6, status: "available" },
    { title: "Oxford English Dictionary", author: "Oxford University Press", isbn: "978-0198611868", category: "Reference", copies: 3, status: "borrowed" },
  ],
  members: [
    { name: "Ahmed Hassan", role: "Graduate Student", seed: "Ahmed", id: "STU-2024-1842", loans: 3 },
    { name: "Dr. Emily Chen", role: "Faculty", seed: "Emily", id: "FAC-2019-056", loans: 1 },
    { name: "James Wilson", role: "Undergraduate", seed: "James", id: "STU-2025-3291", loans: 5 },
    { name: "Fatima Al-Rashid", role: "Graduate Student", seed: "Fatima", id: "STU-2023-0912", loans: 2 },
    { name: "Maria Garcia", role: "Staff", seed: "Maria", id: "STF-2018-044", loans: 0 },
    { name: "Oliver Thompson", role: "Undergraduate", seed: "Oliver", id: "STU-2025-4102", loans: 4 },
  ],
  popular: [
    { title: "Atomic Habits", author: "James Clear", loans: 47 },
    { title: "Deep Work", author: "Cal Newport", loans: 38 },
    { title: "Sapiens", author: "Yuval Noah Harari", loans: 35 },
    { title: "The Psychology of Money", author: "Morgan Housel", loans: 31 },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", loans: 28 },
  ],
  chartLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  chartData: {
    week: [42, 58, 51, 67, 72, 89, 95],
    month: [320, 410, 385, 452, 498, 520],
    year: [3200, 4100, 3850, 4520, 4980, 5200],
  },
};

let loanChart = null;
let currentChartPeriod = "month";

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getChartColors() {
  const dark = getTheme() === "dark";
  return {
    border: dark ? "#4a8bc4" : "#173c6b",
    fill: dark ? "rgba(74, 139, 196, 0.2)" : "rgba(23, 60, 107, 0.12)",
    grid: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    tick: dark ? "#94a3b8" : "#64748b",
  };
}

function setTheme(theme) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("library-theme", next);
  document.getElementById("themeToggle").setAttribute(
    "aria-label",
    next === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
  document.getElementById("themeToggle").setAttribute(
    "title",
    next === "dark" ? "Light mode" : "Dark mode"
  );
  if (loanChart) initChart(currentChartPeriod);
}

function setupTheme() {
  const saved = localStorage.getItem("library-theme");
  if (saved === "dark" || saved === "light") setTheme(saved);
  else setTheme("light");

  document.getElementById("themeToggle").addEventListener("click", () => {
    setTheme(getTheme() === "dark" ? "light" : "dark");
  });
}

function avatarUrl(seed) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function statusClass(status) {
  const map = {
    active: "status--active",
    due: "status--due",
    overdue: "status--overdue",
    returned: "status--returned",
    available: "status--available",
    borrowed: "status--borrowed",
  };
  return map[status] || "status--active";
}

function statusLabel(status) {
  const map = {
    active: "Active",
    due: "Due Today",
    overdue: "Overdue",
    returned: "Returned",
    available: "Available",
    borrowed: "Borrowed",
  };
  return map[status] || status;
}

function renderRecentLoans() {
  const tbody = document.getElementById("recentLoansTable");
  tbody.innerHTML = DATA.recentLoans
    .map(
      (row) => `
    <tr>
      <td>
        <div class="member-cell">
          <img src="${avatarUrl(row.seed)}" alt="" />
          <span>${row.member}</span>
        </div>
      </td>
      <td>${row.book}</td>
      <td>${row.borrowed}</td>
      <td>${row.due}</td>
      <td><span class="status ${statusClass(row.status)}">${statusLabel(row.status)}</span></td>
    </tr>`
    )
    .join("");
}

function renderAllLoans() {
  const tbody = document.getElementById("allLoansTable");
  tbody.innerHTML = DATA.recentLoans
    .map(
      (row, i) => `
    <tr>
      <td>#LN-${1000 + i}</td>
      <td>
        <div class="member-cell">
          <img src="${avatarUrl(row.seed)}" alt="" />
          <span>${row.member}</span>
        </div>
      </td>
      <td>${row.book}</td>
      <td>${row.borrowed}</td>
      <td>${row.due}</td>
      <td><span class="status ${statusClass(row.status)}">${statusLabel(row.status)}</span></td>
      <td>
        ${row.status === "overdue" || row.status === "due"
          ? '<button class="btn btn--primary" style="padding:6px 12px;font-size:0.75rem">Return</button>'
          : '<span style="color:var(--text-muted);font-size:0.8rem">—</span>'}
      </td>
    </tr>`
    )
    .join("");
}

function renderBooks(filter = "") {
  const tbody = document.getElementById("booksTable");
  const q = filter.toLowerCase();
  const filtered = DATA.books.filter(
    (b) =>
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.includes(q)
  );
  tbody.innerHTML = filtered
    .map(
      (b) => `
    <tr>
      <td><strong>${b.title}</strong></td>
      <td>${b.author}</td>
      <td>${b.isbn}</td>
      <td>${b.category}</td>
      <td>${b.copies}</td>
      <td><span class="status ${statusClass(b.status)}">${statusLabel(b.status)}</span></td>
      <td><button class="btn btn--ghost" style="padding:6px 10px;font-size:0.75rem">Edit</button></td>
    </tr>`
    )
    .join("");
}

function renderMembers() {
  const grid = document.getElementById("membersGrid");
  grid.innerHTML = DATA.members
    .map(
      (m) => `
    <article class="member-card">
      <img src="${avatarUrl(m.seed)}" alt="${m.name}" />
      <h3>${m.name}</h3>
      <p class="role">${m.role}</p>
      <p class="meta">ID: ${m.id}</p>
      <p class="loans-count">${m.loans} active loan${m.loans !== 1 ? "s" : ""}</p>
    </article>`
    )
    .join("");
}

function renderPopular() {
  const list = document.getElementById("popularBooks");
  list.innerHTML = DATA.popular
    .map(
      (b, i) => `
    <li>
      <span class="book-rank">${i + 1}</span>
      <div class="book-info">
        <strong>${b.title}</strong>
        <span>${b.author}</span>
      </div>
      <span class="book-loans">${b.loans} loans</span>
    </li>`
    )
    .join("");
}

function initChart(period = "month") {
  currentChartPeriod = period;
  const canvas = document.getElementById("loanChart");
  if (!canvas || typeof Chart === "undefined") return;

  const colors = getChartColors();
  const labels =
    period === "week"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : DATA.chartLabels;

  const values = DATA.chartData[period] || DATA.chartData.month;

  if (loanChart) loanChart.destroy();

  loanChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Loans",
          data: values,
          borderColor: colors.border,
          backgroundColor: colors.fill,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: colors.border,
          pointBorderColor: getTheme() === "dark" ? "#1a2d47" : "#fff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: colors.tick, font: { family: "Inter" } },
        },
        y: {
          beginAtZero: true,
          grid: { color: colors.grid },
          ticks: { color: colors.tick, font: { family: "Inter" } },
        },
      },
    },
  });
}

function navigateTo(pageId) {
  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === pageId);
  });
  document.querySelectorAll(".page").forEach((el) => {
    el.classList.toggle("active", el.id === `page-${pageId}`);
  });
  closeSidebar();
}

function openSidebar() {
  document.getElementById("sidebar").classList.add("open");
  document.getElementById("sidebarOverlay").classList.add("visible");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("visible");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function openModal() {
  document.getElementById("modal").classList.add("open");
  document.getElementById("modal").setAttribute("aria-hidden", "false");
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
  document.getElementById("modal").setAttribute("aria-hidden", "true");
  document.getElementById("addBookForm").reset();
}

function setupNavigation() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navigateTo(link.dataset.nav);
    });
  });
}

function setupSidebar() {
  document.getElementById("menuBtn").addEventListener("click", openSidebar);
  document.getElementById("sidebarOverlay").addEventListener("click", closeSidebar);
}

function setupModal() {
  document.getElementById("addBookBtn").addEventListener("click", openModal);
  document.getElementById("closeModal").addEventListener("click", closeModal);
  document.getElementById("cancelModal").addEventListener("click", closeModal);
  document.getElementById("modalBackdrop").addEventListener("click", closeModal);

  document.getElementById("addBookForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const book = {
      title: form.title.value,
      author: form.author.value,
      isbn: form.isbn.value,
      category: form.category.value,
      copies: 1,
      status: "available",
    };
    DATA.books.unshift(book);
    renderBooks();
    closeModal();
    showToast(`"${book.title}" added to catalog successfully.`);
  });
}

function setupFilters() {
  document.getElementById("periodFilter").addEventListener("change", (e) => {
    initChart(e.target.value);
  });

  document.getElementById("bookFilter").addEventListener("input", (e) => {
    renderBooks(e.target.value);
  });

  document.getElementById("globalSearch").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      navigateTo("books");
      document.getElementById("bookFilter").value = e.target.value;
      renderBooks(e.target.value);
    }
  });
}

function init() {
  setupTheme();
  renderRecentLoans();
  renderAllLoans();
  renderBooks();
  renderMembers();
  renderPopular();
  initChart("month");
  setupNavigation();
  setupSidebar();
  setupModal();
  setupFilters();
}

document.addEventListener("DOMContentLoaded", init);
