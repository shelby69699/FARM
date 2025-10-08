import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'coke-lab.db');

// Initialize SQL.js
const SQL = await initSqlJs();
let db;

// Load existing database or create new one
if (existsSync(dbPath)) {
  const buffer = readFileSync(dbPath);
  db = new SQL.Database(buffer);
} else {
  db = new SQL.Database();
}

// Save database periodically
setInterval(() => {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
}, 5000); // Save every 5 seconds

// Save on exit
process.on('exit', () => {
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(dbPath, buffer);
});

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS farms (
    address TEXT PRIMARY KEY,
    base_power INTEGER NOT NULL,
    total_claimed REAL DEFAULT 0,
    pending REAL DEFAULT 0,
    last_claim_timestamp INTEGER NOT NULL,
    activated_at INTEGER NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    address TEXT NOT NULL,
    tx_hash TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL,
    verified INTEGER DEFAULT 0,
    verified_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_farms_address ON farms(address);
  CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);
  CREATE INDEX IF NOT EXISTS idx_payments_address ON payments(address);
`);

console.log('✓ Database initialized');

// Helper functions to mimic prepared statements
function runQuery(sql, params = []) {
  try {
    db.run(sql, params);
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result;
}

function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Prepared statements for better performance
export const statements = {
  getFarm: {
    get: (address) => getOne('SELECT * FROM farms WHERE address = ?', [address])
  },
  
  createFarm: {
    run: (address, base_power, last_claim_timestamp, activated_at) => 
      runQuery('INSERT INTO farms (address, base_power, last_claim_timestamp, activated_at) VALUES (?, ?, ?, ?)', 
        [address, base_power, last_claim_timestamp, activated_at])
  },
  
  updateFarmPending: {
    run: (pending, last_claim_timestamp, address) => 
      runQuery('UPDATE farms SET pending = ?, last_claim_timestamp = ? WHERE address = ?', 
        [pending, last_claim_timestamp, address])
  },
  
  claimFarmRewards: {
    run: (claimed, last_claim_timestamp, address) => 
      runQuery('UPDATE farms SET total_claimed = total_claimed + ?, pending = 0, last_claim_timestamp = ? WHERE address = ?', 
        [claimed, last_claim_timestamp, address])
  },
  
  getPayment: {
    get: (tx_hash) => getOne('SELECT * FROM payments WHERE tx_hash = ?', [tx_hash])
  },
  
  createPayment: {
    run: (address, tx_hash, amount) => 
      runQuery('INSERT INTO payments (address, tx_hash, amount) VALUES (?, ?, ?)', 
        [address, tx_hash, amount])
  },
  
  verifyPayment: {
    run: (verified_at, tx_hash) => 
      runQuery('UPDATE payments SET verified = 1, verified_at = ? WHERE tx_hash = ?', 
        [verified_at, tx_hash])
  },
  
  getAllFarms: {
    all: () => getAll('SELECT * FROM farms ORDER BY total_claimed DESC')
  },
  
  getTotalPower: {
    get: () => getOne('SELECT SUM(base_power) as total FROM farms')
  },
  
  getAllPayments: {
    all: () => getAll('SELECT * FROM payments ORDER BY created_at DESC')
  }
};

export default db;

