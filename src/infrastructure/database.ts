import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
export function dataDirectory() { return resolve(process.env.FITLOG_DATA_DIR ?? resolve(process.env.LOCALAPPDATA ?? resolve(homedir(), '.local/share'), 'FitlogMcp')); }
export function openDatabase(directory: string) {
  mkdirSync(directory, { recursive: true });
  const db = new DatabaseSync(resolve(directory, 'fitlog.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000;
    CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS activities(id TEXT PRIMARY KEY, localDate TEXT NOT NULL, type TEXT NOT NULL, json TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS activity_date ON activities(localDate DESC,id DESC);
    CREATE TABLE IF NOT EXISTS idempotency(key TEXT PRIMARY KEY, hash TEXT NOT NULL, resultId TEXT NOT NULL);
    INSERT OR IGNORE INTO settings VALUES('schemaVersion','1');
    INSERT OR IGNORE INTO settings VALUES('revision','0');`);
  const version = db.prepare('SELECT json FROM settings WHERE key=?').get('schemaVersion')?.json;
  if (version !== '1') { db.close(); throw Error('Unsupported database schema'); }
  return db;
}
