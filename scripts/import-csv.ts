import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

const CSV_PATH = path.join(process.cwd(), "data", "other_challenge_data.csv");
const DB_PATH = path.join(process.cwd(), "data", "zarinpal.db");

async function importCSV() {
  console.log("Starting CSV import...");

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Copy CSV if not in data directory
  const csvSource = path.join(process.cwd(), "..", "Downloads", "other_other_challenge_data.csv");
  if (!fs.existsSync(CSV_PATH) && fs.existsSync(csvSource)) {
    fs.copyFileSync(csvSource, CSV_PATH);
    console.log("Copied CSV to data directory");
  }

  // Create database
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  // Create table
  db.exec(`
    DROP TABLE IF EXISTS transactions;
    CREATE TABLE transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_key INTEGER,
      try_seq INTEGER,
      terminal_key TEXT,
      merchant_key TEXT,
      category_id INTEGER,
      category_title TEXT,
      amount INTEGER,
      adjusted_fee INTEGER,
      session_status TEXT,
      try_status TEXT,
      switch_response_code TEXT,
      psp_code TEXT,
      issuer_bank_code TEXT,
      payer_card_key TEXT,
      verify_type TEXT,
      init_time_ms INTEGER,
      verify_time_ms INTEGER,
      created_at TEXT,
      try_created_at TEXT,
      verified_at TEXT,
      settled_at TEXT,
      expire_in TEXT
    );
  `);

  // Read and parse CSV
  const fileContent = fs.readFileSync(CSV_PATH, "utf-8");

  // Create insert statement
  const insert = db.prepare(`
    INSERT INTO transactions (
      session_key, try_seq, terminal_key, merchant_key,
      category_id, category_title, amount, adjusted_fee,
      session_status, try_status, switch_response_code,
      psp_code, issuer_bank_code, payer_card_key,
      verify_type, init_time_ms, verify_time_ms,
      created_at, try_created_at, verified_at, settled_at, expire_in
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  let rowCount = 0;
  const batchSize = 10000;
  let batch: any[] = [];

  // Parse CSV
  const parser = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  console.log(`Total rows in CSV: ${parser.data.length}`);

  const insertMany = db.transaction((rows: any[]) => {
    for (const row of rows) {
      insert.run(
        row.session_key ? parseInt(row.session_key) : null,
        row.try_seq ? parseInt(row.try_seq) : null,
        row.terminal_key || null,
        row.merchant_key || null,
        row.category_id ? parseInt(row.category_id) : null,
        row.category_title || null,
        row.amount ? parseInt(row.amount) : null,
        row.adjusted_fee ? parseInt(row.adjusted_fee) : null,
        row.session_status || null,
        row.try_status || null,
        row.switch_response_code || null,
        row.psp_code || null,
        row.issuer_bank_code || null,
        row.payer_card_key || null,
        row.verify_type || null,
        row.init_time_ms ? parseInt(row.init_time_ms) : null,
        row.verify_time_ms ? parseInt(row.verify_time_ms) : null,
        row.created_at || null,
        row.try_created_at || null,
        row.verified_at || null,
        row.settled_at || null,
        row.expire_in || null
      );
    }
  });

  // Process in batches
  for (let i = 0; i < parser.data.length; i++) {
    batch.push(parser.data[i]);
    rowCount++;

    if (batch.length >= batchSize) {
      insertMany(batch);
      console.log(`Imported ${rowCount} rows...`);
      batch = [];
    }
  }

  // Insert remaining rows
  if (batch.length > 0) {
    insertMany(batch);
    console.log(`Imported ${rowCount} rows (final batch)`);
  }

  // Create indexes
  console.log("Creating indexes...");
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tx_session ON transactions(session_key);
    CREATE INDEX IF NOT EXISTS idx_tx_merchant ON transactions(merchant_key);
    CREATE INDEX IF NOT EXISTS idx_tx_psp ON transactions(psp_code);
    CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(session_status);
    CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions(created_at);
    CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category_id);
  `);

  // Create insights table
  db.exec(`
    CREATE TABLE IF NOT EXISTS insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      title TEXT,
      summary TEXT,
      details TEXT,
      query TEXT,
      query_result TEXT,
      severity TEXT,
      merchant_key TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Verify
  const count = db.prepare("SELECT COUNT(*) as count FROM transactions").get() as any;
  console.log(`Import complete! Total transactions: ${count.count}`);

  db.close();
}

importCSV().catch(console.error);
