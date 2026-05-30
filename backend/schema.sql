-- Stoikos "Meydan Okuma" — kullanıcı sözleri
CREATE TABLE IF NOT EXISTS quotes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT NOT NULL,
  text       TEXT NOT NULL,
  author     TEXT,
  lang       TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | rejected
  reason     TEXT,                              -- ret/eleme sebebi
  likes      INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_quotes_status_lang ON quotes (status, lang);
CREATE INDEX IF NOT EXISTS idx_quotes_likes ON quotes (likes);

CREATE TABLE IF NOT EXISTS likes (
  quote_id INTEGER NOT NULL,
  user_id  TEXT NOT NULL,
  PRIMARY KEY (quote_id, user_id)
);
