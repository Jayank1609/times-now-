# Complete Setup Guide - NewsVerify Pro

## Step-by-Step Installation

### 1. Prerequisites Installation

**Option A: Using Docker (Recommended)**
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Ensure Docker is running

**Option B: Manual Installation**
- Install [Node.js](https://nodejs.org/) (v16 or higher)
- Install [Python](https://www.python.org/) (v3.8 or higher)
- Install [MongoDB](https://www.mongodb.com/try/download/community) OR use MongoDB Atlas (cloud)

### 2. Clone/Download Project

```bash
cd "deepfake(10"
```

### 3. Environment Configuration

Create `.env` file in root directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://aarchigarg50_db_user:cje3cPtI34u4EVij@cluster0.o1jeqta.mongodb.net/deepfakeDB?retryWrites=true&w=majority&appName=Cluster0
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=supersecurekey
```

### 4. Start Services

#### Using Docker (Easiest):

```bash
docker-compose up --build
```

Wait for all services to start (may take 2-3 minutes on first run).

#### Manual Start:

**Terminal 1 - ML Service:**
```bash
cd ml_service
pip install -r requirements.txt
python app.py
```

**Terminal 2 - Backend API:**
```bash
cd server
npm install
npm start
```

**Terminal 3 - Frontend:**
```bash
cd client
npm install
npm start
```

### 5. Verify Installation

1. **Frontend**: Open http://localhost:3000
2. **API Health**: Open http://localhost:5000/api/health
3. **ML Service**: Open http://localhost:8000/health

### 6. Chrome Extension Setup

1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `extension/` folder from project
6. Extension icon should appear in toolbar

### 7. Test the Extension

1. Navigate to any news website (e.g., BBC, CNN, Times of India)
2. Click the NewsVerify Pro extension icon
3. Click "Analyze Page"
4. Wait for comprehensive analysis results

## Troubleshooting

### Port Already in Use

If ports 3000, 5000, or 8000 are in use:

**Docker:**
- Edit `docker-compose.yml` and change port mappings

**Manual:**
- Change ports in `.env` and update `client/webpack.config.js`

### MongoDB Connection Issues

**Docker:**
- For local MongoDB: Use `mongodb://host.docker.internal:27017/deepfakeDB`
- For Atlas: Use provided connection string

**Manual:**
- Ensure MongoDB is running: `mongodb://127.0.0.1:27017/deepfakeDB`
- Or use Atlas cloud connection string

### ML Service Not Starting

**Check:**
- Python version: `python --version` (should be 3.8+)
- Dependencies: `pip install -r ml_service/requirements.txt`
- Port 8000 available

### Extension Not Working

**Check:**
- Backend API running on `localhost:5000`
- Open browser console (F12) for errors
- Check extension permissions in Chrome
- Verify `manifest.json` has correct permissions

### Frontend Not Loading

**Check:**
- Node.js version: `node --version` (should be 16+)
- Dependencies installed: `cd client && npm install`
- Port 3000 available
- Webpack dev server running

## First-Time Analysis

1. Go to http://localhost:3000
2. Click "Start Analyzing" or go to Analyze page
3. Paste a news article text
4. Click "Analyze News"
5. View comprehensive results including:
   - Authenticity (Real/Fake)
   - Language detection
   - Country origin
   - Industry category
   - Sentiment analysis
   - Credibility score
   - Risk indicators

## Performance Tips

- **First Run**: ML models download (~500MB), be patient
- **Subsequent Runs**: Much faster (cached models)
- **Docker**: Uses more resources but easier to manage
- **Manual**: More control, less resource usage

## Next Steps

- Explore trending news in Explore page
- View analysis history in Dashboard
- Install extension on other browsers (Firefox, Edge)
- Customize ML models for your needs

## Support

For issues or questions:
- Check logs: `docker-compose logs` (Docker) or terminal output (Manual)
- Verify all services are running
- Check network connectivity
- Review error messages in browser console

---

**Happy Analyzing!** 🚀





