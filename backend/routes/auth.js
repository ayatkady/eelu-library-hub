

const express = require("express");
const fs = require("fs");
const path = require("path");


const router = express.Router();

const DB_FILE =
path.join(__dirname, "../db.json");

// helper functions
function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
 
// ====================================
router.get("/test", (req, res) => {
  res.send("AUTH ROUTE WORKS");
});


router.post("/register", (req, res) => {
  const db = readDB();

  const { fullName, email, password, faculty, academicYear } = req.body;

  const exists = db.users.find(u => u.email === email);
  if (exists) {
    return res.json({ success: false, message: "User already exists" });
  }

  const newUser = {
    id: Date.now(),
    fullName,
    email,
    password,
    faculty,
    academicYear
  };

  db.users.push(newUser);
  writeDB(db);

  res.json({ success: true, message: "User registered successfully" });
});


// ==============

router.post("/login", (req, res) => {
  const db = readDB();

  const { email, password } = req.body;

  const user = db.users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  res.json({
    success: true,
    message: "Login successful",
    user
  });
});

module.exports = router;