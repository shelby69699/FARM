import dotenv from 'dotenv';
dotenv.config();

export const config = {
  blockfrost: {
    projectId: process.env.BLOCKFROST_PROJECT_ID,
    network: process.env.BLOCKFROST_NETWORK || 'preprod',
    apiUrl: process.env.BLOCKFROST_NETWORK === 'mainnet' 
      ? 'https://cardano-mainnet.blockfrost.io/api/v0'
      : 'https://cardano-preprod.blockfrost.io/api/v0'
  },
  treasury: {
    address: process.env.TREASURY_ADDRESS
  },
  token: {
    policyId: process.env.COKE_POLICY_ID,
    assetName: process.env.COKE_ASSET_NAME || 'COKE',
    // Compute the unit as policyId + hex(assetName)
    get unit() {
      return this.policyId + Buffer.from(this.assetName, 'utf8').toString('hex');
    }
  },
  game: {
    startLabPrice: parseInt(process.env.START_LAB_PRICE || '1000000'),
    basePower: parseInt(process.env.BASE_POWER || '100'),
    emissionPerSecond: parseFloat(process.env.EMISSION_PER_SECOND || '0.5'),
    halvingIntervalSeconds: parseInt(process.env.HALVING_INTERVAL_SECONDS || '1209600'), // 14 days
    genesisTimestamp: parseInt(process.env.GENESIS_TIMESTAMP || '1704067200')
  },
  server: {
    port: parseInt(process.env.PORT || '8787')
  }
};

// Validate critical config
export function validateConfig() {
  const errors = [];
  
  if (!config.blockfrost.projectId) {
    errors.push('BLOCKFROST_PROJECT_ID is required');
  }
  if (!config.treasury.address) {
    errors.push('TREASURY_ADDRESS is required');
  }
  if (!config.token.policyId) {
    errors.push('COKE_POLICY_ID is required');
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
  
  console.log('✓ Configuration validated');
  console.log(`  Network: ${config.blockfrost.network}`);
  console.log(`  Treasury: ${config.treasury.address}`);
  console.log(`  Token Unit: ${config.token.unit}`);
}

