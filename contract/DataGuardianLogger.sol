// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title DataGuardianLogger
 * @dev Smart contract for logging privacy decisions on-chain
 * Stores hashed details to protect user privacy while maintaining transparency
 */
contract DataGuardianLogger {
    
    struct Log {
        address user;           // User's Ethereum address (extension generates)
        string dataType;        // Type of data detected (e.g., "contacts", "location")
        bool decision;          // User decision: true = approved, false = rejected
        bytes32 detailsHash;    // SHA-256 hash of detected details
        uint256 timestamp;      // Block timestamp
    }
    
    // Array to store all privacy logs
    Log[] public logs;
    
    // Event emitted when new privacy decision is logged
    event DataLogged(
        address indexed user,
        string dataType,
        bool decision,
        bytes32 detailsHash,
        uint256 timestamp
    );
    
    /**
     * @dev Log a new privacy decision
     * @param user User's address making the decision
     * @param dataType Type of sensitive data detected
     * @param decision User's approval/rejection decision
     * @param detailsHash SHA-256 hash of the details (privacy-preserving)
     */
    function logData(
        address user,
        string calldata dataType,
        bool decision,
        bytes32 detailsHash
    ) external {
        logs.push(Log({
            user: user,
            dataType: dataType,
            decision: decision,
            detailsHash: detailsHash,
            timestamp: block.timestamp
        }));
        
        emit DataLogged(user, dataType, decision, detailsHash, block.timestamp);
    }
    
    /**
     * @dev Get total number of logs
     * @return Total count of privacy logs
     */
    function getLogsCount() external view returns (uint256) {
        return logs.length;
    }
    
    /**
     * @dev Get a specific log by index
     * @param index Index of the log to retrieve
     * @return Log struct containing all privacy decision details
     */
    function getLog(uint256 index) external view returns (Log memory) {
        require(index < logs.length, "Log index out of bounds");
        return logs[index];
    }
    
    /**
     * @dev Get all logs for a specific user
     * @param user User's address to filter logs
     * @return Array of logs for the specified user
     */
    function getUserLogs(address user) external view returns (Log[] memory) {
        uint256 count = 0;
        
        // Count user's logs
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].user == user) {
                count++;
            }
        }
        
        // Create result array
        Log[] memory userLogs = new Log[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].user == user) {
                userLogs[index] = logs[i];
                index++;
            }
        }
        
        return userLogs;
    }
}