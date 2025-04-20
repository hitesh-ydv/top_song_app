const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let topSongId = null;

// GET current top song
app.get("/api/top-song", (req, res) => {
  if (!topSongId) return res.status(404).json({ message: "No top song set" });
  res.json({ topSongId });
});

// POST set top song
app.post("/api/top-song", (req, res) => {
  const { topSongId: newId } = req.body;
  if (!newId) return res.status(400).json({ error: "topSongId is required" });

  topSongId = newId;
  res.json({ message: "Top song ID updated", topSongId });
});

// DELETE remove top song
app.delete("/api/top-song", (req, res) => {
  topSongId = null;
  res.json({ message: "Top song has been removed" });
});

app.listen(process.env.PORT, () => console.log("✅ Server running on http://localhost:3000"));
