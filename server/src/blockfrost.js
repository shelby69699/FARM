import fetch from 'node-fetch';
import { config } from './config.js';

/**
 * Verify that a transaction sent the required COKE tokens to the treasury
 */
export async function verifyCokePayment(txHash, expectedAmount) {
  const url = `${config.blockfrost.apiUrl}/txs/${txHash}/utxos`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'project_id': config.blockfrost.projectId
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Blockfrost API error: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    // Check outputs for payment to treasury
    for (const output of data.outputs) {
      if (output.address === config.treasury.address) {
        // Look for COKE token in this output
        for (const amount of output.amount) {
          const unit = amount.unit;
          const quantity = parseInt(amount.quantity);
          
          // Match against our COKE token unit
          if (unit === config.token.unit && quantity >= expectedAmount) {
            console.log(`✓ Verified payment: ${quantity} COKE to treasury in tx ${txHash}`);
            return {
              verified: true,
              amount: quantity,
              txHash: txHash
            };
          }
        }
      }
    }
    
    return {
      verified: false,
      error: `No payment of ${expectedAmount} ${config.token.assetName} found to treasury address`
    };
    
  } catch (error) {
    console.error('Blockfrost verification error:', error);
    return {
      verified: false,
      error: error.message
    };
  }
}

/**
 * Get transaction confirmation status
 */
export async function getTransactionStatus(txHash) {
  const url = `${config.blockfrost.apiUrl}/txs/${txHash}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'project_id': config.blockfrost.projectId
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { confirmed: false, error: 'Transaction not found or not yet confirmed' };
      }
      throw new Error(`Blockfrost API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      confirmed: true,
      blockHeight: data.block_height,
      blockTime: data.block_time
    };
    
  } catch (error) {
    console.error('Transaction status error:', error);
    return {
      confirmed: false,
      error: error.message
    };
  }
}

