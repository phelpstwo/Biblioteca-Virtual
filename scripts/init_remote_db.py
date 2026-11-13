"""Aplica schema.sql e seed.sql no banco apontado por DATABASE_URL.

Uso (deploy na nuvem, ex.: Render preDeployCommand):
    DATABASE_URL=postgres://... python scripts/init_remote_db.py
"""

from __future__ import annotations

import os
import pathlib
import sys

import psycopg

url = os.getenv("DATABASE_URL")
if not url:
    sys.exit("DATABASE_URL não definida")

base = pathlib.Path(__file__).resolve().parent.parent
conn = psycopg.connect(url)
conn.autocommit = True
with conn.cursor() as cur:
    cur.execute((base / "schema.sql").read_text())
    cur.execute((base / "seed.sql").read_text())
conn.close()
print("schema + seed aplicados com sucesso")
