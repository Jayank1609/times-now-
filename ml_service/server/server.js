import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve root .env reliably regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Try loading server-local .env first, then fallback to project root .env
dotenv.config();
if (!process.env.PORT || !process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
}

const PORT = process.env.PORT || "5000";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/deepfakeDB";
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const http = axios.create({ baseURL: ML_SERVICE_URL, timeout: 12000 });

const app = express();
app.use(express.json({ limit: "5mb" }));
app.use(cors());

// Models (no auth, userless history)
const analysisSchema = new mongoose.Schema({
  type: { type: String, enum: ["text", "media"], required: true },
  inputPreview: { type: String },
  result: { type: String },
  confidence: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const Analysis = mongoose.model("Analysis", analysisSchema);

// Feedback model
const feedbackSchema = new mongoose.Schema({
  message: { type: String, required: true },
  contact: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// In-memory fallback
let useMemoryStore = false;
const memoryHistory = [];

async function initDb() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    useMemoryStore = true;
    console.log("⚠️ MongoDB not available, using in-memory history store.");
  }
}

function saveAnalysis({ type, inputPreview, result, confidence }) {
  if (useMemoryStore) {
    const item = { _id: `${Date.now()}`, type, inputPreview, result, confidence, createdAt: new Date() };
    memoryHistory.unshift(item);
    if (memoryHistory.length > 200) memoryHistory.pop();
    return Promise.resolve(item);
  }
  return Analysis.create({ type, inputPreview, result, confidence });
}

function getRecentHistory(limit = 50) {
  if (useMemoryStore) {
    return Promise.resolve(memoryHistory.slice(0, limit));
  }
  return Analysis.find({}).sort({ createdAt: -1 }).limit(limit);
}

initDb();

app.get("/", (req, res) => res.send("Deepfake Detector API"));

// Public: Text Analysis
app.post("/api/analyze/text", async (req, res) => {
  try {
    const { text } = req.body;
    const response = await http.post(`/predict/fake-news`, { text });
    const { result, confidence } = response.data;
    await saveAnalysis({
      type: "text",
      inputPreview: (text || "").slice(0, 120),
      result,
      confidence
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Error analyzing text" });
  }
});

// Public: Media Analysis
const upload = multer({ dest: "uploads/" });
app.post("/api/analyze/media", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath), req.file.originalname);

    const response = await http.post(`/predict/deepfake`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity
    });

    const { result, confidence } = response.data;
    await saveAnalysis({
      type: "media",
      inputPreview: req.file.originalname,
      result,
      confidence
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Error analyzing media" });
  } finally {
    try { fs.unlinkSync(req?.file?.path); } catch (_) {}
  }
});

// Public: Recent history
app.get("/api/history", async (req, res) => {
  const items = await getRecentHistory(50);
  res.json(items);
});

// Feedback endpoint
app.post("/api/feedback", async (req, res) => {
  try {
    const { message, contact } = req.body || {};
    if (!message || !message.trim()) return res.status(400).json({ error: "Message required" });
    const saved = useMemoryStore
      ? (() => { const item = { _id: `${Date.now()}`, message, contact, createdAt: new Date() }; return (memoryHistory.unshift(item), item); })()
      : await Feedback.create({ message, contact });
    res.json({ ok: true, id: saved._id });
  } catch (e) {
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// Trending news (mocked server-side source; integrate real API later)
app.get("/api/news/trending", async (_req, res) => {
  const items = [
    { id: "1", title: "Crypto exchange faces alleged fraud investigation", source: "Global Finance", category: "Finance" },
    { id: "2", title: "Celebrity deepfake ad circulates on social media", source: "Media Watch", category: "Media" },
    { id: "3", title: "Election misinformation spikes ahead of polls", source: "Civic Monitor", category: "Politics" }
  ];
  res.json(items);
});

// Health proxy
app.get("/api/health", async (req, res) => {
  try {
    const { data } = await http.get(`/health`);
    res.json({ api: "ok", ml: data });
  } catch (e) {
    res.status(200).json({ api: "ok", ml: { status: "unreachable" } });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
