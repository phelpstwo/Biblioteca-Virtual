"""Aurora Livros — backend em Python (Flask) com PostgreSQL.

Sobe com:
    flask --app app run --host 127.0.0.1 --port 5000
ou:
    python app.py
"""

from __future__ import annotations

import html
import os
import re
from contextlib import closing
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from flask import Flask, Response, abort, jsonify, request, send_file
from psycopg.rows import dict_row

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__, static_folder="static", static_url_path="/static")

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", "5433")),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
    "dbname": os.getenv("DB_NAME", "biblioteca"),
}

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ---------------------------------------------------------------------------
# Banco de dados
# ---------------------------------------------------------------------------

def _connect() -> psycopg.Connection:
    return psycopg.connect(**DB_CONFIG, row_factory=dict_row)


def query_all(sql: str, params: tuple | list | None = None) -> list[dict]:
    with closing(_connect()) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            return cur.fetchall()


def query_one(sql: str, params: tuple | list | None = None) -> dict | None:
    with closing(_connect()) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            return cur.fetchone()


def execute(sql: str, params: tuple | list | None = None) -> int:
    with closing(_connect()) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params or ())
            conn.commit()
            return cur.rowcount


def book_select() -> str:
    return """
        SELECT b.id, b.slug, b.title, b.author, b.price, b.description,
               b.is_ranking, b.ranking_position,
               c.name AS category, c.slug AS category_slug, c.color AS category_color
        FROM books b
        JOIN categories c ON c.id = b.category_id
    """


# ---------------------------------------------------------------------------
# Páginas e arquivos estáticos
# ---------------------------------------------------------------------------

@app.get("/")
def index():
    return send_file(BASE_DIR / "index.html")


# ---------------------------------------------------------------------------
# API — livros, categorias e autores
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    try:
        books = query_one("SELECT COUNT(*)::int AS total FROM books")["total"]
        subscribers = query_one("SELECT COUNT(*)::int AS total FROM newsletter_subscribers")["total"]
        return jsonify({"status": "ok", "db": "postgresql", "books": books, "subscribers": subscribers})
    except Exception as exc:  # pragma: no cover - só aparece se o banco cair
        return jsonify({"status": "error", "db": str(exc)}), 500


@app.get("/api/categories")
def categories():
    rows = query_all("SELECT id, name, slug, color FROM categories ORDER BY name")
    return jsonify({"categories": rows})


@app.get("/api/books")
def books():
    search = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    author = request.args.get("author", "").strip()
    ranking = request.args.get("ranking", "").strip().lower()

    sql = book_select() + " WHERE 1 = 1"
    params: list = []

    if search:
        sql += " AND (b.title ILIKE %s OR b.author ILIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])
    if category:
        sql += " AND c.slug = %s"
        params.append(category)
    if author:
        sql += " AND b.author = %s"
        params.append(author)
    if ranking in {"1", "true", "sim", "s"}:
        sql += " AND b.is_ranking IS TRUE"

    sql += " ORDER BY b.is_ranking DESC, b.ranking_position ASC NULLS LAST, b.title ASC"
    return jsonify({"books": query_all(sql, params)})


@app.get("/api/books/<slug>")
def book_detail(slug: str):
    row = query_one(book_select() + " WHERE b.slug = %s", (slug,))
    if not row:
        abort(404, description="Livro não encontrado")
    return jsonify({"book": row})


@app.get("/api/authors")
def authors():
    rows = query_all(
        """
        SELECT author,
               COUNT(*)::int AS total,
               MIN(slug) AS sample_slug
        FROM books
        GROUP BY author
        ORDER BY author
        """
    )
    return jsonify({"authors": rows})


# ---------------------------------------------------------------------------
# API — newsletter
# ---------------------------------------------------------------------------

@app.post("/api/newsletter")
def newsletter():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email", "")).strip().lower()

    if not email or len(email) > 254 or not EMAIL_RE.match(email):
        return jsonify({"ok": False, "error": "Informe um e-mail válido."}), 400

    try:
        execute("INSERT INTO newsletter_subscribers (email) VALUES (%s)", (email,))
    except psycopg.errors.UniqueViolation:
        return jsonify({"ok": False, "error": "Este e-mail já está cadastrado."}), 409
    except Exception:
        return jsonify({"ok": False, "error": "Não foi possível salvar. Tente novamente."}), 500

    return jsonify({"ok": True, "message": "Inscrição confirmada! Obrigado por assinar a Cartas da Aurora."})


# ---------------------------------------------------------------------------
# Capas geradas em SVG (sem arquivos de imagem quebrados)
# ---------------------------------------------------------------------------

def _wrap(text: str, max_chars: int = 20) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split():
        candidate = f"{current} {word}".strip()
        if len(candidate) <= max_chars:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:5]


def render_cover_svg(title: str, author: str, color: str) -> str:
    lines = _wrap(title, 20)
    line_height = 44
    start_y = 300 - (len(lines) - 1) * line_height / 2
    tspans = "".join(
        f'<tspan x="200" y="{start_y + i * line_height:.0f}">{html.escape(line, quote=True)}</tspan>'
        for i, line in enumerate(lines)
    )
    safe_title = html.escape(title, quote=True)
    safe_author = html.escape(author, quote=True)
    safe_color = html.escape(color, quote=True)

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600" role="img" aria-label="{safe_title}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{safe_color}"/>
      <stop offset="1" stop-color="#16382a"/>
    </linearGradient>
  </defs>
  <rect width="400" height="600" fill="url(#g)"/>
  <rect x="24" y="24" width="352" height="552" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>
  <text x="200" y="82" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="15" letter-spacing="4" fill="#ffffff" fill-opacity="0.75">AURORA LIVROS</text>
  <text text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="bold" fill="#ffffff">{tspans}</text>
  <text x="200" y="540" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-style="italic" fill="#ffffff" fill-opacity="0.85">{safe_author}</text>
</svg>'''


@app.get("/covers/<slug>.svg")
def cover(slug: str):
    row = query_one(
        """
        SELECT b.title, b.author, c.color
        FROM books b
        JOIN categories c ON c.id = b.category_id
        WHERE b.slug = %s
        """,
        (slug,),
    )
    if not row:
        abort(404, description="Capa não encontrada")
    svg = render_cover_svg(row["title"], row["author"], row["color"])
    return Response(svg, mimetype="image/svg+xml", headers={"Cache-Control": "public, max-age=3600"})


# ---------------------------------------------------------------------------
# Erros em JSON para a API
# ---------------------------------------------------------------------------

@app.errorhandler(404)
def not_found(error):
    if request.path.startswith("/api/") or request.path.startswith("/covers/"):
        return jsonify({"ok": False, "error": str(error.description)}), 404
    return send_file(BASE_DIR / "index.html"), 404


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
