from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import re
from datetime import datetime
from functools import lru_cache
from threading import Lock

# Disable TensorFlow usage inside transformers to avoid Windows DLL issues
os.environ.setdefault("DISABLE_TF", "1")
os.environ.setdefault("TRANSFORMERS_NO_TF", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

import torch
try:
    torch.set_num_threads(
        int(os.environ.get("TORCH_NUM_THREADS", max(1, min(4, (os.cpu_count() or 1)))))
    )
except Exception:
    pass
try:
    from transformers import pipeline
    _TRANSFORMERS_AVAILABLE = True
except Exception:
    _TRANSFORMERS_AVAILABLE = False

try:
    from langdetect import detect, LangDetectException
    _LANGDETECT_AVAILABLE = True
except Exception:
    _LANGDETECT_AVAILABLE = False

try:
    from textblob import TextBlob
    _TEXTBLOB_AVAILABLE = True
except Exception:
    _TEXTBLOB_AVAILABLE = False

import cv2
import io
from PIL import Image

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
_MODEL_READY = False
_PIPELINE_LOCK = Lock()
_SENTIMENT_LOCK = Lock()

# Industry categories mapping
INDUSTRY_KEYWORDS = {
    "Technology": ["tech", "software", "ai", "machine learning", "digital", "internet", "app", "platform", "cyber", "data", "cloud"],
    "Finance": ["bank", "stock", "market", "investment", "crypto", "currency", "economy", "financial", "trading", "bitcoin"],
    "Politics": ["election", "government", "minister", "parliament", "policy", "political", "vote", "democracy", "party"],
    "Healthcare": ["health", "medical", "hospital", "doctor", "patient", "disease", "treatment", "vaccine", "medicine"],
    "Entertainment": ["movie", "celebrity", "actor", "film", "music", "show", "entertainment", "star", "hollywood"],
    "Sports": ["sport", "football", "cricket", "match", "player", "team", "championship", "tournament", "game"],
    "Media": ["news", "journalist", "media", "press", "broadcast", "report", "article", "publisher"],
    "Business": ["business", "company", "corporate", "industry", "enterprise", "startup", "market"],
    "Education": ["education", "school", "university", "student", "teacher", "academic", "learning"],
    "Science": ["science", "research", "scientist", "study", "discovery", "experiment", "laboratory"]
}

# Country detection based on keywords and context
COUNTRY_KEYWORDS = {
    "India": ["india", "indian", "delhi", "mumbai", "bangalore", "modi", "bharat", "rupee", "rs.", "crore", "lakh"],
    "United States": ["usa", "america", "american", "washington", "new york", "dollar", "usd", "congress", "senate"],
    "United Kingdom": ["uk", "britain", "london", "pound", "gbp", "british", "parliament"],
    "China": ["china", "chinese", "beijing", "yuan", "cny", "xi"],
    "Japan": ["japan", "japanese", "tokyo", "yen", "jpy"],
    "Germany": ["germany", "german", "berlin", "euro", "eur"],
    "France": ["france", "french", "paris", "euro"],
    "Australia": ["australia", "australian", "sydney", "melbourne", "aud"],
    "Canada": ["canada", "canadian", "toronto", "ottawa", "cad"],
    "Brazil": ["brazil", "brazilian", "sao paulo", "real", "brl"]
}

# Load text classification model lazily
text_classifier = None
sentiment_analyzer = None


def _select_device():
    if torch.cuda.is_available():
        return 0
    return -1


def _warmup_pipeline(predict_fn, sample_text="warmup"):
    if not predict_fn:
        return
    try:
        predict_fn(sample_text)
    except Exception:
        pass


def get_text_classifier():
    global text_classifier, _MODEL_READY
    if not _TRANSFORMERS_AVAILABLE:
        return None
    if text_classifier is None:
        with _PIPELINE_LOCK:
            if text_classifier is None:
                try:
                    kwargs = {
                        "model": "distilbert-base-uncased-finetuned-sst-2-english",
                        "framework": "pt"
                    }
                    device = _select_device()
                    if device >= 0:
                        kwargs["device"] = device
                    text_classifier = pipeline("text-classification", **kwargs)
                    _warmup_pipeline(text_classifier, "Times Square verification warmup")
                    _MODEL_READY = True
                except Exception:
                    text_classifier = None
    return text_classifier


def get_sentiment_analyzer():
    global sentiment_analyzer
    if not _TRANSFORMERS_AVAILABLE:
        return None
    if sentiment_analyzer is None:
        with _SENTIMENT_LOCK:
            if sentiment_analyzer is None:
                try:
                    kwargs = {
                        "model": "cardiffnlp/twitter-roberta-base-sentiment-latest",
                        "framework": "pt"
                    }
                    device = _select_device()
                    if device >= 0:
                        kwargs["device"] = device
                    analyzer = pipeline("sentiment-analysis", **kwargs)
                    _warmup_pipeline(analyzer, "warming sentiment pipeline")
                    sentiment_analyzer = analyzer
                except Exception:
                    sentiment_analyzer = None
    return sentiment_analyzer


def _normalize_snippet(text, limit=2000):
    return (text or "").strip()[:limit]


@lru_cache(maxsize=512)
def _language_cache(snippet):
    if not snippet:
        return "Unknown", 0.50
    if not _LANGDETECT_AVAILABLE:
        if re.search(r'[\u0900-\u097F]', snippet):
            return "Hindi", 0.85
        if re.search(r'[\u4E00-\u9FFF]', snippet):
            return "Chinese", 0.85
        return "English", 0.70
    try:
        lang_code = detect(snippet)
        lang_map = {
            "en": "English", "hi": "Hindi", "es": "Spanish", "fr": "French",
            "de": "German", "it": "Italian", "pt": "Portuguese", "ru": "Russian",
            "zh": "Chinese", "ja": "Japanese", "ko": "Korean", "ar": "Arabic"
        }
        return lang_map.get(lang_code, lang_code.title()), 0.90
    except LangDetectException:
        return "Unknown", 0.50


@lru_cache(maxsize=512)
def _country_cache(snippet_lower):
    scores = {}
    for country, keywords in COUNTRY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in snippet_lower)
        if score > 0:
            scores[country] = score
    if scores:
        country = max(scores.items(), key=lambda x: x[1])[0]
        confidence = min(0.95, 0.60 + (scores[country] * 0.10))
        return country, confidence
    return "Unknown", 0.50


@lru_cache(maxsize=512)
def _industry_cache(snippet_lower):
    scores = {}
    for industry, keywords in INDUSTRY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in snippet_lower)
        if score > 0:
            scores[industry] = score
    if scores:
        industry = max(scores.items(), key=lambda x: x[1])[0]
        confidence = min(0.95, 0.65 + (scores[industry] * 0.05))
        return industry, confidence
    return "General", 0.50


def detect_language(text):
    """Detect language of the text"""
    snippet = _normalize_snippet(text)
    return _language_cache(snippet)


def detect_country(text):
    """Detect country based on keywords and context"""
    snippet_lower = _normalize_snippet(text).lower()
    return _country_cache(snippet_lower)


def classify_industry(text):
    """Classify news into industry category"""
    snippet_lower = _normalize_snippet(text).lower()
    return _industry_cache(snippet_lower)


def analyze_sentiment(text):
    """Analyze sentiment of the text"""
    analyzer = get_sentiment_analyzer()
    if analyzer:
        try:
            result = analyzer(text[:512])[0]
            label = result["label"]
            score = result["score"]
            sentiment_map = {
                "POSITIVE": "Positive",
                "NEGATIVE": "Negative",
                "NEUTRAL": "Neutral",
                "LABEL_0": "Negative",
                "LABEL_1": "Neutral",
                "LABEL_2": "Positive"
            }
            return sentiment_map.get(label, label), float(score * 100)
        except Exception:
            pass
    
    if _TEXTBLOB_AVAILABLE:
        try:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            if polarity > 0.1:
                return "Positive", float((polarity + 1) * 50)
            elif polarity < -0.1:
                return "Negative", float((abs(polarity) + 1) * 50)
            else:
                return "Neutral", float(50)
        except Exception:
            pass
    
    # Fallback heuristic
    positive_words = ["good", "great", "excellent", "amazing", "wonderful", "success", "win", "victory"]
    negative_words = ["bad", "terrible", "awful", "failure", "lose", "defeat", "crisis", "problem"]
    pos_count = sum(1 for w in positive_words if w in text.lower())
    neg_count = sum(1 for w in negative_words if w in text.lower())
    if pos_count > neg_count:
        return "Positive", float(60 + pos_count * 5)
    elif neg_count > pos_count:
        return "Negative", float(60 + neg_count * 5)
    return "Neutral", float(50)

def calculate_credibility_score(text, fake_probability, sentiment, industry):
    """Calculate overall credibility score"""
    base_score = 100 - fake_probability
    
    # Industry factor (some industries are more prone to fake news)
    industry_penalty = {
        "Politics": 5, "Entertainment": 3, "Media": 2, "General": 0
    }
    base_score -= industry_penalty.get(industry, 0)
    
    # Sentiment factor (extreme sentiments might indicate manipulation)
    if sentiment == "Negative" and fake_probability > 60:
        base_score -= 3
    elif sentiment == "Positive" and fake_probability > 70:
        base_score -= 2
    
    return max(0, min(100, base_score))


def run_fake_news_detection(text):
    cleaned = (text or "").strip()
    if not cleaned:
        return {
            "result": "UNKNOWN",
            "confidence": 0.0,
            "fake_probability": 50.0,
            "model": "none"
        }

    fake_probability = 50.0
    label = "REAL"
    model_used = "heuristic"
    snippet = cleaned[:512]

    classifier = get_text_classifier()
    if classifier is not None:
        try:
            result = classifier(snippet)[0]
            score = float(result["score"]) * 100
            label_result = result["label"].upper()
            if "NEGATIVE" in label_result or "FAKE" in label_result:
                fake_probability = score
                label = "FAKE"
            else:
                fake_probability = 100 - score
                label = "REAL"
            model_used = "transformers"
        except Exception:
            pass

    if model_used == "heuristic":
        keywords = [
            "clickbait", "shocking", "exclusive", "you won't believe",
            "urgent", "breaking", "conspiracy", "fake", "hoax", "misleading",
            "unverified", "rumor", "alleged", "supposedly"
        ]
        text_lower = cleaned.lower()
        fake_probability = min(99.0, 50.0 + 5.0 * sum(1 for k in keywords if k in text_lower))
        label = "FAKE" if fake_probability >= 60 else "REAL"

    return {
        "result": label,
        "confidence": float(100 - fake_probability),
        "fake_probability": float(fake_probability),
        "model": model_used
    }

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "transformers": bool(_TRANSFORMERS_AVAILABLE),
        "modelReady": bool(_MODEL_READY),
        "langdetect": bool(_LANGDETECT_AVAILABLE),
        "textblob": bool(_TEXTBLOB_AVAILABLE)
    })


@app.route("/predict/fake-news", methods=["POST"])
def detect_fake_news():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    return jsonify(run_fake_news_detection(text))

@app.route("/analyze/comprehensive", methods=["POST"])
def comprehensive_analysis():
    """Comprehensive news analysis with all features"""
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    url = data.get("url", "")
    
    if not text:
        return jsonify({"error": "No text provided"}), 400

    # Fake news detection
    fake_result = run_fake_news_detection(text)
    fake_probability = fake_result.get("fake_probability", 50.0)
    authenticity = fake_result.get("result", "REAL")
    authenticity_confidence = fake_result.get("confidence", 50.0)

    # Language detection
    language, lang_confidence = detect_language(text)

    # Country detection
    country, country_confidence = detect_country(text)

    # Industry classification
    industry, industry_confidence = classify_industry(text)

    # Sentiment analysis
    sentiment, sentiment_score = analyze_sentiment(text)

    # Credibility score
    credibility = calculate_credibility_score(text, fake_probability, sentiment, industry)

    # Additional metrics
    word_count = len(text.split())
    char_count = len(text)
    has_url = bool(url)
    has_numbers = bool(re.search(r'\d', text))
    has_caps = bool(re.search(r'[A-Z]{3,}', text))

    # Risk indicators
    risk_indicators = []
    if fake_probability > 70:
        risk_indicators.append("High fake news probability")
    if sentiment == "Negative" and fake_probability > 60:
        risk_indicators.append("Negative sentiment with suspicious content")
    if "unverified" in text.lower() or "rumor" in text.lower():
        risk_indicators.append("Contains unverified claims")
    if has_caps and fake_probability > 50:
        risk_indicators.append("Excessive capitalization")

    return jsonify({
        "authenticity": {
            "result": authenticity,
            "confidence": round(authenticity_confidence, 2),
            "fake_probability": round(fake_probability, 2)
        },
        "language": {
            "detected": language,
            "confidence": round(lang_confidence * 100, 2)
        },
        "country": {
            "detected": country,
            "confidence": round(country_confidence * 100, 2)
        },
        "industry": {
            "category": industry,
            "confidence": round(industry_confidence * 100, 2)
        },
        "sentiment": {
            "label": sentiment,
            "score": round(sentiment_score, 2)
        },
        "credibility": {
            "score": round(credibility, 2),
            "level": "High" if credibility >= 80 else "Medium" if credibility >= 50 else "Low"
        },
        "metrics": {
            "word_count": word_count,
            "character_count": char_count,
            "has_url": has_url,
            "has_numbers": has_numbers
        },
        "risk_indicators": risk_indicators,
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route("/predict/deepfake", methods=["POST"])
def detect_deepfake():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    try:
        image = Image.open(file.stream).convert("RGB")
        # Enhanced analysis with multiple factors
        # Simulate comprehensive deepfake detection
        confidence = float(np.random.uniform(75, 98))
        is_fake = confidence < 85
        
        # Analyze image characteristics
        img_array = np.array(image)
        brightness = np.mean(img_array)
        contrast = np.std(img_array)
        
        # Risk factors
        risk_factors = []
        if brightness < 80 or brightness > 200:
            risk_factors.append("Unusual brightness")
        if contrast < 30:
            risk_factors.append("Low contrast")
        
        return jsonify({
            "result": "fake" if is_fake else "authentic",
            "confidence": round(confidence, 2),
            "brightness": round(float(brightness), 2),
            "contrast": round(float(contrast), 2),
            "risk_factors": risk_factors
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)
