/**
 * Personal Data Guardian - Content Script
 * Detects sensitive data requests and shows consent banners
 */

console.log('🛡️ Personal Data Guardian: Content script loaded');

// Keywords that indicate sensitive data requests
const SENSITIVE_KEYWORDS = [
    'contact', 'contacts', 'camera', 'geolocation', 'location', 
    'phone', 'ssn', 'passport', 'id', 'social security',
    'address', 'email', 'credit card', 'payment', 'personal'
];

// Track if banner is already shown to avoid duplicates
let bannerShown = false;

/**
 * Check if page contains sensitive keywords in text or input elements
 */
function detectSensitiveContent() {
    const pageText = document.body.innerText.toLowerCase();
    const detectedKeywords = [];
    
    // Check page text for keywords
    SENSITIVE_KEYWORDS.forEach(keyword => {
        if (pageText.includes(keyword)) {
            detectedKeywords.push(keyword);
        }
    });
    
    // Check input elements for sensitive placeholders/names
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        const placeholder = (input.placeholder || '').toLowerCase();
        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        
        SENSITIVE_KEYWORDS.forEach(keyword => {
            if (placeholder.includes(keyword) || name.includes(keyword) || id.includes(keyword)) {
                if (!detectedKeywords.includes(keyword)) {
                    detectedKeywords.push(keyword);
                }
            }
        });
    });
    
    return detectedKeywords;
}

/**
 * Create and inject the consent banner
 */
function createConsentBanner(detectedKeywords) {
    // Remove existing banner if present
    const existingBanner = document.getElementById('data-guardian-banner');
    if (existingBanner) {
        existingBanner.remove();
    }
    
    // Create banner element
    const banner = document.createElement('div');
    banner.id = 'data-guardian-banner';
    banner.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 20px;
            z-index: 999999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            animation: slideDown 0.3s ease-out;
        ">
            <div style="display: flex; align-items: center;">
                <div style="
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    margin-right: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                ">🛡️</div>
                <div>
                    <strong>DataGuardian</strong> — This page requests sensitive data (${detectedKeywords.join(', ')})
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="dg-approve" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    ✓ Approve
                </button>
                <button id="dg-reject" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    ✗ Reject
                </button>
                <button id="dg-close" style="
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.8);
                    cursor: pointer;
                    font-size: 18px;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                " title="Close">×</button>
            </div>
        </div>
        <style>
            @keyframes slideDown {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        </style>
    `;
    
    // Insert banner at top of page
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Add event listeners
    document.getElementById('dg-approve').addEventListener('click', () => {
        handleDecision(true, detectedKeywords);
    });
    
    document.getElementById('dg-reject').addEventListener('click', () => {
        handleDecision(false, detectedKeywords);
    });
    
    document.getElementById('dg-close').addEventListener('click', () => {
        banner.remove();
        bannerShown = false;
    });
    
    // Adjust page content to account for banner height
    document.body.style.paddingTop = '70px';
    
    console.log('🛡️ Personal Data Guardian: Banner displayed for keywords:', detectedKeywords);
}

/**
 * Handle user decision (approve/reject)
 */
function handleDecision(decision, detectedKeywords) {
    console.log(`🛡️ Personal Data Guardian: User ${decision ? 'APPROVED' : 'REJECTED'} data access`);
    
    // Send message to background script
    chrome.runtime.sendMessage({
        action: 'decision',
        dataType: detectedKeywords.join(', '),
        decision: decision,
        details: `Detected keywords on ${window.location.href}: ${detectedKeywords.join(', ')}`,
        url: window.location.href
    });
    
    // Remove banner with animation
    const banner = document.getElementById('data-guardian-banner');
    if (banner) {
        banner.style.animation = 'slideUp 0.3s ease-in forwards';
        banner.style.animationName = 'slideUp';
        
        // Add slide up animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            banner.remove();
            document.body.style.paddingTop = '';
            bannerShown = false;
        }, 300);
    }
}

/**
 * Initialize content script
 */
function init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }
    
    // Skip if banner already shown
    if (bannerShown) return;
    
    // Detect sensitive content
    const detectedKeywords = detectSensitiveContent();
    
    if (detectedKeywords.length > 0) {
        console.log('🛡️ Personal Data Guardian: Sensitive content detected:', detectedKeywords);
        createConsentBanner(detectedKeywords);
        bannerShown = true;
    } else {
        console.log('🛡️ Personal Data Guardian: No sensitive content detected');
    }
}

// Initialize when script loads
init();

// Re-check when DOM changes (for dynamic content)
const observer = new MutationObserver(() => {
    if (!bannerShown) {
        const detectedKeywords = detectSensitiveContent();
        if (detectedKeywords.length > 0) {
            createConsentBanner(detectedKeywords);
            bannerShown = true;
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });