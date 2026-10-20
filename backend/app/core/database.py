"""SQLite Database persistence and isolation layer for Accora.

Provides schema initialization, transaction isolation per business,
and persistence for users, sessions, transactions, and invoices.
"""

from __future__ import annotations

import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Generator
from uuid import UUID, uuid4

from app.core.config import settings
from app.core.security import calculate_expiry, generate_salt, hash_password
from app.models.financial import (
    AppSettings,
    Business,
    BusinessSettings,
    BusinessUpdate,
    Invoice,
    InvoiceItem,
    InvoiceStatus,
    Notification,
    NotificationSeverity,
    NotificationType,
    Transaction,
    TransactionCreate,
    TransactionStatus,
    TransactionType,
    User,
)

# Resolve default database file path inside backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_FILE = BACKEND_DIR / settings.database_path


def get_db_path(override_path: str | None = None) -> Path:
    raw_path = override_path if override_path is not None else settings.database_path
    p = Path(raw_path)
    if p.is_absolute():
        return p
    return BACKEND_DIR / p


@contextmanager
def get_db(db_path: str | None = None) -> Generator[sqlite3.Connection, None, None]:
    """Context manager for SQLite connections with foreign keys and row factory."""
    path = get_db_path(db_path)
    try:
        conn = sqlite3.connect(str(path))
    except (sqlite3.OperationalError, OSError) as e:
        raise RuntimeError(
            f"Unable to connect to database at '{path}': {e}. "
            f"Ensure the persistent disk is mounted and writable."
        ) from e

    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA foreign_keys = ON;")
        yield conn
        conn.commit()
    except (sqlite3.OperationalError, OSError) as e:
        conn.rollback()
        raise RuntimeError(
            f"Database operation failed on '{path}': {e}. "
            f"Ensure persistent disk storage is healthy and writable."
        ) from e
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(db_path: str | None = None, seed_demo: bool | None = None) -> None:
    """Initialize database tables, indexes, and seed demo account if enabled.

    Verifies that the configured database location is available and writable.
    Fails clearly with RuntimeError if the directory cannot be created or accessed,
    or if the SQLite database cannot be opened/written to.
    Never silently falls back to a temporary or local database.
    """
    path = get_db_path(db_path)

    # Ensure parent directory exists or can be created
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        raise RuntimeError(
            f"Database directory '{path.parent}' cannot be created or accessed: {e}. "
            f"Please verify persistent disk mount permissions and ACCORA_DATABASE_PATH configuration."
        ) from e

    with get_db(str(path)) as conn:
        conn.execute("PRAGMA journal_mode = WAL;")

        # Businesses table
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS businesses (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                industry TEXT DEFAULT '',
                business_type TEXT DEFAULT '',
                country TEXT DEFAULT 'US',
                currency TEXT DEFAULT 'USD',
                fiscal_year_start TEXT DEFAULT 'January',
                business_start_date TEXT DEFAULT '',
                employee_count INTEGER DEFAULT 1,
                opening_cash_balance REAL DEFAULT 0.0,
                avg_monthly_revenue REAL DEFAULT 0.0,
                monthly_fixed_expenses REAL DEFAULT 0.0,
                monthly_variable_expenses REAL DEFAULT 0.0,
                outstanding_ar REAL DEFAULT 0.0,
                outstanding_ap REAL DEFAULT 0.0,
                loan_balance REAL DEFAULT 0.0,
                monthly_loan_repayment REAL DEFAULT 0.0,
                expected_growth_rate REAL DEFAULT 0.0,
                financial_goals TEXT DEFAULT '',
                onboarding_completed INTEGER DEFAULT 0,
                monthly_revenue_range TEXT DEFAULT '',
                created_at TEXT NOT NULL
            );
            """
        )

        # Users table (stores hashed passwords, never plain-text)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                created_at TEXT NOT NULL
            );
            """
        )

        # Expiring sessions table
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL
            );
            """
        )

        # Transactions table (isolated per business)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                date TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                status TEXT NOT NULL,
                notes TEXT DEFAULT '',
                created_at TEXT NOT NULL
            );
            """
        )

        # Invoices table (isolated per business)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS invoices (
                id TEXT PRIMARY KEY,
                business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                invoice_number TEXT NOT NULL,
                client_name TEXT NOT NULL,
                client_email TEXT DEFAULT '',
                items TEXT NOT NULL DEFAULT '[]',
                subtotal REAL NOT NULL,
                tax_rate REAL NOT NULL DEFAULT 0.0,
                tax_amount REAL NOT NULL DEFAULT 0.0,
                total REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'draft',
                issue_date TEXT NOT NULL,
                due_date TEXT NOT NULL,
                paid_date TEXT,
                notes TEXT DEFAULT '',
                created_at TEXT NOT NULL
            );
            """
        )

        # Application settings table (isolated per business)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS settings (
                business_id TEXT PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
                data TEXT NOT NULL
            );
            """
        )

        # Notifications table (isolated per business)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT NOT NULL,
                severity TEXT NOT NULL,
                read INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );
            """
        )

        # Insight Status overrides table (isolated per business)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS insight_statuses (
                business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                insight_id TEXT NOT NULL,
                status TEXT NOT NULL,
                PRIMARY KEY (business_id, insight_id)
            );
            """
        )

        # Performance indexes
        conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_tx_business ON transactions(business_id);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_inv_business ON invoices(business_id);")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_notif_business ON notifications(business_id);")

        # Migrate any missing columns in businesses table
        _migrate_businesses_table(conn)

        # Seed Demo User & Business if enabled and not yet existing
        should_seed = settings.demo_mode if seed_demo is None else seed_demo
        if should_seed:
            _seed_demo_account(conn)


def _migrate_businesses_table(conn: sqlite3.Connection) -> None:
    """Safely adds any missing profile columns to existing businesses table."""
    cursor = conn.execute("PRAGMA table_info(businesses);")
    existing_cols = {row["name"] for row in cursor.fetchall()}

    col_defs = [
        ("country", "TEXT DEFAULT 'US'"),
        ("currency", "TEXT DEFAULT 'USD'"),
        ("fiscal_year_start", "TEXT DEFAULT 'January'"),
        ("business_start_date", "TEXT DEFAULT ''"),
        ("employee_count", "INTEGER DEFAULT 1"),
        ("opening_cash_balance", "REAL DEFAULT 0.0"),
        ("avg_monthly_revenue", "REAL DEFAULT 0.0"),
        ("monthly_fixed_expenses", "REAL DEFAULT 0.0"),
        ("monthly_variable_expenses", "REAL DEFAULT 0.0"),
        ("outstanding_ar", "REAL DEFAULT 0.0"),
        ("outstanding_ap", "REAL DEFAULT 0.0"),
        ("loan_balance", "REAL DEFAULT 0.0"),
        ("monthly_loan_repayment", "REAL DEFAULT 0.0"),
        ("expected_growth_rate", "REAL DEFAULT 0.0"),
        ("financial_goals", "TEXT DEFAULT ''"),
        ("onboarding_completed", "INTEGER DEFAULT 0"),
        ("monthly_revenue_range", "TEXT DEFAULT ''"),
    ]
    for col_name, col_spec in col_defs:
        if col_name not in existing_cols:
            conn.execute(f"ALTER TABLE businesses ADD COLUMN {col_name} {col_spec};")


def _seed_demo_account(conn: sqlite3.Connection) -> None:
    """Seeds the demo business (BrightPixel Studios) and user (Ayesha Khan) if not present."""
    from app.data.demo import (
        DEMO_BUSINESS,
        DEMO_SETTINGS,
        DEMO_USER,
        generate_demo_invoices,
        generate_demo_transactions,
    )

    demo_email = "ayesha@brightpixel.pk"
    cursor = conn.execute("SELECT id FROM users WHERE email = ?;", (demo_email,))
    existing = cursor.fetchone()
    if existing:
        return

    # Demo Business
    b_id = str(DEMO_BUSINESS.id)
    conn.execute(
        """
        INSERT OR IGNORE INTO businesses (id, name, industry, business_type, currency, monthly_revenue_range, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """,
        (
            b_id,
            DEMO_BUSINESS.name,
            DEMO_BUSINESS.industry,
            DEMO_BUSINESS.business_type,
            DEMO_BUSINESS.currency,
            DEMO_BUSINESS.monthly_revenue_range,
            datetime.now(timezone.utc).isoformat(),
        ),
    )

    # Demo User with hashed password
    u_id = str(DEMO_USER.id)
    salt = generate_salt()
    # Password for demo account: "AccoraDemo2026!"
    pw_hash = hash_password("AccoraDemo2026!", salt)
    conn.execute(
        """
        INSERT OR IGNORE INTO users (id, name, email, password_hash, salt, business_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """,
        (
            u_id,
            DEMO_USER.name,
            demo_email,
            pw_hash,
            salt,
            b_id,
            datetime.now(timezone.utc).isoformat(),
        ),
    )

    # Seed Demo Settings
    conn.execute(
        """
        INSERT OR REPLACE INTO settings (business_id, data)
        VALUES (?, ?);
        """,
        (b_id, DEMO_SETTINGS.model_dump_json()),
    )

    # Seed Demo Transactions
    demo_txns = generate_demo_transactions()
    for t in demo_txns:
        conn.execute(
            """
            INSERT OR IGNORE INTO transactions (id, business_id, date, description, category, type, amount, status, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                str(t.id),
                b_id,
                t.date.isoformat(),
                t.description,
                t.category,
                t.type.value,
                t.amount,
                t.status.value,
                t.notes,
                t.created_at.isoformat(),
            ),
        )

    # Seed Demo Invoices
    demo_invs = generate_demo_invoices()
    for inv in demo_invs:
        items_json = json.dumps([item.model_dump(mode="json") for item in inv.items])
        conn.execute(
            """
            INSERT OR IGNORE INTO invoices (id, business_id, invoice_number, client_name, client_email, items, subtotal, tax_rate, tax_amount, total, status, issue_date, due_date, paid_date, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                str(inv.id),
                b_id,
                inv.invoice_number,
                inv.client_name,
                inv.client_email,
                items_json,
                inv.subtotal,
                inv.tax_rate,
                inv.tax_amount,
                inv.total,
                inv.status.value,
                inv.issue_date.isoformat(),
                inv.due_date.isoformat(),
                inv.paid_date.isoformat() if inv.paid_date else None,
                inv.notes,
                inv.created_at.isoformat(),
            ),
        )

    # Demo welcome notification
    conn.execute(
        """
        INSERT OR IGNORE INTO notifications (id, business_id, title, message, type, severity, read, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            str(uuid4()),
            b_id,
            "Welcome to Accora Demo",
            "This demo workspace is pre-populated with 12 months of realistic transactions and billing records.",
            NotificationType.INSIGHT.value,
            NotificationSeverity.LOW.value,
            0,
            datetime.now(timezone.utc).isoformat(),
        ),
    )


# ---------------------------------------------------------------------------
# User & Auth Database Operations
# ---------------------------------------------------------------------------

def db_create_user(
    name: str,
    email: str,
    password_hash: str,
    salt: str,
    db_path: str | None = None,
) -> tuple[User, Business]:
    """Create a new user with their own completely isolated business workspace."""
    now = datetime.now(timezone.utc).isoformat()
    user_id = uuid4()
    business_id = uuid4()

    business = Business(
        id=business_id,
        name=f"{name.strip()}'s Business",
        industry="General",
        business_type="Small Business",
        currency="USD",
        monthly_revenue_range="",
        created_at=datetime.fromisoformat(now),
    )

    user = User(
        id=user_id,
        name=name.strip(),
        email=email.strip().lower(),
        business_id=business_id,
        created_at=datetime.fromisoformat(now),
    )

    default_settings = AppSettings(
        business=BusinessSettings(
            business_name=business.name,
            industry=business.industry,
            business_type=business.business_type,
            currency=business.currency,
        )
    )

    with get_db(db_path) as conn:
        conn.execute(
            """
            INSERT INTO businesses (
                id, name, industry, business_type, country, currency,
                fiscal_year_start, business_start_date, employee_count,
                opening_cash_balance, avg_monthly_revenue, monthly_fixed_expenses,
                monthly_variable_expenses, outstanding_ar, outstanding_ap,
                loan_balance, monthly_loan_repayment, expected_growth_rate,
                financial_goals, onboarding_completed, monthly_revenue_range, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                str(business.id),
                business.name,
                business.industry,
                business.business_type,
                business.country,
                business.currency,
                business.fiscal_year_start,
                business.business_start_date,
                business.employee_count,
                business.opening_cash_balance,
                business.avg_monthly_revenue,
                business.monthly_fixed_expenses,
                business.monthly_variable_expenses,
                business.outstanding_ar,
                business.outstanding_ap,
                business.loan_balance,
                business.monthly_loan_repayment,
                business.expected_growth_rate,
                business.financial_goals,
                1 if business.onboarding_completed else 0,
                business.monthly_revenue_range,
                now,
            ),
        )

        conn.execute(
            """
            INSERT INTO users (id, name, email, password_hash, salt, business_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """,
            (
                str(user.id),
                user.name,
                user.email,
                password_hash,
                salt,
                str(business.id),
                now,
            ),
        )

        # Save initial default settings
        conn.execute(
            "INSERT INTO settings (business_id, data) VALUES (?, ?);",
            (str(business.id), default_settings.model_dump_json()),
        )

        # Welcome notification
        conn.execute(
            """
            INSERT INTO notifications (id, business_id, title, message, type, severity, read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                str(uuid4()),
                str(business.id),
                "Welcome to Your Workspace",
                "Your private financial ledger is initialized. Add transactions or invoices to unlock forecasts and health diagnostics.",
                NotificationType.INSIGHT.value,
                NotificationSeverity.LOW.value,
                0,
                now,
            ),
        )

    return user, business


def db_get_user_by_email(email: str, db_path: str | None = None) -> sqlite3.Row | None:
    """Retrieve user record including password hash and salt by email."""
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT * FROM users WHERE email = ?;",
            (email.strip().lower(),),
        )
        return cursor.fetchone()


def db_get_user_by_id(user_id: str | UUID, db_path: str | None = None) -> User | None:
    """Retrieve User model by user ID."""
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT id, name, email, business_id, created_at FROM users WHERE id = ?;",
            (str(user_id),),
        )
        row = cursor.fetchone()
        if not row:
            return None
        return User(
            id=UUID(row["id"]),
            name=row["name"],
            email=row["email"],
            business_id=UUID(row["business_id"]),
            created_at=datetime.fromisoformat(row["created_at"]),
        )


def db_create_session(
    user_id: str | UUID,
    token: str,
    expires_at: str | None = None,
    db_path: str | None = None,
) -> str:
    """Store an active session token with expiration timestamp."""
    now = datetime.now(timezone.utc).isoformat()
    exp = expires_at or calculate_expiry()
    with get_db(db_path) as conn:
        conn.execute(
            """
            INSERT OR REPLACE INTO sessions (token, user_id, created_at, expires_at)
            VALUES (?, ?, ?, ?);
            """,
            (token, str(user_id), now, exp),
        )
    return exp


def db_get_session(token: str, db_path: str | None = None) -> sqlite3.Row | None:
    """Look up an active session by token."""
    with get_db(db_path) as conn:
        cursor = conn.execute("SELECT * FROM sessions WHERE token = ?;", (token,))
        return cursor.fetchone()


def db_delete_session(token: str, db_path: str | None = None) -> None:
    """Delete a session token on logout."""
    with get_db(db_path) as conn:
        conn.execute("DELETE FROM sessions WHERE token = ?;", (token,))


def db_get_business(business_id: str | UUID, db_path: str | None = None) -> Business | None:
    """Retrieve Business model by business ID."""
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT * FROM businesses WHERE id = ?;",
            (str(business_id),),
        )
        row = cursor.fetchone()
        if not row:
            return None
        keys = set(row.keys())
        return Business(
            id=UUID(row["id"]),
            name=row["name"],
            industry=row["industry"] or "" if "industry" in keys else "",
            business_type=row["business_type"] or "" if "business_type" in keys else "",
            country=row["country"] or "US" if "country" in keys else "US",
            currency=row["currency"] or "USD" if "currency" in keys else "USD",
            fiscal_year_start=row["fiscal_year_start"] or "January" if "fiscal_year_start" in keys else "January",
            business_start_date=row["business_start_date"] or "" if "business_start_date" in keys else "",
            employee_count=int(row["employee_count"]) if "employee_count" in keys and row["employee_count"] is not None else 1,
            opening_cash_balance=float(row["opening_cash_balance"]) if "opening_cash_balance" in keys and row["opening_cash_balance"] is not None else 0.0,
            avg_monthly_revenue=float(row["avg_monthly_revenue"]) if "avg_monthly_revenue" in keys and row["avg_monthly_revenue"] is not None else 0.0,
            monthly_fixed_expenses=float(row["monthly_fixed_expenses"]) if "monthly_fixed_expenses" in keys and row["monthly_fixed_expenses"] is not None else 0.0,
            monthly_variable_expenses=float(row["monthly_variable_expenses"]) if "monthly_variable_expenses" in keys and row["monthly_variable_expenses"] is not None else 0.0,
            outstanding_ar=float(row["outstanding_ar"]) if "outstanding_ar" in keys and row["outstanding_ar"] is not None else 0.0,
            outstanding_ap=float(row["outstanding_ap"]) if "outstanding_ap" in keys and row["outstanding_ap"] is not None else 0.0,
            loan_balance=float(row["loan_balance"]) if "loan_balance" in keys and row["loan_balance"] is not None else 0.0,
            monthly_loan_repayment=float(row["monthly_loan_repayment"]) if "monthly_loan_repayment" in keys and row["monthly_loan_repayment"] is not None else 0.0,
            expected_growth_rate=float(row["expected_growth_rate"]) if "expected_growth_rate" in keys and row["expected_growth_rate"] is not None else 0.0,
            financial_goals=row["financial_goals"] or "" if "financial_goals" in keys and row["financial_goals"] is not None else "",
            onboarding_completed=bool(row["onboarding_completed"]) if "onboarding_completed" in keys and row["onboarding_completed"] is not None else False,
            monthly_revenue_range=row["monthly_revenue_range"] or "" if "monthly_revenue_range" in keys and row["monthly_revenue_range"] is not None else "",
            created_at=datetime.fromisoformat(row["created_at"]),
        )


def db_update_business(
    business_id: str | UUID,
    update: BusinessUpdate,
    db_path: str | None = None,
) -> Business | None:
    """Updates fields on a business record persistently."""
    data = update.model_dump(exclude_unset=True)
    if not data:
        return db_get_business(business_id, db_path)

    set_clauses: list[str] = []
    params: list[object] = []

    for k, v in data.items():
        if k == "onboarding_completed":
            set_clauses.append(f"{k} = ?")
            params.append(1 if v else 0)
        else:
            set_clauses.append(f"{k} = ?")
            params.append(v)

    params.append(str(business_id))
    query = f"UPDATE businesses SET {', '.join(set_clauses)} WHERE id = ?;"

    with get_db(db_path) as conn:
        conn.execute(query, params)

        # Also keep settings in sync if business profile settings changed
        cursor = conn.execute("SELECT data FROM settings WHERE business_id = ?;", (str(business_id),))
        row = cursor.fetchone()
        if row:
            try:
                settings_dict = json.loads(row["data"])
                biz_sub = settings_dict.setdefault("business", {})
                for k, v in data.items():
                    if k == "name":
                        biz_sub["business_name"] = v
                    else:
                        biz_sub[k] = v
                conn.execute(
                    "UPDATE settings SET data = ? WHERE business_id = ?;",
                    (json.dumps(settings_dict), str(business_id)),
                )
            except Exception:
                pass

    return db_get_business(business_id, db_path)


# ---------------------------------------------------------------------------
# Transaction Operations (Isolated by business_id)
# ---------------------------------------------------------------------------

def db_get_transactions(
    business_id: str | UUID,
    category: str | None = None,
    txn_type: str | None = None,
    month: str | None = None,
    search: str | None = None,
    status: str | None = None,
    db_path: str | None = None,
) -> list[Transaction]:
    """Retrieve transactions filtered strictly by business_id."""
    query = "SELECT * FROM transactions WHERE business_id = ?"
    params: list[object] = [str(business_id)]

    if category:
        query += " AND category = ?"
        params.append(category)
    if txn_type:
        query += " AND type = ?"
        params.append(txn_type)
    if month:
        query += " AND date LIKE ?"
        params.append(f"{month}%")
    if status:
        query += " AND status = ?"
        params.append(status)
    if search:
        query += " AND (description LIKE ? OR notes LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term])

    query += " ORDER BY date DESC, created_at DESC;"

    with get_db(db_path) as conn:
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()
        txns: list[Transaction] = []
        for r in rows:
            txns.append(
                Transaction(
                    id=UUID(r["id"]),
                    business_id=UUID(r["business_id"]),
                    date=date.fromisoformat(r["date"]),
                    description=r["description"],
                    category=r["category"],
                    type=TransactionType(r["type"]),
                    amount=float(r["amount"]),
                    status=TransactionStatus(r["status"]),
                    notes=r["notes"] or "",
                    created_at=datetime.fromisoformat(r["created_at"]),
                )
            )
        return txns


def db_create_transaction(
    business_id: str | UUID,
    txn_date: date,
    description: str,
    category: str,
    txn_type: TransactionType,
    amount: float,
    status: TransactionStatus = TransactionStatus.COMPLETED,
    notes: str = "",
    db_path: str | None = None,
) -> Transaction:
    """Create a new transaction isolated to the user's business."""
    t_id = uuid4()
    now = datetime.now(timezone.utc).isoformat()
    with get_db(db_path) as conn:
        conn.execute(
            """
            INSERT INTO transactions (id, business_id, date, description, category, type, amount, status, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                str(t_id),
                str(business_id),
                txn_date.isoformat(),
                description.strip(),
                category.strip(),
                txn_type.value,
                amount,
                status.value,
                notes.strip(),
                now,
            ),
        )
    return Transaction(
        id=t_id,
        business_id=UUID(str(business_id)),
        date=txn_date,
        description=description.strip(),
        category=category.strip(),
        type=txn_type,
        amount=amount,
        status=status,
        notes=notes.strip(),
        created_at=datetime.fromisoformat(now),
    )


def db_create_transactions_batch(
    business_id: str | UUID,
    transactions: list[TransactionCreate],
    skip_duplicates: bool = True,
    db_path: str | None = None,
) -> tuple[list[Transaction], list[str]]:
    """Batch imports transactions with duplicate detection (matching date, description, type, amount)."""
    imported: list[Transaction] = []
    duplicates: list[str] = []
    now = datetime.now(timezone.utc).isoformat()

    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT date, description, type, amount FROM transactions WHERE business_id = ?;",
            (str(business_id),),
        )
        existing_signatures = {
            (
                row["date"],
                row["description"].strip().lower(),
                row["type"].lower(),
                round(float(row["amount"]), 2),
            )
            for row in cursor.fetchall()
        }

        for item in transactions:
            sig = (
                item.date.isoformat(),
                item.description.strip().lower(),
                item.type.value.lower(),
                round(float(item.amount), 2),
            )
            if sig in existing_signatures:
                duplicates.append(f"{item.date}: {item.description} ({item.type.value} {item.amount})")
                if skip_duplicates:
                    continue

            tx_id = str(uuid4())
            conn.execute(
                """
                INSERT INTO transactions (id, business_id, date, description, category, type, amount, status, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    tx_id,
                    str(business_id),
                    item.date.isoformat(),
                    item.description.strip(),
                    item.category.strip(),
                    item.type.value,
                    item.amount,
                    item.status.value,
                    item.notes.strip(),
                    now,
                ),
            )
            existing_signatures.add(sig)
            imported.append(
                Transaction(
                    id=UUID(tx_id),
                    business_id=UUID(str(business_id)),
                    date=item.date,
                    description=item.description.strip(),
                    category=item.category.strip(),
                    type=item.type,
                    amount=item.amount,
                    status=item.status,
                    notes=item.notes.strip(),
                    created_at=datetime.fromisoformat(now),
                )
            )

    return imported, duplicates


def db_update_transaction(
    business_id: str | UUID,
    txn_id: str | UUID,
    txn_date: date | None = None,
    description: str | None = None,
    category: str | None = None,
    txn_type: TransactionType | None = None,
    amount: float | None = None,
    status: TransactionStatus | None = None,
    notes: str | None = None,
    db_path: str | None = None,
) -> Transaction | None:
    """Update a transaction ensuring business ownership."""
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT * FROM transactions WHERE id = ? AND business_id = ?;",
            (str(txn_id), str(business_id)),
        )
        row = cursor.fetchone()
        if not row:
            return None

        new_date = txn_date.isoformat() if txn_date is not None else row["date"]
        new_desc = description.strip() if description is not None else row["description"]
        new_cat = category.strip() if category is not None else row["category"]
        new_type = txn_type.value if txn_type is not None else row["type"]
        new_amount = amount if amount is not None else float(row["amount"])
        new_status = status.value if status is not None else row["status"]
        new_notes = notes.strip() if notes is not None else row["notes"]

        conn.execute(
            """
            UPDATE transactions
            SET date = ?, description = ?, category = ?, type = ?, amount = ?, status = ?, notes = ?
            WHERE id = ? AND business_id = ?;
            """,
            (new_date, new_desc, new_cat, new_type, new_amount, new_status, new_notes, str(txn_id), str(business_id)),
        )

        return Transaction(
            id=UUID(row["id"]),
            business_id=UUID(row["business_id"]),
            date=date.fromisoformat(new_date),
            description=new_desc,
            category=new_cat,
            type=TransactionType(new_type),
            amount=new_amount,
            status=TransactionStatus(new_status),
            notes=new_notes or "",
            created_at=datetime.fromisoformat(row["created_at"]),
        )


def db_delete_transaction(
    business_id: str | UUID,
    txn_id: str | UUID,
    db_path: str | None = None,
) -> bool:
    """Delete a transaction ensuring business ownership."""
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "DELETE FROM transactions WHERE id = ? AND business_id = ?;",
            (str(txn_id), str(business_id)),
        )
        return cursor.rowcount > 0


# ---------------------------------------------------------------------------
# Invoice Operations (Isolated by business_id)
# ---------------------------------------------------------------------------

def db_get_invoices(business_id: str | UUID, db_path: str | None = None) -> list[Invoice]:
    """Retrieve invoices belonging strictly to the user's business."""
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT * FROM invoices WHERE business_id = ? ORDER BY issue_date DESC, created_at DESC;",
            (str(business_id),),
        )
        rows = cursor.fetchall()
        invs: list[Invoice] = []
        for r in rows:
            items_raw = json.loads(r["items"] or "[]")
            items = [InvoiceItem(**it) for it in items_raw]
            invs.append(
                Invoice(
                    id=UUID(r["id"]),
                    business_id=UUID(r["business_id"]),
                    invoice_number=r["invoice_number"],
                    client_name=r["client_name"],
                    client_email=r["client_email"] or "",
                    items=items,
                    subtotal=float(r["subtotal"]),
                    tax_rate=float(r["tax_rate"]),
                    tax_amount=float(r["tax_amount"]),
                    total=float(r["total"]),
                    status=InvoiceStatus(r["status"]),
                    issue_date=date.fromisoformat(r["issue_date"]),
                    due_date=date.fromisoformat(r["due_date"]),
                    paid_date=date.fromisoformat(r["paid_date"]) if r["paid_date"] else None,
                    notes=r["notes"] or "",
                    created_at=datetime.fromisoformat(r["created_at"]),
                )
            )
        return invs


def db_create_invoice(
    business_id: str | UUID,
    client_name: str,
    client_email: str,
    items: list[InvoiceItem],
    tax_rate: float,
    status: InvoiceStatus,
    issue_date: date,
    due_date: date,
    notes: str,
    db_path: str | None = None,
) -> Invoice:
    """Create a new invoice isolated to the user's business."""
    inv_id = uuid4()
    now = datetime.now(timezone.utc).isoformat()
    subtotal = sum(it.amount for it in items)
    tax_amount = round(subtotal * (tax_rate / 100.0), 2)
    total = round(subtotal + tax_amount, 2)

    # Generate sequential invoice number per business
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT COUNT(*) AS count FROM invoices WHERE business_id = ?;",
            (str(business_id),),
        )
        count = cursor.fetchone()["count"] + 1
        invoice_number = f"INV-{count:04d}"

        items_json = json.dumps([it.model_dump(mode="json") for it in items])

        conn.execute(
            """
            INSERT INTO invoices (id, business_id, invoice_number, client_name, client_email, items, subtotal, tax_rate, tax_amount, total, status, issue_date, due_date, paid_date, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                str(inv_id),
                str(business_id),
                invoice_number,
                client_name.strip(),
                client_email.strip(),
                items_json,
                subtotal,
                tax_rate,
                tax_amount,
                total,
                status.value,
                issue_date.isoformat(),
                due_date.isoformat(),
                None,
                notes.strip(),
                now,
            ),
        )

    return Invoice(
        id=inv_id,
        business_id=UUID(str(business_id)),
        invoice_number=invoice_number,
        client_name=client_name.strip(),
        client_email=client_email.strip(),
        items=items,
        subtotal=subtotal,
        tax_rate=tax_rate,
        tax_amount=tax_amount,
        total=total,
        status=status,
        issue_date=issue_date,
        due_date=due_date,
        notes=notes.strip(),
        created_at=datetime.fromisoformat(now),
    )


def db_update_invoice(
    business_id: str | UUID,
    invoice_id: str | UUID,
    client_name: str | None = None,
    client_email: str | None = None,
    items: list[InvoiceItem] | None = None,
    tax_rate: float | None = None,
    status: InvoiceStatus | None = None,
    issue_date: date | None = None,
    due_date: date | None = None,
    paid_date: date | None = None,
    notes: str | None = None,
    db_path: str | None = None,
) -> Invoice | None:
    """Update an invoice ensuring business ownership."""
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT * FROM invoices WHERE id = ? AND business_id = ?;",
            (str(invoice_id), str(business_id)),
        )
        row = cursor.fetchone()
        if not row:
            return None

        current_items = (
            items if items is not None else [InvoiceItem(**it) for it in json.loads(row["items"] or "[]")]
        )
        current_tax_rate = tax_rate if tax_rate is not None else float(row["tax_rate"])
        subtotal = sum(it.amount for it in current_items)
        tax_amount = round(subtotal * (current_tax_rate / 100.0), 2)
        total = round(subtotal + tax_amount, 2)

        new_name = client_name.strip() if client_name is not None else row["client_name"]
        new_email = client_email.strip() if client_email is not None else row["client_email"]
        new_status = status.value if status is not None else row["status"]
        new_issue = issue_date.isoformat() if issue_date is not None else row["issue_date"]
        new_due = due_date.isoformat() if due_date is not None else row["due_date"]
        new_paid = (
            paid_date.isoformat()
            if paid_date is not None
            else (row["paid_date"] if row["paid_date"] else None)
        )
        new_notes = notes.strip() if notes is not None else row["notes"]
        items_json = json.dumps([it.model_dump(mode="json") for it in current_items])

        conn.execute(
            """
            UPDATE invoices
            SET client_name = ?, client_email = ?, items = ?, subtotal = ?, tax_rate = ?, tax_amount = ?, total = ?, status = ?, issue_date = ?, due_date = ?, paid_date = ?, notes = ?
            WHERE id = ? AND business_id = ?;
            """,
            (
                new_name,
                new_email,
                items_json,
                subtotal,
                current_tax_rate,
                tax_amount,
                total,
                new_status,
                new_issue,
                new_due,
                new_paid,
                new_notes,
                str(invoice_id),
                str(business_id),
            ),
        )

        return Invoice(
            id=UUID(row["id"]),
            business_id=UUID(row["business_id"]),
            invoice_number=row["invoice_number"],
            client_name=new_name,
            client_email=new_email,
            items=current_items,
            subtotal=subtotal,
            tax_rate=current_tax_rate,
            tax_amount=tax_amount,
            total=total,
            status=InvoiceStatus(new_status),
            issue_date=date.fromisoformat(new_issue),
            due_date=date.fromisoformat(new_due),
            paid_date=date.fromisoformat(new_paid) if new_paid else None,
            notes=new_notes or "",
            created_at=datetime.fromisoformat(row["created_at"]),
        )


def db_delete_invoice(
    business_id: str | UUID,
    invoice_id: str | UUID,
    db_path: str | None = None,
) -> bool:
    """Delete an invoice ensuring business ownership."""
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "DELETE FROM invoices WHERE id = ? AND business_id = ?;",
            (str(invoice_id), str(business_id)),
        )
        return cursor.rowcount > 0


# ---------------------------------------------------------------------------
# Notifications Operations (Isolated by business_id)
# ---------------------------------------------------------------------------

def db_get_notifications(business_id: str | UUID, db_path: str | None = None) -> list[Notification]:
    """Retrieve notifications strictly for the user's business."""
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT * FROM notifications WHERE business_id = ? ORDER BY created_at DESC;",
            (str(business_id),),
        )
        rows = cursor.fetchall()
        return [
            Notification(
                id=UUID(r["id"]),
                title=r["title"],
                message=r["message"],
                type=NotificationType(r["type"]),
                severity=NotificationSeverity(r["severity"]),
                read=bool(r["read"]),
                created_at=datetime.fromisoformat(r["created_at"]),
            )
            for r in rows
        ]


def db_mark_notification_read(business_id: str | UUID, notif_id: str | UUID, db_path: str | None = None) -> bool:
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "UPDATE notifications SET read = 1 WHERE id = ? AND business_id = ?;",
            (str(notif_id), str(business_id)),
        )
        return cursor.rowcount > 0


def db_mark_all_notifications_read(business_id: str | UUID, db_path: str | None = None) -> int:
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "UPDATE notifications SET read = 1 WHERE business_id = ?;",
            (str(business_id),),
        )
        return cursor.rowcount


# ---------------------------------------------------------------------------
# Settings Operations (Isolated by business_id)
# ---------------------------------------------------------------------------

def db_get_settings(business_id: str | UUID, db_path: str | None = None) -> AppSettings:
    """Retrieve settings for a business, returning defaults if not found."""
    app_settings = AppSettings()
    with get_db(db_path) as conn:
        cursor = conn.execute("SELECT data FROM settings WHERE business_id = ?;", (str(business_id),))
        row = cursor.fetchone()
        if row and row["data"]:
            try:
                app_settings = AppSettings.model_validate_json(row["data"])
            except Exception:
                pass

    # Ensure business profile fields in settings match current businesses table
    biz = db_get_business(business_id, db_path=db_path)
    if biz:
        app_settings.business = BusinessSettings(
            business_name=biz.name,
            industry=biz.industry,
            business_type=biz.business_type,
            country=biz.country,
            currency=biz.currency,
            fiscal_year_start=biz.fiscal_year_start,
            business_start_date=biz.business_start_date,
            employee_count=biz.employee_count,
            opening_cash_balance=biz.opening_cash_balance,
            avg_monthly_revenue=biz.avg_monthly_revenue,
            monthly_fixed_expenses=biz.monthly_fixed_expenses,
            monthly_variable_expenses=biz.monthly_variable_expenses,
            outstanding_ar=biz.outstanding_ar,
            outstanding_ap=biz.outstanding_ap,
            loan_balance=biz.loan_balance,
            monthly_loan_repayment=biz.monthly_loan_repayment,
            expected_growth_rate=biz.expected_growth_rate,
            financial_goals=biz.financial_goals,
            monthly_revenue_range=biz.monthly_revenue_range,
        )
    return app_settings


def db_update_settings(
    business_id: str | UUID,
    app_settings: AppSettings,
    db_path: str | None = None,
) -> AppSettings:
    """Save updated settings for the user's business."""
    # Synchronize business profile fields to businesses table
    biz_up = BusinessUpdate(
        name=app_settings.business.business_name,
        industry=app_settings.business.industry,
        business_type=app_settings.business.business_type,
        country=app_settings.business.country,
        currency=app_settings.business.currency,
        fiscal_year_start=app_settings.business.fiscal_year_start,
        business_start_date=app_settings.business.business_start_date,
        employee_count=app_settings.business.employee_count,
        opening_cash_balance=app_settings.business.opening_cash_balance,
        avg_monthly_revenue=app_settings.business.avg_monthly_revenue,
        monthly_fixed_expenses=app_settings.business.monthly_fixed_expenses,
        monthly_variable_expenses=app_settings.business.monthly_variable_expenses,
        outstanding_ar=app_settings.business.outstanding_ar,
        outstanding_ap=app_settings.business.outstanding_ap,
        loan_balance=app_settings.business.loan_balance,
        monthly_loan_repayment=app_settings.business.monthly_loan_repayment,
        expected_growth_rate=app_settings.business.expected_growth_rate,
        financial_goals=app_settings.business.financial_goals,
        monthly_revenue_range=app_settings.business.monthly_revenue_range,
    )
    db_update_business(business_id, biz_up, db_path=db_path)

    with get_db(db_path) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO settings (business_id, data) VALUES (?, ?);",
            (str(business_id), app_settings.model_dump_json()),
        )
    return app_settings


# ---------------------------------------------------------------------------
# Insight Status Overrides (Isolated by business_id)
# ---------------------------------------------------------------------------

def db_get_insight_statuses(business_id: str | UUID, db_path: str | None = None) -> dict[str, str]:
    with get_db(db_path) as conn:
        cursor = conn.execute(
            "SELECT insight_id, status FROM insight_statuses WHERE business_id = ?;",
            (str(business_id),),
        )
        return {r["insight_id"]: r["status"] for r in cursor.fetchall()}


def db_set_insight_status(
    business_id: str | UUID,
    insight_id: str,
    status: str,
    db_path: str | None = None,
) -> None:
    with get_db(db_path) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO insight_statuses (business_id, insight_id, status) VALUES (?, ?, ?);",
            (str(business_id), insight_id, status),
        )
