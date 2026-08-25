from __future__ import annotations
import json, sqlite3
from contextlib import contextmanager
from pathlib import Path

SCHEMA = """PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS sessions(session_id TEXT PRIMARY KEY,workflow_stage TEXT NOT NULL,revision INTEGER NOT NULL,state_json TEXT NOT NULL,created_at TEXT NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS candidates(candidate_id TEXT PRIMARY KEY,session_id TEXT NOT NULL,kind TEXT NOT NULL,disposition TEXT NOT NULL,payload_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS events(event_id TEXT PRIMARY KEY,session_id TEXT NOT NULL,event_type TEXT NOT NULL,payload_json TEXT NOT NULL,occurred_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS assets(asset_id TEXT PRIMARY KEY,session_id TEXT NOT NULL,kind TEXT NOT NULL,status TEXT NOT NULL,storage_ref TEXT NOT NULL,lineage_json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS idempotency(session_id TEXT NOT NULL,key TEXT NOT NULL,request_hash TEXT,response_json TEXT NOT NULL,PRIMARY KEY(session_id,key));"""

class Repository:
    def __init__(self, database_path):
        self.database_path=str(database_path); Path(self.database_path).parent.mkdir(parents=True,exist_ok=True)
        with self.connect() as connection:
            connection.executescript(SCHEMA)
            columns={row[1] for row in connection.execute("PRAGMA table_info(idempotency)")}
            if "request_hash" not in columns:connection.execute("ALTER TABLE idempotency ADD COLUMN request_hash TEXT")
    @contextmanager
    def connect(self):
        connection=sqlite3.connect(self.database_path); connection.row_factory=sqlite3.Row
        try:
            yield connection; connection.commit()
        except Exception:
            connection.rollback(); raise
        finally: connection.close()
    @staticmethod
    def decode(row):
        if row is None:return None
        result=dict(row)
        for key in tuple(result):
            if key.endswith('_json'): result[key[:-5]]=json.loads(result.pop(key))
        return result
