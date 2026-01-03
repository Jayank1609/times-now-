// Content script to detect news articles and show analysis badge
(function() {
  'use strict';

  // Detect if page is a news article
  function isNewsArticle() {
    const article = document.querySelector('article') || 
                   document.querySelector('[role="article"]') ||
                   document.querySelector('.article-content') ||
                   document.querySelector('.post-content') ||
                   document.querySelector('[class*="article"]') ||
                   document.querySelector('[class*="news"]');
    
    return !!article;
  }

  // Create analysis badge
  function createAnalysisBadge() {
    // Check if badge already exists
    if (document.getElementById('newsverify-badge')) {
      return;
    }

    const badge = document.createElement('div');
    badge.id = 'newsverify-badge';
    badge.innerHTML = `
      <style>
        #newsverify-badge {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          background: linear-gradient(135deg, #e31837 0%, #8a3ffc 100%);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-family: 'Arial', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: transform 0.2s;
          max-width: 300px;
        }
        #newsverify-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.4);
        }
        #newsverify-badge .badge-title {
          font-weight: 700;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        #newsverify-badge .badge-subtitle {
          font-size: 11px;
          opacity: 0.9;
        }
        #newsverify-badge .badge-close {
          position: absolute;
          top: 4px;
          right: 8px;
          font-size: 18px;
          cursor: pointer;
          opacity: 0.8;
        }
        #newsverify-badge .badge-close:hover {
          opacity: 1;
        }
      </style>
      <div class="badge-close" onclick="this.parentElement.remove()">×</div>
      <div class="badge-title">
        <span>📰</span>
        <span>NewsVerify Pro</span>
      </div>
      <div class="badge-subtitle">Click extension icon to analyze this article</div>
    `;

    document.body.appendChild(badge);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (badge.parentElement) {
        badge.style.opacity = '0';
        badge.style.transition = 'opacity 0.5s';
        setTimeout(() => badge.remove(), 500);
      }
    }, 10000);

    // Click to open extension popup (if possible)
    badge.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openPopup' });
    });
  }

  // Initialize
  if (isNewsArticle()) {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createAnalysisBadge);
    } else {
      createAnalysisBadge();
    }
  }

  // Listen for messages from extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageContent') {
      const article = document.querySelector('article') || 
                     document.querySelector('[role="article"]') ||
                     document.querySelector('.article-content') ||
                     document.querySelector('.post-content') ||
                     document.querySelector('main');
      
      const text = article ? article.innerText : document.body.innerText;
      sendResponse({ 
        text: text.slice(0, 5000), 
        url: window.location.href,
        title: document.title
      });
    }
    return true;
  });
})();
