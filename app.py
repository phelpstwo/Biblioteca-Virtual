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
import unicodedata
from contextlib import closing
from datetime import date, timedelta
from functools import wraps
from pathlib import Path

import psycopg
from dotenv import load_dotenv
from flask import (
    Flask,
    Response,
    abort,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    send_file,
    session,
    url_for,
)
from psycopg.rows import dict_row
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__, static_folder="static", static_url_path="/static")
app.secret_key = os.getenv("SECRET_KEY", "aurora-livros-desenvolvimento")

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", "5433")),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
    "dbname": os.getenv("DB_NAME", "biblioteca"),
}

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PAYMENT_METHODS = {"pix": "Pix", "cartao": "Cartão de crédito", "debito": "Cartão de débito"}
FINE_PER_DAY = 1.0
LOAN_DAYS = 14
MAX_RENEWALS = 2


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
               b.isbn, b.copies, b.location, b.is_active,
               b.is_ranking, b.ranking_position,
               c.name AS category, c.slug AS category_slug, c.color AS category_color
        FROM books b
        JOIN categories c ON c.id = b.category_id
    """


def slugify(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-") or "item"


def unique_slug(title: str) -> str:
    base = slugify(title)
    slug = base
    counter = 2
    while query_one("SELECT id FROM books WHERE slug = %s", (slug,)):
        slug = f"{base}-{counter}"
        counter += 1
    return slug


def available_copies(book_id: int) -> int:
    book = query_one("SELECT copies FROM books WHERE id = %s", (book_id,))
    active = query_one(
        "SELECT COUNT(*)::int AS total FROM loans WHERE book_id = %s AND return_date IS NULL",
        (book_id,),
    )
    total = book["copies"] if book else 0
    used = active["total"] if active else 0
    return max(0, total - used)


def loan_state(loan: dict) -> str:
    if loan.get("return_date"):
        return "devolvido"
    due = loan["due_date"]
    if isinstance(due, str):
        due = date.fromisoformat(due)
    return "atrasado" if due < date.today() else "ativo"


# ---------------------------------------------------------------------------
# Autenticação (admin e leitor são sessões separadas)
# ---------------------------------------------------------------------------

def admin_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if not session.get("admin_id"):
            return redirect(url_for("admin_login"))
        return view(*args, **kwargs)
    return wrapper


def member_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if not session.get("member_id"):
            return redirect(url_for("member_login"))
        return view(*args, **kwargs)
    return wrapper


# ---------------------------------------------------------------------------
# Loja — página inicial e API pública
# ---------------------------------------------------------------------------

@app.get("/")
def index():
    return send_file(BASE_DIR / "index.html")


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

    sql = book_select() + " WHERE b.is_active IS TRUE"
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
        SELECT author, COUNT(*)::int AS total, MIN(slug) AS sample_slug
        FROM books
        WHERE is_active IS TRUE
        GROUP BY author
        ORDER BY author
        """
    )
    return jsonify({"authors": rows})


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
# Loja — pedidos (checkout)
# ---------------------------------------------------------------------------

@app.post("/api/orders")
def create_order():
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    payment = str(payload.get("payment_method", "")).strip().lower()
    items = payload.get("items") or []

    if len(name) < 2:
        return jsonify({"ok": False, "error": "Informe seu nome completo."}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"ok": False, "error": "Informe um e-mail válido."}), 400
    if payment not in PAYMENT_METHODS:
        return jsonify({"ok": False, "error": "Forma de pagamento inválida."}), 400
    if not isinstance(items, list) or not items:
        return jsonify({"ok": False, "error": "O carrinho está vazio."}), 400

    normalized: list[tuple[str, int]] = []
    for item in items:
        slug = str(item.get("slug", "")).strip()
        try:
            quantity = int(item.get("quantity", 1))
        except (TypeError, ValueError):
            quantity = 1
        quantity = max(1, min(10, quantity))
        if slug:
            normalized.append((slug, quantity))
    if not normalized:
        return jsonify({"ok": False, "error": "O carrinho está vazio."}), 400

    slugs = list({slug for slug, _ in normalized})
    rows = query_all("SELECT id, slug, price FROM books WHERE slug = ANY(%s)", (slugs,))
    price_by_slug = {row["slug"]: row for row in rows}
    if len(price_by_slug) != len(slugs):
        return jsonify({"ok": False, "error": "Um dos livros não foi encontrado."}), 400

    total = sum(float(price_by_slug[slug]["price"]) * qty for slug, qty in normalized)

    try:
        with closing(_connect()) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO orders (customer_name, customer_email, payment_method, total, status)
                    VALUES (%s, %s, %s, %s, 'pendente')
                    RETURNING id
                    """,
                    (name, email, PAYMENT_METHODS[payment], total),
                )
                row = cur.fetchone()
                if row is None:
                    raise RuntimeError("Falha ao criar pedido")
                order_id = row["id"]  # type: ignore[index]
                for slug, qty in normalized:
                    book = price_by_slug[slug]
                    cur.execute(
                        """
                        INSERT INTO order_items (order_id, book_id, quantity, unit_price)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (order_id, book["id"], qty, book["price"]),
                    )
            conn.commit()
    except Exception:
        return jsonify({"ok": False, "error": "Não foi possível registrar o pedido. Tente novamente."}), 500

    return jsonify({
        "ok": True,
        "order": {
            "id": order_id,
            "total": total,
            "payment_method": PAYMENT_METHODS[payment],
            "name": name,
            "email": email,
            "items": [
                {"slug": slug, "quantity": qty, "price": float(price_by_slug[slug]["price"])}
                for slug, qty in normalized
            ],
        },
    }), 201


@app.get("/api/orders/<int:order_id>")
def order_detail(order_id: int):
    order = query_one("SELECT * FROM orders WHERE id = %s", (order_id,))
    if not order:
        abort(404, description="Pedido não encontrado")
    items = query_all(
        """
        SELECT oi.quantity, oi.unit_price, b.title, b.slug
        FROM order_items oi
        JOIN books b ON b.id = oi.book_id
        WHERE oi.order_id = %s
        ORDER BY oi.id
        """,
        (order_id,),
    )
    return jsonify({"order": {**order, "items": items}})


# ---------------------------------------------------------------------------
# Capas geradas em SVG
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
# ADMIN — login, dashboard, acervo, empréstimos, usuários, atrasos, segurança
# ---------------------------------------------------------------------------

@app.get("/admin")
def admin_home():
    if session.get("admin_id"):
        return redirect(url_for("admin_dashboard"))
    return redirect(url_for("admin_login"))


@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    total_admins = query_one("SELECT COUNT(*)::int AS total FROM admins")["total"]

    if total_admins == 0:
        # Primeiro acesso: a senha do administrador é definida aqui.
        if request.method == "POST":
            name = request.form.get("name", "").strip()
            email = request.form.get("email", "").strip().lower()
            password = request.form.get("password", "")
            confirm = request.form.get("confirm", "")

            if len(name) < 2:
                flash("Informe seu nome.", "error")
            elif not EMAIL_RE.match(email):
                flash("Informe um e-mail válido.", "error")
            elif len(password) < 6:
                flash("A senha deve ter pelo menos 6 caracteres.", "error")
            elif password != confirm:
                flash("As senhas não conferem.", "error")
            else:
                execute(
                    "INSERT INTO admins (name, email, password_hash) VALUES (%s, %s, %s)",
                    (name, email, generate_password_hash(password)),
                )
                admin = query_one("SELECT id, name FROM admins WHERE email = %s", (email,))
                session["admin_id"] = admin["id"]
                session["admin_name"] = admin["name"]
                flash("Senha de administrador definida. Bem-vindo!", "ok")
                return redirect(url_for("admin_dashboard"))
        return render_template("admin/login.html", setup=True)

    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        admin = query_one("SELECT * FROM admins WHERE email = %s", (email,))
        if admin and check_password_hash(admin["password_hash"], password):
            session["admin_id"] = admin["id"]
            session["admin_name"] = admin["name"]
            return redirect(url_for("admin_dashboard"))
        flash("E-mail ou senha inválidos.", "error")

    return render_template("admin/login.html", setup=False)


@app.get("/admin/logout")
def admin_logout():
    session.pop("admin_id", None)
    session.pop("admin_name", None)
    return redirect(url_for("admin_login"))


@app.get("/admin/dashboard")
@admin_required
def admin_dashboard():
    stats = {
        "total_books": query_one("SELECT COUNT(*)::int AS total FROM books WHERE is_active")["total"],
        "total_copies": query_one("SELECT COALESCE(SUM(copies),0)::int AS total FROM books")["total"],
        "active_loans": query_one("SELECT COUNT(*)::int AS total FROM loans WHERE return_date IS NULL")["total"],
        "overdue_loans": query_one(
            "SELECT COUNT(*)::int AS total FROM loans WHERE return_date IS NULL AND due_date < CURRENT_DATE"
        )["total"],
        "members": query_one("SELECT COUNT(*)::int AS total FROM members")["total"],
        "pending_members": query_one("SELECT COUNT(*)::int AS total FROM members WHERE status = 'pendente'")["total"],
        "fila_reservations": query_one("SELECT COUNT(*)::int AS total FROM reservations WHERE status = 'fila'")["total"],
    }
    stats["available_copies"] = max(0, stats["total_copies"] - stats["active_loans"])
    most_borrowed = query_all(
        """
        SELECT b.title, COUNT(*)::int AS total
        FROM loans l JOIN books b ON b.id = l.book_id
        GROUP BY b.title ORDER BY total DESC, b.title LIMIT 5
        """
    )
    return render_template("admin/dashboard.html", stats=stats, most_borrowed=most_borrowed)


@app.get("/admin/acervo")
@admin_required
def admin_books():
    books = query_all(
        """
        SELECT b.*, c.name AS category,
               b.copies - COALESCE((SELECT COUNT(*) FROM loans l WHERE l.book_id = b.id AND l.return_date IS NULL), 0) AS available
        FROM books b JOIN categories c ON c.id = b.category_id
        ORDER BY b.is_active DESC, b.title
        """
    )
    return render_template("admin/books.html", books=books)


def _save_book(book_id: int | None) -> tuple[bool, str]:
    title = request.form.get("title", "").strip()
    author = request.form.get("author", "").strip()
    category_id = int(request.form.get("category_id", 0) or 0)
    price = float(request.form.get("price", 0) or 0)
    description = request.form.get("description", "").strip()
    isbn = request.form.get("isbn", "").strip()
    copies = int(request.form.get("copies", 1) or 1)
    location = request.form.get("location", "").strip()
    is_ranking = request.form.get("is_ranking") == "1"
    ranking_position = request.form.get("ranking_position", "").strip()
    is_active = request.form.get("is_active") == "1"

    if len(title) < 2:
        return False, "Informe o título."
    if len(author) < 2:
        return False, "Informe o autor."
    if category_id <= 0:
        return False, "Selecione uma categoria."
    if copies < 0:
        return False, "A quantidade de cópias não pode ser negativa."

    fields = {
        "title": title,
        "author": author,
        "category_id": category_id,
        "price": price,
        "description": description,
        "isbn": isbn or None,
        "copies": copies,
        "location": location or None,
        "is_ranking": is_ranking,
        "ranking_position": int(ranking_position) if ranking_position else None,
        "is_active": is_active,
    }

    if book_id is None:
        fields["slug"] = unique_slug(title)
        columns = ", ".join(fields)
        placeholders = ", ".join(f"%s" for _ in fields)
        execute(f"INSERT INTO books ({columns}) VALUES ({placeholders})", tuple(fields.values()))
    else:
        assignments = ", ".join(f"{key} = %s" for key in fields)
        execute(f"UPDATE books SET {assignments} WHERE id = %s", (*fields.values(), book_id))

    return True, "Livro salvo com sucesso."


@app.route("/admin/livros/novo", methods=["GET", "POST"])
@admin_required
def admin_book_new():
    categories = query_all("SELECT id, name FROM categories ORDER BY name")
    if request.method == "POST":
        ok, message = _save_book(None)
        flash(message, "ok" if ok else "error")
        if ok:
            return redirect(url_for("admin_books"))
    return render_template("admin/book_form.html", book=None, categories=categories)


@app.route("/admin/livros/<int:book_id>/editar", methods=["GET", "POST"])
@admin_required
def admin_book_edit(book_id: int):
    book = query_one("SELECT * FROM books WHERE id = %s", (book_id,))
    if not book:
        abort(404)
    categories = query_all("SELECT id, name FROM categories ORDER BY name")
    if request.method == "POST":
        ok, message = _save_book(book_id)
        flash(message, "ok" if ok else "error")
        if ok:
            return redirect(url_for("admin_books"))
    return render_template("admin/book_form.html", book=book, categories=categories)


@app.post("/admin/livros/<int:book_id>/excluir")
@admin_required
def admin_book_delete(book_id: int):
    loans = query_one("SELECT COUNT(*)::int AS total FROM loans WHERE book_id = %s", (book_id,))["total"]
    reservations = query_one("SELECT COUNT(*)::int AS total FROM reservations WHERE book_id = %s", (book_id,))["total"]
    if loans or reservations:
        execute("UPDATE books SET is_active = FALSE WHERE id = %s", (book_id,))
        flash("O livro possui empréstimos ou reservas e foi inativado em vez de excluído.", "ok")
    else:
        execute("DELETE FROM books WHERE id = %s", (book_id,))
        flash("Livro excluído.", "ok")
    return redirect(url_for("admin_books"))


@app.post("/admin/livros/<int:book_id>/status")
@admin_required
def admin_book_status(book_id: int):
    active = request.form.get("is_active") == "1"
    execute("UPDATE books SET is_active = %s WHERE id = %s", (active, book_id))
    flash("Status do livro atualizado.", "ok")
    return redirect(url_for("admin_books"))


@app.get("/admin/emprestimos")
@admin_required
def admin_loans():
    loans = query_all(
        """
        SELECT l.*, m.name AS member_name, m.email AS member_email,
               b.title AS book_title, b.slug AS book_slug
        FROM loans l
        JOIN members m ON m.id = l.member_id
        JOIN books b ON b.id = l.book_id
        ORDER BY l.return_date IS NULL DESC, l.due_date
        """
    )
    members = query_all("SELECT id, name FROM members WHERE status = 'ativo' ORDER BY name")
    books = query_all(
        """
        SELECT b.id, b.title,
               b.copies - COALESCE((SELECT COUNT(*) FROM loans l WHERE l.book_id = b.id AND l.return_date IS NULL), 0) AS available
        FROM books b WHERE b.is_active = TRUE ORDER BY b.title
        """
    )
    for loan in loans:
        loan["state"] = loan_state(loan)
    return render_template(
        "admin/loans.html",
        loans=loans,
        members=members,
        books=books,
        default_due=date.today() + timedelta(days=LOAN_DAYS),
        max_renewals=MAX_RENEWALS,
    )


@app.post("/admin/emprestimos/novo")
@admin_required
def admin_loan_new():
    member_id = int(request.form.get("member_id", 0) or 0)
    book_id = int(request.form.get("book_id", 0) or 0)
    due = request.form.get("due_date") or (date.today() + timedelta(days=LOAN_DAYS)).isoformat()

    if member_id <= 0 or book_id <= 0:
        flash("Selecione usuário e livro.", "error")
    elif available_copies(book_id) <= 0:
        flash("Livro indisponível para empréstimo.", "error")
    else:
        execute(
            "INSERT INTO loans (member_id, book_id, due_date) VALUES (%s, %s, %s)",
            (member_id, book_id, due),
        )
        flash("Empréstimo registrado.", "ok")
    return redirect(url_for("admin_loans"))


@app.post("/admin/emprestimos/<int:loan_id>/devolver")
@admin_required
def admin_loan_return(loan_id: int):
    loan = query_one("SELECT * FROM loans WHERE id = %s", (loan_id,))
    if not loan or loan["return_date"]:
        return redirect(url_for("admin_loans"))

    today = date.today()
    days_late = max(0, (today - loan["due_date"]).days)
    fine = round(days_late * FINE_PER_DAY, 2)
    execute("UPDATE loans SET return_date = %s, fine = %s WHERE id = %s", (today, fine, loan_id))

    reservation = query_one(
        "SELECT id FROM reservations WHERE book_id = %s AND status = 'fila' ORDER BY created_at LIMIT 1",
        (loan["book_id"],),
    )
    if reservation:
        execute("UPDATE reservations SET status = 'disponivel' WHERE id = %s", (reservation["id"],))
        flash(f"Devolução registrada. Multa: R$ {fine:.2f}. Reserva do livro liberada.", "ok")
    else:
        flash(f"Devolução registrada. Multa: R$ {fine:.2f}.", "ok")
    return redirect(url_for("admin_loans"))


@app.post("/admin/emprestimos/<int:loan_id>/renovar")
@admin_required
def admin_loan_renew(loan_id: int):
    loan = query_one("SELECT * FROM loans WHERE id = %s AND return_date IS NULL", (loan_id,))
    if not loan:
        return redirect(url_for("admin_loans"))
    if loan["due_date"] < date.today():
        flash("Empréstimo atrasado não pode ser renovado.", "error")
    elif loan["renewals"] >= MAX_RENEWALS:
        flash("Limite de renovações atingido.", "error")
    else:
        execute(
            "UPDATE loans SET due_date = %s, renewals = renewals + 1 WHERE id = %s",
            (loan["due_date"] + timedelta(days=LOAN_DAYS), loan_id),
        )
        flash("Empréstimo renovado por mais 14 dias.", "ok")
    return redirect(url_for("admin_loans"))


@app.get("/admin/usuarios")
@admin_required
def admin_members():
    members = query_all("SELECT * FROM members ORDER BY status, name")
    return render_template("admin/members.html", members=members)


@app.post("/admin/usuarios/<int:member_id>/status")
@admin_required
def admin_member_status(member_id: int):
    status = request.form.get("status")
    if status not in {"ativo", "suspenso", "pendente"}:
        abort(400)
    execute("UPDATE members SET status = %s WHERE id = %s", (status, member_id))
    flash("Status do usuário atualizado.", "ok")
    return redirect(url_for("admin_members"))


@app.post("/admin/usuarios/redefinir-senha")
@admin_required
def admin_member_reset_password():
    member_id = int(request.form.get("member_id", 0) or 0)
    password = request.form.get("password", "")
    if member_id <= 0:
        flash("Selecione um usuário.", "error")
    elif len(password) < 6:
        flash("A senha deve ter pelo menos 6 caracteres.", "error")
    else:
        execute("UPDATE members SET password_hash = %s WHERE id = %s", (generate_password_hash(password), member_id))
        flash("Senha do usuário redefinida.", "ok")
    return redirect(url_for("admin_members"))


@app.get("/admin/atrasos")
@admin_required
def admin_overdue():
    loans = query_all(
        """
        SELECT l.*, m.name AS member_name, m.email AS member_email,
               b.title AS book_title, (CURRENT_DATE - l.due_date) AS days_late
        FROM loans l
        JOIN members m ON m.id = l.member_id
        JOIN books b ON b.id = l.book_id
        WHERE l.return_date IS NULL AND l.due_date < CURRENT_DATE
        ORDER BY l.due_date
        """
    )
    return render_template("admin/overdue.html", loans=loans, fine_per_day=FINE_PER_DAY)


@app.post("/admin/atrasos/<int:loan_id>/multa")
@admin_required
def admin_fine_apply(loan_id: int):
    loan = query_one("SELECT * FROM loans WHERE id = %s AND return_date IS NULL", (loan_id,))
    if loan:
        days = max(0, (date.today() - loan["due_date"]).days)
        execute("UPDATE loans SET fine = %s WHERE id = %s", (round(days * FINE_PER_DAY, 2), loan_id))
        flash("Multa aplicada.", "ok")
    return redirect(url_for("admin_overdue"))


@app.post("/admin/atrasos/<int:loan_id>/quitar")
@admin_required
def admin_fine_clear(loan_id: int):
    execute("UPDATE loans SET fine = 0 WHERE id = %s", (loan_id,))
    flash("Multa quitada.", "ok")
    return redirect(url_for("admin_overdue"))


@app.route("/admin/seguranca", methods=["GET", "POST"])
@admin_required
def admin_security():
    if request.method == "POST":
        current = request.form.get("current", "")
        new = request.form.get("new", "")
        confirm = request.form.get("confirm", "")
        admin = query_one("SELECT * FROM admins WHERE id = %s", (session["admin_id"],))
        if not check_password_hash(admin["password_hash"], current):
            flash("Senha atual incorreta.", "error")
        elif len(new) < 6:
            flash("A nova senha deve ter pelo menos 6 caracteres.", "error")
        elif new != confirm:
            flash("As senhas não conferem.", "error")
        else:
            execute("UPDATE admins SET password_hash = %s WHERE id = %s", (generate_password_hash(new), admin["id"]))
            flash("Senha alterada com sucesso.", "ok")
    return render_template("admin/security.html")


# ---------------------------------------------------------------------------
# USUÁRIO (leitor) — login, cadastro, catálogo, empréstimos, reservas, perfil
# ---------------------------------------------------------------------------

@app.get("/conta")
def member_home():
    if session.get("member_id"):
        return redirect(url_for("member_loans"))
    return redirect(url_for("member_login"))


@app.route("/conta/login", methods=["GET", "POST"])
def member_login():
    if request.method == "POST":
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        member = query_one("SELECT * FROM members WHERE email = %s", (email,))
        if not member or not check_password_hash(member["password_hash"], password):
            flash("E-mail ou senha inválidos.", "error")
        elif member["status"] != "ativo":
            flash("Sua conta está aguardando aprovação ou suspensa. Fale com a biblioteca.", "error")
        else:
            session["member_id"] = member["id"]
            session["member_name"] = member["name"]
            return redirect(url_for("member_loans"))
    return render_template("member/login.html")


@app.route("/conta/cadastro", methods=["GET", "POST"])
def member_register():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip().lower()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm", "")

        if len(name) < 2:
            flash("Informe seu nome.", "error")
        elif not EMAIL_RE.match(email):
            flash("Informe um e-mail válido.", "error")
        elif len(password) < 6:
            flash("A senha deve ter pelo menos 6 caracteres.", "error")
        elif password != confirm:
            flash("As senhas não conferem.", "error")
        elif query_one("SELECT id FROM members WHERE email = %s", (email,)):
            flash("Este e-mail já está cadastrado.", "error")
        else:
            execute(
                "INSERT INTO members (name, email, password_hash, status) VALUES (%s, %s, %s, 'pendente')",
                (name, email, generate_password_hash(password)),
            )
            flash("Cadastro enviado! Aguarde a aprovação da biblioteca para fazer login.", "ok")
            return redirect(url_for("member_login"))
    return render_template("member/register.html")


@app.get("/conta/logout")
def member_logout():
    session.pop("member_id", None)
    session.pop("member_name", None)
    return redirect(url_for("member_login"))


@app.get("/conta/catalogo")
@member_required
def member_catalog():
    books = query_all(
        """
        SELECT b.*, c.name AS category,
               b.copies - COALESCE((SELECT COUNT(*) FROM loans l WHERE l.book_id = b.id AND l.return_date IS NULL), 0) AS available
        FROM books b JOIN categories c ON c.id = b.category_id
        WHERE b.is_active = TRUE
        ORDER BY b.title
        """
    )
    reserved = {
        row["book_id"]
        for row in query_all(
            "SELECT book_id FROM reservations WHERE member_id = %s AND status != 'cancelada'",
            (session["member_id"],),
        )
    }
    return render_template("member/catalog.html", books=books, reserved=reserved)


@app.get("/conta/emprestimos")
@member_required
def member_loans():
    loans = query_all(
        """
        SELECT l.*, b.title, b.slug, b.author
        FROM loans l JOIN books b ON b.id = l.book_id
        WHERE l.member_id = %s AND l.return_date IS NULL
        ORDER BY l.due_date
        """,
        (session["member_id"],),
    )
    for loan in loans:
        loan["state"] = loan_state(loan)
    return render_template("member/loans.html", loans=loans, today=date.today(), max_renewals=MAX_RENEWALS)


@app.post("/conta/emprestimos/<int:loan_id>/renovar")
@member_required
def member_loan_renew(loan_id: int):
    loan = query_one(
        "SELECT * FROM loans WHERE id = %s AND member_id = %s AND return_date IS NULL",
        (loan_id, session["member_id"]),
    )
    if not loan:
        abort(404)
    if loan["due_date"] < date.today():
        flash("Empréstimo atrasado não pode ser renovado.", "error")
    elif loan["renewals"] >= MAX_RENEWALS:
        flash("Limite de renovações atingido.", "error")
    else:
        execute(
            "UPDATE loans SET due_date = %s, renewals = renewals + 1 WHERE id = %s",
            (loan["due_date"] + timedelta(days=LOAN_DAYS), loan_id),
        )
        flash("Empréstimo renovado por mais 14 dias.", "ok")
    return redirect(url_for("member_loans"))


@app.get("/conta/reservas")
@member_required
def member_reservations():
    reservations = query_all(
        """
        SELECT r.*, b.title, b.slug
        FROM reservations r JOIN books b ON b.id = r.book_id
        WHERE r.member_id = %s
        ORDER BY r.status, r.created_at DESC
        """,
        (session["member_id"],),
    )
    return render_template("member/reservations.html", reservations=reservations)


@app.post("/conta/reservas/novo")
@member_required
def member_reservation_new():
    book_id = int(request.form.get("book_id", 0) or 0)
    book = query_one("SELECT id FROM books WHERE id = %s AND is_active IS TRUE", (book_id,))
    if not book:
        abort(404)
    existing = query_one(
        "SELECT id FROM reservations WHERE member_id = %s AND book_id = %s AND status != 'cancelada'",
        (session["member_id"], book_id),
    )
    if existing:
        flash("Você já possui uma reserva ativa para este livro.", "error")
    else:
        execute(
            "INSERT INTO reservations (member_id, book_id, status) VALUES (%s, %s, 'fila')",
            (session["member_id"], book_id),
        )
        flash("Reserva registrada na fila de espera.", "ok")
    return redirect(url_for("member_catalog"))


@app.post("/conta/reservas/<int:reservation_id>/cancelar")
@member_required
def member_reservation_cancel(reservation_id: int):
    execute(
        "UPDATE reservations SET status = 'cancelada' WHERE id = %s AND member_id = %s",
        (reservation_id, session["member_id"]),
    )
    flash("Reserva cancelada.", "ok")
    return redirect(url_for("member_reservations"))


@app.get("/conta/historico")
@member_required
def member_history():
    loans = query_all(
        """
        SELECT l.*, b.title, b.slug
        FROM loans l JOIN books b ON b.id = l.book_id
        WHERE l.member_id = %s AND l.return_date IS NOT NULL
        ORDER BY l.return_date DESC
        """,
        (session["member_id"],),
    )
    return render_template("member/history.html", loans=loans)


@app.route("/conta/perfil", methods=["GET", "POST"])
@member_required
def member_profile():
    member = query_one("SELECT * FROM members WHERE id = %s", (session["member_id"],))
    if request.method == "POST":
        action = request.form.get("action")

        if action == "dados":
            name = request.form.get("name", "").strip()
            email = request.form.get("email", "").strip().lower()
            if len(name) < 2:
                flash("Informe seu nome.", "error")
            elif not EMAIL_RE.match(email):
                flash("Informe um e-mail válido.", "error")
            elif query_one("SELECT id FROM members WHERE email = %s AND id <> %s", (email, member["id"])):
                flash("Este e-mail já está em uso.", "error")
            else:
                execute("UPDATE members SET name = %s, email = %s WHERE id = %s", (name, email, member["id"]))
                session["member_name"] = name
                flash("Dados atualizados.", "ok")

        elif action == "senha":
            current = request.form.get("current", "")
            new = request.form.get("new", "")
            confirm = request.form.get("confirm", "")
            if not check_password_hash(member["password_hash"], current):
                flash("Senha atual incorreta.", "error")
            elif len(new) < 6:
                flash("A nova senha deve ter pelo menos 6 caracteres.", "error")
            elif new != confirm:
                flash("As senhas não conferem.", "error")
            else:
                execute("UPDATE members SET password_hash = %s WHERE id = %s", (generate_password_hash(new), member["id"]))
                flash("Senha alterada.", "ok")

        elif action == "notificacoes":
            notify = request.form.get("notify_due") == "1"
            execute("UPDATE members SET notify_due = %s WHERE id = %s", (notify, member["id"]))
            flash("Preferências atualizadas.", "ok")

    return render_template("member/profile.html", member=member)


# ---------------------------------------------------------------------------
# Erros
# ---------------------------------------------------------------------------

@app.errorhandler(404)
def not_found(error):
    if request.path.startswith("/api/") or request.path.startswith("/covers/"):
        return jsonify({"ok": False, "error": str(error.description)}), 404
    return render_template("404.html"), 404


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
