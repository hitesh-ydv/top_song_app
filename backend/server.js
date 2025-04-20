const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// 🔗 MongoDB Setup
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// 📦 Mongo Schema
const configSchema = new mongoose.Schema({
  name: { type: String, default: "topSong" },
  topSongId: { type: String, default: null }
});
const Config = mongoose.model("Config", configSchema);

// 🌐 API
app.get("/api/top-song", async (req, res) => {
  const config = await Config.findOne({ name: "topSong" });
  if (!config || !config.topSongId) return res.status(404).json({ message: "No top song set" });
  res.json({ topSongId: config.topSongId });
});

app.post("/api/top-song", async (req, res) => {
  const { topSongId } = req.body;
  if (!topSongId) return res.status(400).json({ error: "topSongId is required" });

  const updated = await Config.findOneAndUpdate(
    { name: "topSong" },
    { topSongId },
    { new: true, upsert: true }
  );

  io.emit("topSongUpdated", updated.topSongId); // 💥 real-time push
  res.json({ message: "Top song updated", topSongId: updated.topSongId });
});

app.delete("/api/top-song", async (req, res) => {
  const updated = await Config.findOneAndUpdate({ name: "topSong" }, { topSongId: null });
  io.emit("topSongDeleted"); // 💥 emit delete event
  res.json({ message: "Top song removed" });
});

// 🔌 Socket.IO connection
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
