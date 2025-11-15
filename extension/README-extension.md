# Personal Data Guardian Chrome Extension

Browser extension that detects sensitive data requests and shows consent banners.

## Features

- **Automatic Detection**: Scans pages for sensitive keywords and input fields
- **Consent Banner**: Shows approve/reject options when sensitive content is detected
- **Persistent User ID**: Generates unique user identifier for tracking decisions
- **Backend Integration**: Sends decisions to Flask API for blockchain logging
- **Notifications**: Shows confirmation when decisions are logged

## Installation

### 1. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/` folder
5. Extension should appear in your extensions list

### 2. Verify Installation

- You should see the Personal Data Guardian icon in your Chrome toolbar
- Check the console in DevTools for "Personal Data Guardian: Background service worker loaded"

## How It Works

### Detection Logic
The extension scans pages for:
- **Keywords**: contact, location, phone, ssn, passport, etc.
- **Input Fields**: Placeholder text and field names containing sensitive terms

### User Flow
1. Extension detects sensitive content
2. Shows consent banner at top of page
3. User clicks Approve or Reject
4. Decision is sent to backend API
5. Backend logs to blockchain and database
6. User receives confirmation notification

## Sensitive Keywords

The extension currently detects these keywords:
- contact, contacts
- camera, geolocation, location
- phone, ssn, passport, id
- social security, address, email
- credit card, payment, personal

## Testing

1. Make sure the backend is running on `http://localhost:5000`
2. Open `demo_pages/sensitive_demo.html` in Chrome
3. You should see the consent banner appear
4. Click Approve or Reject to test the full flow

## Troubleshooting

- **Banner not showing**: Check console for errors, ensure page contains sensitive keywords
- **Backend errors**: Verify Flask server is running and accessible
- **Notifications not working**: Check Chrome notification permissions

## Development

To modify the extension:
1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon next to Personal Data Guardian
4. Reload any open tabs to see changes