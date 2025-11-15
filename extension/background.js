console.log('🛡️ Personal Data Guardian: Background service worker loaded');

const BACKEND_URL = 'http://localhost:5000';

// Generate or retrieve persistent user ID
async function getUserId() {
    const result = await chrome.storage.local.get(['dg_user']);
    if (result.dg_user) return result.dg_user;

    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    await chrome.storage.local.set({ dg_user: userId });
    return userId;
}

// Generate a simple Ethereum-style address
async function getUserAddress() {
    const result = await chrome.storage.local.get(['dg_user_address']);
    if (result.dg_user_address) return result.dg_user_address;

    const randomHex = () => Math.floor(Math.random() * 16).toString(16);
    const address = '0x' + Array.from({ length: 40 }, randomHex).join('');
    await chrome.storage.local.set({ dg_user_address: address });
    return address;
}

// Send decision to backend API
async function logDecision(userAddress, dataType, decision, details, url) {
    try {
        const response = await fetch(`${BACKEND_URL}/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: userAddress, dataType, decision, details })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const result = await response.json();

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Personal Data Guardian',
            message: `Decision logged ${result.tx_hash ? '& blockchain tx: ' + result.tx_hash.substr(0, 10) + '...' : 'to database'}`
        });

        return result;
    } catch (error) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Personal Data Guardian - Error',
            message: 'Failed to log decision: ' + error.message
        });
        throw error;
    }
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'decision') {
        (async () => {
            try {
                const userAddress = await getUserAddress();
                const result = await logDecision(userAddress, message.dataType, message.decision, message.details, message.url);
                sendResponse({ success: true, result });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
});

// Handle installation
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        const userId = await getUserId();
        const userAddress = await getUserAddress();

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Personal Data Guardian Activated',
            message: `Privacy protection enabled. User ID: ${userId}`
        });

        try {
            const response = await fetch(`${BACKEND_URL}/health`);
            if (!response.ok) throw new Error('Backend not responding');
        } catch (error) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon.png',
                title: 'Personal Data Guardian - Warning',
                message: 'Backend server not reachable. Please start the backend service.'
            });
        }
    }
});

// Handle notification clicks
chrome.notifications.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
});

console.log('🛡️ Personal Data Guardian: Background service worker ready');
