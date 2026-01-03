# NewsVerify Pro - Professional News Analysis Platform

A comprehensive AI-powered news analysis platform with real-time detection, industry classification, language detection, country origin identification, and quantified ML scores. Built with React, Node.js, Flask, and advanced ML models.

##  Features

- **Comprehensive Analysis**: Industry category, language detection, country origin, sentiment analysis, and credibility scoring
- **ML-Powered Detection**: Advanced AI models with confidence scores and fake news probability
- **Real-Time Processing**: Fast and efficient analysis with instant results
- **Multi-Language Support**: Automatic language detection for multiple languages
- **Community Verification**: Green/Red flag system with tracking across different platforms
- **Chrome Extension**: Analyze news directly from your browser
- **Professional Dashboard**: Visual analytics and history tracking
- **Trending News Analysis**: Explore and analyze trending news articles

##  Architecture

```
NewsVerify Pro/
├── client/          # React frontend (Material-UI)
├── server/          # Node.js/Express API
├── ml_service/      # Flask ML service with comprehensive analysis
├── extension/       # Chrome extension for news analysis
└── docker-compose.yml
```

## Prerequisites

- **Docker Desktop** (recommended) OR
- **Node.js** (v16+)
- **Python** (v3.8+)
- **MongoDB** (local or Atlas cloud)

## Quick Start

### Option 1: Docker (Recommended)

1. **Start MongoDB** (if using local MongoDB):
   ```bash
   # Ensure MongoDB is running on localhost:27017
   # Or use MongoDB Atlas cloud (configured in .env)
   ```

2. **Start all services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - API: http://localhost:5000
   - ML Service: http://localhost:8000

### Option 2: Manual Setup

1. **Install dependencies**:
   ```bash
   # Client
   cd client
   npm install
   
   # Server
   cd ../server
   npm install
   
   # ML Service
   cd ../ml_service
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   - Create `.env` file in root directory (see `.env.example`)
   - Update MongoDB URI if needed

3. **Start services** (in separate terminals):
   ```bash
   # Terminal 1: ML Service
   cd ml_service
   python app.py

   # Terminal 2: Backend API
   cd server
   npm start

   # Terminal 3: Frontend
   cd client
   npm start
   ```

## Chrome Extension Setup

1. **Load the extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `extension/` folder

2. **Configure API URL**:
   - The extension connects to `http://localhost:5000`
   - Ensure the backend server is running

3. **Use the extension**:
   - Navigate to any news article
   - Click the extension icon
   - Click "Analyze Page" to get comprehensive analysis

## API Endpoints

### Analysis
- `POST /api/analyze/comprehensive` - Comprehensive news analysis
- `POST /api/analyze/text` - Simple text analysis
- `POST /api/analyze/media` - Media/image analysis

### Flags & Community
- `POST /api/flags/:analysisId` - Submit green/red flag
- `GET /api/analysis/:id` - Get analysis by ID

### Data
- `GET /api/history` - Get analysis history
- `GET /api/news/trending` - Get trending news
- `GET /api/health` - Health check

##  Configuration

### Environment Variables (.env)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/deepfakeDB
ML_SERVICE_URL=http://localhost:8000
JWT_SECRET=supersecurekey
```

### MongoDB Setup

- **Local MongoDB**: Use `mongodb://127.0.0.1:27017/deepfakeDB`
- **MongoDB Atlas**: Use connection string from Atlas dashboard
- **Docker**: Use `mongodb://host.docker.internal:27017/deepfakeDB`

## ML Service Features

The ML service provides:
- **Language Detection**: Automatic detection of news language
- **Country Detection**: Identifies country of origin from content
- **Industry Classification**: Categorizes news into industries (Technology, Finance, Politics, etc.)
- **Sentiment Analysis**: Positive/Negative/Neutral sentiment with scores
- **Credibility Scoring**: Quantified credibility score (0-100)
- **Risk Indicators**: Flags potential issues in content
- **Fake News Detection**: ML-powered authenticity verification

## Frontend Features

- **Professional Design**: Times of India-inspired professional UI
- **Real-Time Analysis**: Instant results with loading states
- **Comprehensive Dashboard**: Visual analytics and statistics
- **Trending News**: Explore and analyze trending articles
- **History Tracking**: View all past analyses
- **Community Flags**: See and submit green/red flags

## Security Notes

- JWT tokens for authentication (if implemented)
- CORS enabled for development
- File upload limits configured
- Environment variables for sensitive data

## Troubleshooting

### ML Service not connecting
- Check if ML service is running on port 8000
- Verify `ML_SERVICE_URL` in `.env`
- Check Docker logs: `docker-compose logs ml_service`

### MongoDB connection issues
- Verify MongoDB is running
- Check connection string in `.env`
- For Docker: Use `host.docker.internal` instead of `localhost`

### Extension not working
- Ensure backend API is running on `localhost:5000`
- Check browser console for errors
- Verify extension permissions in `manifest.json`

### Port conflicts
- Change ports in `docker-compose.yml` if needed
- Update API URLs in frontend if ports change

## Development

### Adding new ML models
1. Update `ml_service/app.py` with new model
2. Add dependencies to `ml_service/requirements.txt`
3. Rebuild Docker container

### Adding new features
1. Update API endpoints in `server/server.js`
2. Update frontend components in `client/src/pages/`
3. Update Chrome extension if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.



**NewsVerify Pro** - Trust what you see. Verify what you share.
