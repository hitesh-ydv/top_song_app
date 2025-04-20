const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const FILE_PATH = "./topSong.json";

// Load top song from file
function loadTopSongId() {
  try {
    const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
    return data.topSongId || null;
  } catch (err) {
    return null;
  }
}

// Save top song to file
function saveTopSongId(id) {
  fs.writeFileSync(FILE_PATH, JSON.stringify({ topSongId: id }));
}

// Use file-based value
let topSongId = loadTopSongId();

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
  saveTopSongId(topSongId);
  res.json({ message: "Top song ID updated", topSongId });
});

// DELETE remove top song
app.delete("/api/top-song", (req, res) => {
  topSongId = null;
  saveTopSongId(null);
  res.json({ message: "Top song has been removed" });
});

// Use environment PORT or 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
