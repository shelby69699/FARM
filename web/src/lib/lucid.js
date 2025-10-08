import { Blockfrost, Lucid } from 'lucid-cardano';
import { Buffer } from 'buffer';

const BLOCKFROST_API_URL = import.meta.env.VITE_BLOCKFROST_API_URL;
const BLOCKFROST_API_KEY = import.meta.env.VITE_BLOCKFROST_API_KEY;
const NETWORK = import.meta.env.VITE_NETWORK || 'Preprod';

let lucidInstance = null;

/**
 * Initialize Lucid with Blockfrost provider
 */
export async function initLucid() {
  if (lucidInstance) return lucidInstance;
  
  const blockfrostProvider = new Blockfrost(
    BLOCKFROST_API_URL,
    BLOCKFROST_API_KEY
  );
  
  lucidInstance = await Lucid.new(blockfrostProvider, NETWORK);
  
  return lucidInstance;
}

/**
 * Connect to a CIP-30 wallet
 */
export async function connectWallet(walletName) {
  const lucid = await initLucid();
  
  if (!window.cardano || !window.cardano[walletName]) {
    throw new Error(`${walletName} wallet not found`);
  }
  
  const api = await window.cardano[walletName].enable();
  lucid.selectWallet(api);
  
  return lucid;
}

/**
 * Get available wallets
 */
export function getAvailableWallets() {
  if (!window.cardano) return [];
  
  const wallets = [];
  const knownWallets = ['nami', 'eternl', 'flint', 'lace', 'yoroi', 'gerowallet', 'typhoncip30'];
  
  for (const walletName of knownWallets) {
    if (window.cardano[walletName]) {
      wallets.push({
        name: walletName,
        displayName: window.cardano[walletName].name || walletName,
        icon: window.cardano[walletName].icon || null
      });
    }
  }
  
  return wallets;
}

/**
 * Get wallet address
 */
export async function getWalletAddress(lucid) {
  const address = await lucid.wallet.address();
  return address;
}

/**
 * Get wallet UTxOs
 */
export async function getWalletUtxos(lucid) {
  const utxos = await lucid.wallet.getUtxos();
  return utxos;
}

/**
 * Calculate token balance from UTxOs
 */
export function calculateTokenBalance(utxos, tokenUnit) {
  let balance = 0n;
  
  for (const utxo of utxos) {
    if (utxo.assets[tokenUnit]) {
      balance += utxo.assets[tokenUnit];
    }
  }
  
  return balance;
}

/**
 * Calculate ADA balance from UTxOs
 */
export function calculateAdaBalance(utxos) {
  let balance = 0n;
  
  for (const utxo of utxos) {
    balance += utxo.assets.lovelace;
  }
  
  return balance;
}

/**
 * Build and submit payment transaction
 */
export async function sendPayment(lucid, recipientAddress, assets) {
  const tx = await lucid
    .newTx()
    .payToAddress(recipientAddress, assets)
    .complete();
  
  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  
  return txHash;
}

/**
 * Convert asset name to hex
 */
export function toHex(str) {
  return Buffer.from(str, 'utf8').toString('hex');
}

/**
 * Get COKE token unit
 */
export function getCokeUnit() {
  const policyId = import.meta.env.VITE_COKE_POLICY_ID;
  const assetName = import.meta.env.VITE_COKE_ASSET_NAME;
  return policyId + toHex(assetName);
}

