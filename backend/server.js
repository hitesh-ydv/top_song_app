const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// 🔗 Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// 🧩 Define schema
const configSchema = new mongoose.Schema({
  name: { type: String, default: "topSong" },
  topSongId: { type: String, default: null }
});

const Config = mongoose.model("Config", configSchema);

// ✅ GET top song
app.get("/api/top-song", async (req, res) => {
  try {
    const config = await Config.findOne({ name: "topSong" });
    if (!config || !config.topSongId) {
      return res.status(404).json({ message: "No top song set" });
    }
    res.json({ topSongId: config.topSongId });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ POST set top song
app.post("/api/top-song", async (req, res) => {
  const { topSongId } = req.body;
  if (!topSongId) {
    return res.status(400).json({ error: "topSongId is required" });
  }

  try {
    const updated = await Config.findOneAndUpdate(
      { name: "topSong" },
      { topSongId },
      { new: true, upsert: true }
    );
    res.json({ message: "Top song updated", topSongId: updated.topSongId });
  } catch (err) {
    res.status(500).json({ error: "Failed to update top song" });
  }
});

// ✅ DELETE top song
app.delete("/api/top-song", async (req, res) => {
  try {
    await Config.findOneAndUpdate({ name: "topSong" }, { topSongId: null });
    res.json({ message: "Top song has been removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete top song" });
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
