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

-- Birlikte nefes (15 Kasım 2026): yalnız toplam sayılar, kişi verisi yok.
-- Worker ilk istekte kendisi de oluşturur (ensureTogether).
CREATE TABLE IF NOT EXISTS together_min (minute INTEGER PRIMARY KEY, n INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS together_day (day TEXT PRIMARY KEY, n INTEGER NOT NULL);

-- Stoa'nın nabzı (15 Kasım 2026): yalnız toplamlar. Worker ilk istekte kurar (ensureStoa).
CREATE TABLE IF NOT EXISTS stoa_members (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS stoa_day (day TEXT NOT NULL, kind TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (day, kind));
CREATE TABLE IF NOT EXISTS stoa_country (day TEXT NOT NULL, cc TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (day, cc));
CREATE TABLE IF NOT EXISTS quote_hearts (quote_id TEXT PRIMARY KEY, n INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS quote_hearts_week (week TEXT NOT NULL, quote_id TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (week, quote_id));
