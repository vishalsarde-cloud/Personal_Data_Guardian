#!/usr/bin/env python3
"""
Personal Data Guardian Backend
Flask API server for processing privacy decisions and blockchain logging
"""

import os
import sqlite3
import hashlib
import json
import time
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from web3 import Web3
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for dashboard

# Configuration
RPC_URL = os.getenv('RPC_URL', 'http://127.0.0.1:8545')
PRIVATE_KEY = os.getenv('PRIVATE_KEY', '')
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS', '')
USE_BLOCKCHAIN = os.getenv('USE_BLOCKCHAIN', 'true').lower() == 'true'
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# Initialize Web3
w3 = None
contract = None
account = None

if USE_BLOCKCHAIN and PRIVATE_KEY and CONTRACT_ADDRESS:
    try:
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        account = w3.eth.account.from_key(PRIVATE_KEY)
        
        # Load contract ABI
        with open('contract_abi.json', 'r') as f:
            contract_abi = json.load(f)
        
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(CONTRACT_ADDRESS),
            abi=contract_abi
        )
        print(f"✅ Connected to blockchain at {RPC_URL}")
        print(f"📄 Contract loaded at {CONTRACT_ADDRESS}")
        print(f"👤 Using account {account.address}")
    except Exception as e:
        print(f"❌ Blockchain connection failed: {e}")
        USE_BLOCKCHAIN = False

# Initialize SQLite Database
def init_database():
    """Initialize SQLite database with logs table"""
    conn = sqlite3.connect('logs.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_addr TEXT NOT NULL,
            data_type TEXT NOT NULL,
            decision BOOLEAN NOT NULL,
            details TEXT NOT NULL,
            details_hash TEXT NOT NULL,
            tx_hash TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("📊 Database initialized")

init_database()

def simple_pii_scan(text):
    """
    Simple PII detection using regex patterns
    Returns list of detected PII types
    """
    pii_patterns = {
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
        'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
        'passport': r'\b[A-Z]{1,2}\d{6,9}\b',
        'credit_card': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'
    }
    
    detected = []
    text_lower = text.lower()
    
    for pii_type, pattern in pii_patterns.items():
        if re.search(pattern, text, re.IGNORECASE):
            detected.append(pii_type)
    
    return detected

def log_to_blockchain(user_addr, data_type, decision, details_hash_bytes):
    """
    Log privacy decision to smart contract
    Returns transaction hash or None if failed
    """
    if not USE_BLOCKCHAIN or not contract:
        return None
    
    try:
        # Build transaction
        function = contract.functions.logData(
            Web3.to_checksum_address(user_addr),
            data_type,
            decision,
            details_hash_bytes
        )
        
        # Get gas estimate
        gas_estimate = function.estimate_gas({'from': account.address})
        
        # Build transaction
        transaction = function.build_transaction({
            'from': account.address,
            'gas': gas_estimate + 50000,  # Add buffer
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': w3.eth.get_transaction_count(account.address),
        })
        
        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, private_key=PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        # Wait for transaction receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        print(f"✅ Blockchain tx successful: {receipt.transactionHash.hex()}")
        return receipt.transactionHash.hex()
        
    except Exception as e:
        print(f"❌ Blockchain logging failed: {e}")
        return None

@app.route('/log', methods=['POST'])
def log_decision():
    """
    Log a privacy decision
    Expected JSON: {user, dataType, decision, details}
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user', 'dataType', 'decision', 'details']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        user_addr = data['user']
        data_type = data['dataType']
        decision = bool(data['decision'])
        details = data['details']
        
        # Generate SHA-256 hash of details
        details_hash = hashlib.sha256(details.encode('utf-8')).hexdigest()
        
        # Convert hash to bytes32 for Solidity (first 32 bytes)
        details_hash_bytes = Web3.keccak(text=details)
        
        # Run PII detection
        detected_pii = simple_pii_scan(details)
        if detected_pii:
            print(f"🔍 PII detected: {detected_pii}")
        
        # Log to blockchain
        tx_hash = None
        if USE_BLOCKCHAIN:
            tx_hash = log_to_blockchain(user_addr, data_type, decision, details_hash_bytes)
        
        # Store in SQLite
        conn = sqlite3.connect('logs.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO logs (user_addr, data_type, decision, details, details_hash, tx_hash)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_addr, data_type, decision, details, details_hash, tx_hash))
        
        conn.commit()
        conn.close()
        
        print(f"📝 Decision logged: {user_addr} - {data_type} - {'APPROVED' if decision else 'REJECTED'}")
        
        return jsonify({
            'status': 'success',
            'message': 'Decision logged successfully',
            'tx_hash': tx_hash,
            'details_hash': details_hash,
            'pii_detected': detected_pii
        })
        
    except Exception as e:
        print(f"❌ Error logging decision: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/logs', methods=['GET'])
def get_logs():
    """
    Retrieve all privacy decision logs
    Returns JSON array of logs
    """
    try:
        conn = sqlite3.connect('logs.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, user_addr, data_type, decision, details_hash, tx_hash, timestamp
            FROM logs
            ORDER BY timestamp DESC
        ''')
        
        logs = []
        for row in cursor.fetchall():
            logs.append({
                'id': row[0],
                'user': row[1],
                'dataType': row[2],
                'decision': bool(row[3]),
                'detailsHash': row[4],
                'txHash': row[5],
                'timestamp': row[6]
            })
        
        conn.close()
        
        return jsonify({'logs': logs})
        
    except Exception as e:
        print(f"❌ Error retrieving logs: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """
    Get basic statistics about privacy decisions
    """
    try:
        conn = sqlite3.connect('logs.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM logs WHERE decision = 1')
        approved = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM logs WHERE decision = 0')
        rejected = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(DISTINCT user_addr) FROM logs')
        unique_users = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'total_decisions': approved + rejected,
            'approved': approved,
            'rejected': rejected,
            'unique_users': unique_users,
            'blockchain_enabled': USE_BLOCKCHAIN
        })
        
    except Exception as e:
        print(f"❌ Error getting stats: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'blockchain_connected': USE_BLOCKCHAIN and contract is not None,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("\n🛡️  Personal Data Guardian Backend Starting...")
    print(f"🌐 Blockchain Mode: {'Enabled' if USE_BLOCKCHAIN else 'Disabled (SQLite only)'}")
    print(f"🔗 RPC URL: {RPC_URL}")
    if USE_BLOCKCHAIN:
        print(f"📄 Contract: {CONTRACT_ADDRESS}")
    print("🚀 Starting Flask server on http://localhost:5000\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)