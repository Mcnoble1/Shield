// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    settings: {
      enabled: true,
      autoScan: true,
      showWarnings: true,
      emailsScanned: 0,
      threatsBlocked: 0
    }
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStats') {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings;
      settings.emailsScanned += request.emailsScanned || 0;
      settings.threatsBlocked += request.threatsBlocked || 0;
      chrome.storage.sync.set({ settings });
    });
  }
});

// Update extension badge
function updateBadge(threatsBlocked) {
  if (threatsBlocked > 0) {
    chrome.action.setBadgeText({ text: threatsBlocked.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#C53030' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.settings) {
    const settings = changes.settings.newValue;
    updateBadge(settings.threatsBlocked);
  }
});