# Smart Contract Deployment

## DataGuardianLogger Contract

This Solidity contract logs privacy decisions on the Ethereum blockchain with privacy-preserving hashes.

## Deployment Steps

### 1. Start Ganache
```bash
ganache --deterministic -p 8545
```

### 2. Deploy via Remix
1. Open [Remix IDE](https://remix.ethereum.org)
2. Create new file and paste `DataGuardianLogger.sol`
3. Go to "Solidity Compiler" → Compile contract
4. Go to "Deploy & Run Transactions"
5. Set Environment to "External HTTP Provider"
6. Set URL to `http://127.0.0.1:8545`
7. Deploy the contract

### 3. Copy Contract Details
After deployment:
1. Copy the **contract address** from Remix
2. Copy the **ABI** from the compilation artifacts
3. Paste the contract address into `backend/.env` as `CONTRACT_ADDRESS`
4. Paste the full ABI into `backend/contract_abi.json`

### 4. Get Private Key
From Ganache output, copy one of the private keys (without 0x prefix) and add to `backend/.env` as `PRIVATE_KEY`.

## Contract Functions

- `logData()`: Records a new privacy decision
- `getLogsCount()`: Returns total number of logs
- `getLog(index)`: Retrieves a specific log
- `getUserLogs(address)`: Gets all logs for a user

## Events

- `DataLogged`: Emitted when new decision is recorded

The contract stores only hashed details to preserve privacy while maintaining blockchain transparency.