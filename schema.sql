-- Aurora Livros — schema do banco PostgreSQL
-- Aplicar com: psql -h 127.0.0.1 -p 5433 -U postgres -d biblioteca -f schema.sql

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  color       TEXT NOT NULL DEFAULT '#1f4d3a',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS books (
  id               SERIAL PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  author           TEXT NOT NULL,
  category_id      INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  price            NUMERIC(10, 2) NOT NULL DEFAULT 0,
  description      TEXT NOT NULL DEFAULT '',
  is_ranking       BOOLEAN NOT NULL DEFAULT FALSE,
  ranking_position INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_books_category ON books (category_id);
CREATE INDEX IF NOT EXISTS idx_books_ranking  ON books (is_ranking, ranking_position);
CREATE INDEX IF NOT EXISTS idx_books_author    ON books (author);

CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL PRIMARY KEY,
  customer_name  TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  total          NUMERIC(10, 2) NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pendente',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id    INTEGER NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
