const API_URL = 'http://localhost:5000/api';

// Check backend connectivity on load
async function checkBackendHealth() {
  try {
    const response = await fetch('http://localhost:5000/api/health', { 
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    if (response.ok) {
      const data = await response.json();
      return { connected: true, data };
    }
    return { connected: false, error: 'Backend returned error' };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

async function getActiveTabText() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // Try to get article content from common news sites
        const article = document.querySelector('article') || 
                       document.querySelector('[role="article"]') ||
                       document.querySelector('.article-content') ||
                       document.querySelector('.post-content') ||
                       document.querySelector('main');
        
        if (article) {
          return article.innerText.slice(0, 5000);
        }
        
        // Fallback to body text
        const bodyText = document.body.innerText;
        const paragraphs = bodyText.split('\n').filter(p => p.trim().length > 50);
        return paragraphs.slice(0, 10).join('\n').slice(0, 5000);
      }
    });
    return { text: result, url: tab.url, title: tab.title };
  } catch (err) {
    console.error('Error extracting text:', err);
    return { text: '', url: tab.url, title: tab.title };
  }
}

function showLoading() {
  document.getElementById('result').classList.add('show');
  document.getElementById('loading').style.display = 'block';
  document.getElementById('analysis').style.display = 'none';
}

function showError(message) {
  document.getElementById('result').classList.add('show');
  document.getElementById('loading').style.display = 'none';
  document.getElementById('analysis').innerHTML = `<div class="error">${message}</div>`;
  document.getElementById('analysis').style.display = 'block';
}

function displayAnalysis(data) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('analysis').style.display = 'block';
  
  const authenticity = data.authenticity || {};
  const result = authenticity.result || data.result || 'UNKNOWN';
  const confidence = authenticity.confidence || data.confidence || 0;
  const fakeProb = authenticity.fake_probability || 0;
  
  const isReal = result === 'REAL' || result === 'authentic';
  const authClass = isReal ? 'badge-success' : fakeProb > 60 ? 'badge-error' : 'badge-warning';
  
  // Authenticity display
  document.getElementById('authenticity').innerHTML = `
    <div class="metric">
      <div class="metric-label">Result</div>
      <div class="metric-value">
        <span class="badge ${authClass}">${result}</span>
        <span style="margin-left: 8px; font-weight: 600;">${confidence.toFixed(1)}% confidence</span>
      </div>
      ${fakeProb > 0 ? `<div style="margin-top: 8px; font-size: 12px; color: #666;">Fake News Probability: ${fakeProb.toFixed(1)}%</div>` : ''}
    </div>
  `;
  
  // Details display
  let detailsHtml = '';
  
  if (data.language) {
    detailsHtml += `
      <div class="metric">
        <div class="metric-label">🌐 Language</div>
        <div class="metric-value">${data.language.detected} (${data.language.confidence}% confidence)</div>
      </div>
    `;
  }
  
  if (data.country) {
    detailsHtml += `
      <div class="metric">
        <div class="metric-label">🌍 Country</div>
        <div class="metric-value">${data.country.detected} (${data.country.confidence}% confidence)</div>
      </div>
    `;
  }
  
  if (data.industry) {
    detailsHtml += `
      <div class="metric">
        <div class="metric-label">💼 Industry Category</div>
        <div class="metric-value">
          <span class="badge badge-info">${data.industry.category}</span>
          <span style="margin-left: 8px; font-size: 11px; color: #666;">${data.industry.confidence}% confidence</span>
        </div>
      </div>
    `;
  }
  
  if (data.sentiment) {
    const sentimentClass = data.sentiment.label === 'Positive' ? 'badge-success' : 
                           data.sentiment.label === 'Negative' ? 'badge-error' : 'badge-warning';
    detailsHtml += `
      <div class="metric">
        <div class="metric-label">😊 Sentiment</div>
        <div class="metric-value">
          <span class="badge ${sentimentClass}">${data.sentiment.label}</span>
          <span style="margin-left: 8px; font-size: 11px; color: #666;">Score: ${data.sentiment.score.toFixed(1)}</span>
        </div>
      </div>
    `;
  }
  
  if (data.credibility) {
    const credClass = data.credibility.score >= 80 ? 'badge-success' : 
                     data.credibility.score >= 50 ? 'badge-warning' : 'badge-error';
    detailsHtml += `
      <div class="metric" style="background: ${data.credibility.score >= 80 ? '#e8f5e9' : data.credibility.score >= 50 ? '#fff3e0' : '#ffebee'}; border-left: 3px solid ${data.credibility.score >= 80 ? '#4caf50' : data.credibility.score >= 50 ? '#ff9800' : '#f44336'};">
        <div class="metric-label">⭐ Credibility Score</div>
        <div class="metric-value">
          <span class="badge ${credClass}" style="font-size: 14px; padding: 6px 12px;">${data.credibility.score.toFixed(1)}%</span>
          <span style="margin-left: 8px; font-weight: 600;">${data.credibility.level}</span>
        </div>
      </div>
    `;
  }
  
  if (data.metrics) {
    detailsHtml += `
      <div class="metric">
        <div class="metric-label">📊 Content Metrics</div>
        <div class="metric-value" style="font-size: 12px;">
          Words: ${data.metrics.word_count} | Characters: ${data.metrics.character_count}
        </div>
      </div>
    `;
  }
  
  if (data.risk_indicators && data.risk_indicators.length > 0) {
    detailsHtml += `
      <div class="metric" style="background: #fff3e0; border-left: 3px solid #ff9800;">
        <div class="metric-label">⚠️ Risk Indicators</div>
        <div class="metric-value" style="font-size: 12px;">
          ${data.risk_indicators.map(risk => `<div style="margin: 4px 0;">• ${risk}</div>`).join('')}
        </div>
      </div>
    `;
  }
  
  document.getElementById('details').innerHTML = detailsHtml || '<div style="color: #666; font-size: 12px;">No additional details available</div>';
  
  // Update flags
  const flags = data.userFlags || { green: 0, red: 0 };
  document.getElementById('green-count').textContent = flags.green || 0;
  document.getElementById('red-count').textContent = flags.red || 0;
  
  // Store analysis ID for flag submission
  window.currentAnalysisId = data.id || data.analysisId;
}

async function analyzeContent() {
  // Check backend first
  const health = await checkBackendHealth();
  if (!health.connected) {
    showError(`Cannot connect to backend server. Please ensure:\n1. Docker containers are running\n2. Backend is accessible at http://localhost:5000\n\nError: ${health.error || 'Connection failed'}`);
    return;
  }
  
  showLoading();
  
  try {
    const { text, url, title } = await getActiveTabText();
    
    if (!text || text.trim().length < 20) {
      showError('Could not extract enough text from this page. Please try a news article page.');
      return;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(`${API_URL}/analyze/comprehensive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 5000), url, title }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Analysis failed' }));
      throw new Error(error.error || `HTTP ${response.status}: Analysis failed`);
    }
    
    const data = await response.json();
    displayAnalysis(data);
  } catch (err) {
    console.error('Analysis error:', err);
    if (err.name === 'AbortError') {
      showError('Request timed out. The ML model may still be loading. Please wait a moment and try again.');
    } else {
      showError(`Error: ${err.message}\n\nMake sure:\n- Backend server is running (http://localhost:5000)\n- ML service is ready (http://localhost:8000)`);
    }
  }
}

async function analyzeUrl() {
  showLoading();
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;
    
    if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
      showError('Cannot analyze this type of page. Please navigate to a news article.');
      return;
    }
    
    // Try to fetch and analyze the URL
    const response = await fetch(`${API_URL}/analyze/comprehensive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `Analyzing article from: ${url}`, url, title: tab.title })
    });
    
    if (!response.ok) {
      throw new Error('Analysis failed');
    }
    
    const data = await response.json();
    displayAnalysis(data);
  } catch (err) {
    showError(`Error: ${err.message}. Make sure the server is running.`);
  }
}

async function submitFlag(flag) {
  if (!window.currentAnalysisId) {
    alert('No analysis ID available');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/flags/${window.currentAnalysisId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag, platform: 'chrome-extension' })
    });
    
    if (response.ok) {
      const data = await response.json();
      document.getElementById('green-count').textContent = data.flags.green || 0;
      document.getElementById('red-count').textContent = data.flags.red || 0;
      
      // Visual feedback
      const btn = flag === 'green' ? document.getElementById('flag-green') : document.getElementById('flag-red');
      const originalText = btn.textContent;
      btn.textContent = '✓ Submitted!';
      btn.style.opacity = '0.7';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.opacity = '1';
      }, 2000);
    }
  } catch (err) {
    console.error('Flag submission error:', err);
    alert('Error submitting flag. Please try again.');
  }
}

// Event listeners
document.getElementById('check').addEventListener('click', analyzeContent);
document.getElementById('analyze-url').addEventListener('click', analyzeUrl);
document.getElementById('flag-green').addEventListener('click', () => submitFlag('green'));
document.getElementById('flag-red').addEventListener('click', () => submitFlag('red'));

// Auto-analyze on open if URL suggests a news article
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0]?.url || '';
  if (url && !url.startsWith('chrome://') && !url.startsWith('chrome-extension://')) {
    // Optionally auto-analyze
    // analyzeContent();
  }
});
