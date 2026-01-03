from flask import Flask, request, jsonify
import os
import numpy as np

# Disable TensorFlow usage inside transformers to avoid Windows DLL issues
os.environ.setdefault("DISABLE_TF", "1")
os.environ.setdefault("TRANSFORMERS_NO_TF", "1")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

import torch
try:
    from transformers import pipeline
    _TRANSFORMERS_AVAILABLE = True
except Exception:
    _TRANSFORMERS_AVAILABLE = False

import cv2
import io
from PIL import Image

app = Flask(__name__)
_MODEL_READY = False

# Load text classification model (HuggingFace) - lightweight when available
text_classifier = None
if _TRANSFORMERS_AVAILABLE:
    try:
        text_classifier = pipeline(
            "text-classification",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            framework="pt"
        )
        # Warmup for first tokenization/inference latency
        try:
            _ = text_classifier("warmup")
        except Exception:
            pass
        _MODEL_READY = True
    except Exception:
        text_classifier = None
        _MODEL_READY = False
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "transformers": bool(_TRANSFORMERS_AVAILABLE),
        "modelReady": bool(_MODEL_READY)
    })


@app.route("/predict/fake-news", methods=["POST"])
def detect_fake_news():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    if text_classifier is not None:
        try:
            result = text_classifier(text)[0]
            return jsonify({
                "result": result["label"],
                "confidence": float(result["score"]) * 100,
                "model": "transformers"
            })
        except Exception as e:
            # Fall back below
            pass

    # Fallback heuristic if transformers is unavailable
    keywords = [
        "clickbait", "shocking", "exclusive", "you won't believe",
        "urgent", "breaking", "conspiracy", "fake", "hoax"
    ]
    score = min(99.0, 50.0 + 5.0 * sum(1 for k in keywords if k in text.lower()))
    label = "FAKE" if score >= 60 else "REAL"
    return jsonify({"result": label, "confidence": float(score), "model": "heuristic"})

@app.route("/predict/deepfake", methods=["POST"])
def detect_deepfake():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    image = Image.open(file.stream).convert("RGB")
    # Dummy analysis placeholder (simulate model output)
    confidence = float(np.random.uniform(80, 99))
    return jsonify({"result": "authentic" if confidence > 90 else "fake", "confidence": confidence})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
