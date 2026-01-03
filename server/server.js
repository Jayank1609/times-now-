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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
if (!process.env.PORT || !process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
}

const PORT = process.env.PORT || "5000";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/deepfakeDB";
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const http = axios.create({ baseURL: ML_SERVICE_URL, timeout: 30000 });

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

// Enhanced Analysis Schema with comprehensive data
const analysisSchema = new mongoose.Schema({
  type: { type: String, enum: ["text", "media", "comprehensive"], required: true },
  inputPreview: { type: String },
  url: { type: String },
  result: { type: String },
  confidence: { type: Number },
  // Comprehensive analysis fields
  authenticity: { type: Object },
  language: { type: Object },
  country: { type: Object },
  industry: { type: Object },
  sentiment: { type: Object },
  credibility: { type: Object },
  metrics: { type: Object },
  risk_indicators: { type: Array, default: [] },
  // User flags tracking
  userFlags: {
    green: { type: Number, default: 0 },
    red: { type: Number, default: 0 },
    platforms: { type: Map, of: { green: Number, red: Number }, default: {} }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Analysis = mongoose.model("Analysis", analysisSchema);

// News Article Schema for tracking
const newsArticleSchema = new mongoose.Schema({
  url: { type: String, unique: true, sparse: true },
  title: { type: String, required: true },
  text: { type: String },
  source: { type: String },
  analysis: { type: mongoose.Schema.Types.ObjectId, ref: "Analysis" },
  userFlags: {
    green: { type: Number, default: 0 },
    red: { type: Number, default: 0 },
    platforms: { type: Map, of: { green: Number, red: Number }, default: {} }
  },
  createdAt: { type: Date, default: Date.now }
});

const NewsArticle = mongoose.model("NewsArticle", newsArticleSchema);

// Feedback model
const feedbackSchema = new mongoose.Schema({
  message: { type: String, required: true },
  contact: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

let useMemoryStore = false;
const memoryHistory = [];
const memoryNews = [];
const memoryFlags = {};

async function initDb() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    useMemoryStore = true;
    console.log("⚠️ MongoDB not available, using in-memory store.");
  }
}

function saveAnalysis(data) {
  if (useMemoryStore) {
    const item = { 
      _id: `${Date.now()}_${Math.random()}`, 
      ...data, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryHistory.unshift(item);
    if (memoryHistory.length > 500) memoryHistory.pop();
    return Promise.resolve(item);
  }
  return Analysis.create(data);
}

function getRecentHistory(limit = 50) {
  if (useMemoryStore) {
    return Promise.resolve(memoryHistory.slice(0, limit));
  }
  return Analysis.find({}).sort({ createdAt: -1 }).limit(limit).exec();
}

function findOrCreateNews(url, title, text) {
  if (useMemoryStore) {
    let news = memoryNews.find(n => n.url === url);
    if (!news) {
      news = {
        _id: `${Date.now()}_${Math.random()}`,
        url,
        title,
        text,
        userFlags: { green: 0, red: 0, platforms: {} },
        createdAt: new Date()
      };
      memoryNews.unshift(news);
      if (memoryNews.length > 200) memoryNews.pop();
    }
    return Promise.resolve(news);
  }
  return NewsArticle.findOneAndUpdate(
    { url },
    { url, title, text, $setOnInsert: { createdAt: new Date() } },
    { upsert: true, new: true }
  );
}

initDb();

app.get("/", (req, res) => res.send("Deepfake Detector API - Professional News Analysis Platform"));

// Comprehensive News Analysis
app.post("/api/analyze/comprehensive", async (req, res) => {
  try {
    const { text, url, title } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await http.post("/analyze/comprehensive", { text, url });
    const analysisData = response.data;

    const savedAnalysis = await saveAnalysis({
      type: "comprehensive",
      inputPreview: (text || "").slice(0, 200),
      url: url || "",
      result: analysisData.authenticity?.result || "UNKNOWN",
      confidence: analysisData.authenticity?.confidence || 0,
      authenticity: analysisData.authenticity,
      language: analysisData.language,
      country: analysisData.country,
      industry: analysisData.industry,
      sentiment: analysisData.sentiment,
      credibility: analysisData.credibility,
      metrics: analysisData.metrics,
      risk_indicators: analysisData.risk_indicators || [],
      userFlags: { green: 0, red: 0, platforms: {} }
    });

    // If URL provided, link to news article
    if (url) {
      const news = await findOrCreateNews(url, title || text.slice(0, 100), text);
      news.analysis = savedAnalysis._id;
      if (!useMemoryStore) {
        await news.save();
      }
    }

    res.json({
      ...analysisData,
      id: savedAnalysis._id,
      userFlags: savedAnalysis.userFlags
    });
  } catch (err) {
    console.error("Comprehensive analysis error:", err);
    res.status(500).json({ error: "Error performing comprehensive analysis", details: err.message });
  }
});

// Simple Text Analysis (backward compatible)
app.post("/api/analyze/text", async (req, res) => {
  try {
    const { text, url } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await http.post("/predict/fake-news", { text });
    const { result, confidence, fake_probability } = response.data;

    const savedAnalysis = await saveAnalysis({
      type: "text",
      inputPreview: (text || "").slice(0, 120),
      url: url || "",
      result,
      confidence,
      userFlags: { green: 0, red: 0, platforms: {} }
    });

    res.json({ ...response.data, id: savedAnalysis._id });
  } catch (err) {
    console.error("Text analysis error:", err);
    res.status(500).json({ error: "Error analyzing text", details: err.message });
  }
});

// Media Analysis
const upload = multer({ dest: "uploads/", limits: { fileSize: 10 * 1024 * 1024 } });
app.post("/api/analyze/media", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const form = new FormData();
    form.append("file", fs.createReadStream(filePath), req.file.originalname);

    const response = await http.post("/predict/deepfake", form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    const { result, confidence } = response.data;
    const savedAnalysis = await saveAnalysis({
      type: "media",
      inputPreview: req.file.originalname,
      result,
      confidence,
      userFlags: { green: 0, red: 0, platforms: {} }
    });

    res.json({ ...response.data, id: savedAnalysis._id });
  } catch (err) {
    console.error("Media analysis error:", err);
    res.status(500).json({ error: "Error analyzing media", details: err.message });
  } finally {
    try {
      if (req?.file?.path) fs.unlinkSync(req.file.path);
    } catch (_) {}
  }
});

// User Flag Submission (Green/Red flags from different platforms)
app.post("/api/flags/:analysisId", async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { flag, platform = "web" } = req.body; // flag: "green" or "red"

    if (!["green", "red"].includes(flag)) {
      return res.status(400).json({ error: "Flag must be 'green' or 'red'" });
    }

    if (useMemoryStore) {
      const analysis = memoryHistory.find(a => a._id === analysisId);
      if (analysis) {
        analysis.userFlags[flag] = (analysis.userFlags[flag] || 0) + 1;
        if (!analysis.userFlags.platforms[platform]) {
          analysis.userFlags.platforms[platform] = { green: 0, red: 0 };
        }
        analysis.userFlags.platforms[platform][flag] = 
          (analysis.userFlags.platforms[platform][flag] || 0) + 1;
        analysis.updatedAt = new Date();
        return res.json({ success: true, flags: analysis.userFlags });
      }
      return res.status(404).json({ error: "Analysis not found" });
    }

    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }

    analysis.userFlags[flag] = (analysis.userFlags[flag] || 0) + 1;
    if (!analysis.userFlags.platforms) {
      analysis.userFlags.platforms = new Map();
    }
    const platformFlags = analysis.userFlags.platforms.get(platform) || { green: 0, red: 0 };
    platformFlags[flag] = (platformFlags[flag] || 0) + 1;
    analysis.userFlags.platforms.set(platform, platformFlags);
    analysis.updatedAt = new Date();
    await analysis.save();

    res.json({ success: true, flags: analysis.userFlags });
  } catch (err) {
    console.error("Flag submission error:", err);
    res.status(500).json({ error: "Error submitting flag", details: err.message });
  }
});

// Get Analysis by ID
app.get("/api/analysis/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useMemoryStore) {
      const analysis = memoryHistory.find(a => a._id === id);
      if (analysis) {
        return res.json(analysis);
      }
      return res.status(404).json({ error: "Analysis not found" });
    }

    const analysis = await Analysis.findById(id);
    if (!analysis) {
      return res.status(404).json({ error: "Analysis not found" });
    }
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: "Error fetching analysis" });
  }
});

// Recent history
app.get("/api/history", async (req, res) => {
  try {
    const items = await getRecentHistory(50);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Error fetching history" });
  }
});

// Feedback endpoint
app.post("/api/feedback", async (req, res) => {
  try {
    const { message, contact } = req.body || {};
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message required" });
    }
    
    const saved = useMemoryStore
      ? (() => {
          const item = { 
            _id: `${Date.now()}`, 
            message, 
            contact, 
            createdAt: new Date() 
          };
          return item;
        })()
      : await Feedback.create({ message, contact });
    
    res.json({ ok: true, id: saved._id });
  } catch (e) {
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// Enhanced Trending News with analysis
app.get("/api/news/trending", async (req, res) => {
  try {
    const items = [
      { 
        id: "1", 
        title: "Crypto exchange faces alleged fraud investigation", 
        source: "Global Finance", 
        category: "Finance",
        url: "https://example.com/news/1"
      },
      { 
        id: "2", 
        title: "Celebrity deepfake ad circulates on social media", 
        source: "Media Watch", 
        category: "Media",
        url: "https://example.com/news/2"
      },
      { 
        id: "3", 
        title: "Election misinformation spikes ahead of polls", 
        source: "Civic Monitor", 
        category: "Politics",
        url: "https://example.com/news/3"
      },
      {
        id: "4",
        title: "New AI breakthrough in medical diagnosis announced",
        source: "Tech News",
        category: "Technology",
        url: "https://example.com/news/4"
      },
      {
        id: "5",
        title: "Major sports league announces new regulations",
        source: "Sports Daily",
        category: "Sports",
        url: "https://example.com/news/5"
      }
    ];
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Error fetching trending news" });
  }
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const { data } = await http.get("/health");
    res.json({ 
      api: "ok", 
      ml: data,
      database: useMemoryStore ? "in-memory" : "connected",
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(200).json({ 
      api: "ok", 
      ml: { status: "unreachable", error: e.message },
      database: useMemoryStore ? "in-memory" : "unknown",
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Professional News Analysis Server running on port ${PORT}`);
  console.log(`📊 ML Service: ${ML_SERVICE_URL}`);
  console.log(`💾 Database: ${useMemoryStore ? "In-Memory" : MONGO_URI}`);
});
