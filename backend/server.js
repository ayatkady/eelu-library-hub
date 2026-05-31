const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// connect DB
connectDB();

// routes
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const borrowedRoutes = require("./routes/borrowed");
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowed", borrowedRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API Running...");
});



const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});