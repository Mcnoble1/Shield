// Inject warning banner styles
const style = document.createElement('style');
style.textContent = `
  .phishing-warning {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #fed7d7;
    color: #c53030;
    padding: 12px;
    text-align: center;
    z-index: 9999;
    font-family: -apple-system, system-ui, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .warning-icon {
    width: 20px;
    height: 20px;
  }

  .warning-actions {
    margin-left: 16px;
  }

  .warning-btn {
    margin-left: 8px;
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .warning-btn.block {
    background: #c53030;
    color: white;
  }

  .warning-btn.trust {
    background: #white;
    border: 1px solid #c53030;
    color: #c53030;
  }
`;
document.head.appendChild(style);

let settings = {
  enabled: true,
  autoScan: true,
  showWarnings: true
};

// Load settings
chrome.storage.sync.get(['settings'], (result) => {
  if (result.settings) {
    settings = { ...settings, ...result.settings };
  }
});

// Listen for settings changes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleProtection') {
    settings.enabled = request.enabled;
  }
});

// Scan email content
async function scanEmail(emailContent) {
  try {
    const response = await fetch('https://your-api-endpoint.com/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: emailContent })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error scanning email:', error);
    return null;
  }
}

// Show warning banner
function showWarningBanner(result) {
  const banner = document.createElement('div');
  banner.className = 'phishing-warning';
  banner.innerHTML = `
    <svg class="warning-icon" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>
    <span>Potential phishing attempt detected! ${result.explanation}</span>
    <div class="warning-actions">
      <button class="warning-btn block">Block</button>
      <button class="warning-btn trust">Trust</button>
    </div>
  `;
  
  document.body.prepend(banner);
  
  // Handle button clicks
  banner.querySelector('.block').addEventListener('click', () => {
    // Implement blocking logic
    banner.remove();
  });
  
  banner.querySelector('.trust').addEventListener('click', () => {
    banner.remove();
  });
}

// Monitor for new emails
const observer = new MutationObserver((mutations) => {
  if (!settings.enabled || !settings.autoScan) return;
  
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(async node => {
      if (node.nodeType === Node.ELEMENT_NODE && node.matches('.email-content')) {
        const result = await scanEmail(node.textContent);
        if (result && result.isPhishing && settings.showWarnings) {
          showWarningBanner(result);
        }
      }
    });
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});