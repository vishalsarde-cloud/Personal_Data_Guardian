# Personal Data Guardian

A blockchain-based privacy consent management system that detects sensitive data requests and logs user decisions on Ethereum.

## Overview

Personal Data Guardian consists of:
- **Chrome Extension**: Detects pages requesting sensitive data and shows consent banners
- **Flask Backend**: Processes decisions, runs PII detection, and logs to blockchain
- **Smart Contract**: Immutable log of privacy decisions on Ethereum
- **React Dashboard**: View all privacy decisions and blockchain transactions

## Quick Start Guide

### 1. Start Local Blockchain
```bash
npm install -g ganache-cli
ganache --deterministic -p 8545
```

### 2. Deploy Smart Contract
1. Open [Remix IDE](https://remix.ethereum.org)
2. Connect to localhost:8545 (Ganache)
3. Deploy `contract/DataGuardianLogger.sol`
4. Copy contract address and ABI to `backend/.env` and `backend/contract_abi.json`

### 3. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with contract address and Ganache private key
python app.py
```

### 4. Load Chrome Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → select `extension/` folder

### 5. Start Dashboard
```bash
cd dashboard
npm install
npm start
```

### 6. Test the Demo
1. Open `demo_pages/sensitive_demo.html` in Chrome
2. Extension should show consent banner
3. Click Approve/Reject → check backend logs
4. View decision in dashboard at `http://localhost:3000`

## Architecture

- **Extension**: Content script detects sensitive keywords → Background worker sends to backend
- **Backend**: Flask API receives decisions → Calls smart contract → Stores in SQLite
- **Contract**: Logs decisions with hash on Ethereum → Emits events
- **Dashboard**: Fetches logs from backend → Displays with transaction hashes

## Fallback Mode

If blockchain deployment fails, set `USE_BLOCKCHAIN=false` in `.env` - the system will still work with local SQLite storage.

---

Built for hackathons - minimal setup, maximum impact! 🚀