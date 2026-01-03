# NewsVerify Pro Chrome Extension

## Installation Instructions

1. **Ensure Docker services are running:**
   ```powershell
   Set-Location -LiteralPath 'C:\Users\jayank\Downloads\deepfake(10\deepfake(10'
   docker-compose up -d
   ```

2. **Load the extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Navigate to and select the `extension` folder:
     `C:\Users\jayank\Downloads\deepfake(10\deepfake(10\extension`
   - The extension should now appear in your extensions list

3. **Verify backend is running:**
   - Check http://localhost:5000/api/health in your browser
   - Should return: `{"api":"ok","ml":{...},"database":"in-memory",...}`

4. **Use the extension:**
   - Navigate to any news article page
   - Click the NewsVerify Pro extension icon in your toolbar
   - Click "Analyze Page" to get comprehensive analysis
   - Results will show authenticity, language, country, industry, sentiment, and credibility scores

## Features

- **Real-time News Analysis**: Analyze any news article directly from your browser
- **Comprehensive Metrics**: Get authenticity, language, country, industry, sentiment, and credibility scores
- **Community Flags**: Submit green/red flags for community verification
- **Professional UI**: Times Square-inspired design matching the main application

## Troubleshooting

- **"Cannot connect to backend"**: Ensure Docker containers are running (`docker ps`)
- **"Analysis failed"**: Check ML service is ready (may take 1-2 minutes on first run)
- **Extension not loading**: Verify you selected the correct `extension` folder (not the parent directory)

