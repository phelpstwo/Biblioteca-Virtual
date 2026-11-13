-- Aurora Livros — schema do banco PostgreSQL
-- Aplicar com: psql -h 127.0.0.1 -p 5433 -U postgres -d biblioteca -f schema.sql

-- ---------- Catálogo ----------
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
  isbn             TEXT,
  copies           INTEGER NOT NULL DEFAULT 1 CHECK (copies >= 0),
  location         TEXT,
  is_ranking       BOOLEAN NOT NULL DEFAULT FALSE,
  ranking_position INTEGER,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migração para bases já existentes
ALTER TABLE books ADD COLUMN IF NOT EXISTS isbn TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS copies INTEGER NOT NULL DEFAULT 1 CHECK (copies >= 0);
ALTER TABLE books ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- ---------- Área da loja (newsletter e pedidos) ----------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

-- ---------- Biblioteca: administração e leitores ----------
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS members (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  status        TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('ativo', 'pendente', 'suspenso')),
  notify_due    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A área do leitor não usa senha (só e-mail)
ALTER TABLE members ALTER COLUMN password_hash DROP NOT NULL;

CREATE TABLE IF NOT EXISTS loans (
  id          SERIAL PRIMARY KEY,
  member_id   INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  book_id     INTEGER NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  loan_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date    DATE NOT NULL,
  return_date DATE,
  renewals    INTEGER NOT NULL DEFAULT 0,
  fine        NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reservations (
  id          SERIAL PRIMARY KEY,
  member_id   INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  book_id     INTEGER NOT NULL REFERENCES books(id) ON DELETE RESTRICT,
  status      TEXT NOT NULL DEFAULT 'fila' CHECK (status IN ('fila', 'disponivel', 'cancelada')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Índices ----------
CREATE INDEX IF NOT EXISTS idx_books_category ON books (category_id);
CREATE INDEX IF NOT EXISTS idx_books_ranking  ON books (is_ranking, ranking_position);
CREATE INDEX IF NOT EXISTS idx_books_author    ON books (author);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_loans_member   ON loans (member_id);
CREATE INDEX IF NOT EXISTS idx_loans_book     ON loans (book_id);
CREATE INDEX IF NOT EXISTS idx_reservations_member ON reservations (member_id);
CREATE INDEX IF NOT EXISTS idx_reservations_book   ON reservations (book_id);
