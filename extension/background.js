// Background service worker for NewsVerify Pro extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First time installation
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'analyze-news',
    title: 'Analyze with NewsVerify Pro',
    contexts: ['selection', 'page']
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openPopup') {
    // In MV3, we can't programmatically open popup, but we can send a message
    chrome.action.setBadgeText({ text: '!' });
    setTimeout(() => chrome.action.setBadgeText({ text: '' }), 2000);
  }
  return true; // Keep channel open for async response
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyze-news') {
    // Open popup by clicking the action (user will need to click icon)
    chrome.action.setBadgeText({ text: '!' });
    // Store selected text for popup to use
    if (info.selectionText) {
      chrome.storage.local.set({ selectedText: info.selectionText });
    }
  }
});

// Handle extension icon click (popup will open automatically in MV3)
chrome.action.onClicked.addListener((tab) => {
  // Popup opens automatically when action has default_popup
  // This handler only runs if no popup is defined
});
