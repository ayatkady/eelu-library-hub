const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// routes
const authRoutes = require("./routes/auth.js");
app.use("/api/auth", authRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});