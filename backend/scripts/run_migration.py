"""
FMS Database Migration Runner
=============================
Creates all Supabase tables + storage bucket.

Usage:
  python run_migration.py             # check status + create bucket
  python run_migration.py --execute   # execute SQL via direct DB connection
  python run_migration.py --sql       # print SQL for manual execution

Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in ai-service/.env
For --execute: also needs DATABASE_URL (the direct PostgreSQL connection string)
"""
import os
import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent.parent.parent / "ai-service" / ".env"
    load_dotenv(env_path)
except ImportError:
    pass

try:
    import httpx
except ImportError:
    httpx = None

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "")

SQL_FILE = Path(__file__).resolve().parent / "001_full_schema.sql"


def check_tables():
    if not httpx:
        print("  [SKIP] httpx not installed")
        return {}
    headers = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}"}
    results = {}
    for table in ["expenses", "investments", "transactions"]:
        try:
            r = httpx.get(
                f"{SUPABASE_URL}/rest/v1/{table}",
                headers=headers,
                params={"select": "*", "limit": "0"},
                timeout=10,
            )
            results[table] = r.status_code == 200
        except Exception:
            results[table] = False
    return results


def create_bucket():
    if not httpx:
        print("  [SKIP] httpx not installed")
        return
    headers = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}", "Content-Type": "application/json"}
    try:
        r = httpx.post(
            f"{SUPABASE_URL}/storage/v1/bucket",
            headers=headers,
            json={
                "id": "receipts",
                "name": "receipts",
                "public": True,
                "file_size_limit": 10485760,
                "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "application/pdf"],
            },
            timeout=10,
        )
        status = "ready" if r.status_code in (200, 201, 409) else f"status {r.status_code}"
        print(f"  receipts bucket: {status}")
    except Exception as e:
        print(f"  receipts bucket: ERROR {e}")


def execute_sql(sql: str):
    if not DATABASE_URL:
        print("\n  [ERROR] DATABASE_URL not set.")
        print("  Get it from: Supabase Dashboard > Settings > Database > Connection string > URI")
        print("  Add to ai-service/.env: DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-xxxx.pooler.supabase.com:6543/postgres")
        return False

    try:
        import psycopg2
    except ImportError:
        print("\n  [ERROR] psycopg2 not installed. Run: pip install psycopg2-binary")
        return False

    print(f"\n  Connecting to database...")
    try:
        conn = psycopg2.connect(DATABASE_URL, sslmode="require")
        conn.autocommit = True
        cur = conn.cursor()

        statements = [s.strip() for s in sql.split(";") if s.strip() and not s.strip().startswith("--")]
        total = len(statements)
        for i, stmt in enumerate(statements, 1):
            if not stmt or stmt.startswith("--"):
                continue
            try:
                cur.execute(stmt)
                print(f"  [{i}/{total}] OK")
            except Exception as e:
                msg = str(e).strip()
                if "already exists" in msg or "does not exist" in msg:
                    print(f"  [{i}/{total}] SKIP ({msg[:60]})")
                else:
                    print(f"  [{i}/{total}] WARN: {msg[:100]}")

        cur.close()
        conn.close()
        print("\n  Migration executed successfully!")
        return True
    except Exception as e:
        print(f"\n  [ERROR] Connection failed: {e}")
        return False


def main():
    print("=" * 60)
    print("  FMS Database Migration Runner")
    print("=" * 60)

    if not SUPABASE_URL or not SERVICE_KEY:
        print("\n  [ERROR] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
        sys.exit(1)

    print(f"\n  Project: {SUPABASE_URL}")
    sql = SQL_FILE.read_text(encoding="utf-8")

    if "--sql" in sys.argv:
        print(f"\n  SQL file: {SQL_FILE}")
        print("  Copy into Supabase SQL Editor and run.\n")
        print("-" * 60)
        print(sql)
        print("-" * 60)
        return

    if "--execute" in sys.argv:
        print(f"\n  SQL file: {SQL_FILE}")
        success = execute_sql(sql)
        if not success:
            print("\n  Falling back to manual instructions:")
            print("  1. Open https://supabase.com/dashboard")
            print("  2. SQL Editor > New query")
            print(f"  3. Paste: {SQL_FILE}")
            print("  4. Click Run")
        return

    # Default: check status
    print("\n--- Checking tables ---")
    results = check_tables()
    missing = []
    for t, exists in results.items():
        print(f"  {t}: {'EXISTS' if exists else 'MISSING'}")
        if not exists:
            missing.append(t)

    print("\n--- Storage ---")
    create_bucket()

    if missing:
        print(f"\n  {len(missing)} table(s) missing.")
        print("  To create them, run one of:")
        print("    python run_migration.py --execute   (needs DATABASE_URL in .env)")
        print("    python run_migration.py --sql        (copy SQL into Supabase dashboard)")
    else:
        print("\n  All tables exist.")


if __name__ == "__main__":
    main()
