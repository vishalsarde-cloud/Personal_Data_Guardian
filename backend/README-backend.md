# Personal Data Guardian Backend

Flask API server that processes privacy decisions and logs them to the blockchain.

## Features

- **Privacy Decision Logging**: Receives decisions from Chrome extension
- **PII Detection**: Regex-based detection with optional OpenAI fallback
- **Blockchain Integration**: Logs decisions to Ethereum smart contract
- **SQLite Storage**: Local database for query performance
- **CORS Enabled**: Supports dashboard frontend

## Setup Instructions

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings:
# - PRIVATE_KEY: Get from Ganache (without 0x prefix)
# - CONTRACT_ADDRESS: Get from Remix after deployment
# - RPC_URL: Should be http://127.0.0.1:8545 for Ganache
```

### 4. Update Contract ABI
After deploying the smart contract in Remix:
1. Copy the ABI from compilation artifacts
2. Replace contents of `contract_abi.json` with the copied ABI

### 5. Run the Server
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

- **POST /log**: Log a privacy decision
- **GET /logs**: Retrieve all logged decisions
- **GET /stats**: Get decision statistics
- **GET /health**: Health check endpoint

## Fallback Mode

If blockchain deployment fails, set `USE_BLOCKCHAIN=false` in `.env`. The system will still work with SQLite-only storage.

## Testing

Test the API with curl:
```bash
# Health check
curl http://localhost:5000/health

# Get all logs
curl http://localhost:5000/logs

# Get statistics
curl http://localhost:5000/stats
```