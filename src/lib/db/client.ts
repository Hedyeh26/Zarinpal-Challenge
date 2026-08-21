import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "zarinpal.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("cache_size = -64000");
    db.pragma("synchronous = NORMAL");
  }
  return db;
}

export function initDb() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
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

    CREATE INDEX IF NOT EXISTS idx_tx_session ON transactions(session_key);
    CREATE INDEX IF NOT EXISTS idx_tx_merchant ON transactions(merchant_key);
    CREATE INDEX IF NOT EXISTS idx_tx_psp ON transactions(psp_code);
    CREATE INDEX IF NOT EXISTS idx_tx_status ON transactions(session_status);
    CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions(created_at);
    CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category_id);
  `);

  return database;
}
