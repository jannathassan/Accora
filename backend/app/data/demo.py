"""Realistic demo data for a fictional small business.

Generates 12 months of believable transactions with intentional patterns:
- Steady revenue growth with seasonal dips
- Gradually increasing expenses (marketing spike in recent months)
- Cash-flow pressure in Q3
- An anomalously large transaction
"""

import random
from datetime import date
from uuid import uuid4

from app.models.financial import (
    Business,
    Invoice,
    InvoiceItem,
    InvoiceStatus,
    Transaction,
    TransactionStatus,
    TransactionType,
    User,
    AppSettings,
    BusinessSettings,
    UserPreferences,
    AIPreferences,
)

random.seed(42)  # reproducible demo data

DEMO_BUSINESS = Business(
    id=uuid4(),
    name="Bright Pixel Studios",
    industry="Digital Services",
    business_type="Private Agency",
    currency="PKR",
    monthly_revenue_range="PKR 1,000,000 – 2,000,000",
)

DEMO_USER = User(
    id=uuid4(),
    name="Ayesha Khan",
    email="ayesha@brightpixel.pk",
    business_id=DEMO_BUSINESS.id,
)

DEMO_SETTINGS = AppSettings(
    business=BusinessSettings(
        business_name="Bright Pixel Studios",
        industry="Digital Services",
        business_type="Private Agency",
        currency="PKR",
        monthly_revenue_range="PKR 1,000,000 \u2013 2,000,000",
        fiscal_year_start="January",
    ),
    preferences=UserPreferences(
        date_format="MMM DD, YYYY",
        default_view="dashboard",
        compact_mode=False,
    ),
    ai_preferences=AIPreferences(
        proactive_insights=True,
        forecast_horizon_months=3,
        risk_tolerance="moderate",
    ),
)

# Monthly revenue base with seasonal variation
_REVENUE_BASE = [
    1_250_000, 1_200_000, 1_350_000, 1_400_000,  # Jan–Apr
    1_380_000, 1_300_000, 1_450_000, 1_500_000,  # May–Aug
    1_480_000, 1_550_000, 1_600_000, 1_551_500,  # Sep–Dec
]

# Expense categories with monthly base amounts (PKR)
_EXPENSE_CATS = {
    "Salaries":       [320_000, 320_000, 320_000, 335_000, 335_000, 335_000, 350_000, 350_000, 350_000, 350_000, 350_000, 350_000],
    "Marketing":      [150_000, 155_000, 160_000, 165_000, 170_000, 175_000, 180_000, 185_000, 190_000, 195_000, 200_000, 229_400],
    "Operations":     [280_000, 285_000, 290_000, 300_000, 310_000, 320_000, 340_000, 360_000, 380_000, 390_000, 400_000, 420_000],
    "Software & Tools":[45_000,  45_000,  45_000,  48_000,  48_000,  48_000,  52_000,  52_000,  52_000,  55_000,  55_000,  58_000],
    "Utilities":      [25_000,  25_000,  24_000,  22_000,  22_000,  26_000,  30_000,  32_000,  30_000,  28_000,  25_000,  24_000],
    "Professional Services": [30_000, 30_000, 35_000, 30_000, 30_000, 40_000, 30_000, 30_000, 35_000, 30_000, 45_000, 30_000],
}

_INCOME_CATS = {
    "Client Projects":  0.55,   # 55% of monthly revenue
    "Retainer Contracts": 0.30, # 30%
    "Consulting":        0.10,  # 10%
    "Other Income":      0.05,  # 5%
}


def generate_demo_transactions() -> list[Transaction]:
    """Generate 12 months of realistic transactions for 2026."""
    txns: list[Transaction] = []
    year = 2026

    for month_idx in range(12):
        month = month_idx + 1
        days_in_month = 28 if month == 2 else 30 if month in (4, 6, 9, 11) else 31

        # --- Income transactions ---
        base_rev = _REVENUE_BASE[month_idx]
        for cat, share in _INCOME_CATS.items():
            amount = base_rev * share * random.uniform(0.92, 1.08)
            # Spread income across 2–4 transactions per category per month
            n_txns = random.randint(2, 4)
            for _ in range(n_txns):
                day = random.randint(1, days_in_month)
                txns.append(Transaction(
                    business_id=DEMO_BUSINESS.id,
                    date=date(year, month, day),
                    description=f"{cat} — {_income_desc(cat)}",
                    category=cat,
                    type=TransactionType.INCOME,
                    amount=round(amount / n_txns, 2),
                    status=TransactionStatus.COMPLETED,
                ))

        # --- Expense transactions ---
        for cat, monthly_amounts in _EXPENSE_CATS.items():
            base = monthly_amounts[month_idx]
            # Split into multiple transactions
            n_txns = random.randint(2, 5) if cat != "Salaries" else 2
            for i in range(n_txns):
                amount = base / n_txns * random.uniform(0.90, 1.10)
                day = random.randint(1, days_in_month)
                txns.append(Transaction(
                    business_id=DEMO_BUSINESS.id,
                    date=date(year, month, day),
                    description=f"{cat} — {_expense_desc(cat)}",
                    category=cat,
                    type=TransactionType.EXPENSE,
                    amount=round(amount, 2),
                    status=TransactionStatus.COMPLETED,
                ))

        # --- Anomaly: one unusually large expense in August ---
        if month == 8:
            txns.append(Transaction(
                business_id=DEMO_BUSINESS.id,
                date=date(year, 8, 14),
                description="Office Equipment — Annual hardware refresh (12 workstations)",
                category="Operations",
                type=TransactionType.EXPENSE,
                amount=285_000.00,
                status=TransactionStatus.COMPLETED,
                notes="One-time capital expenditure for new workstations.",
            ))

    # --- Outstanding payments (pending income) ---
    txns.append(Transaction(
        business_id=DEMO_BUSINESS.id,
        date=date(2026, 12, 5),
        description="Client Projects — Invoice #1247 NexGen Corp (pending)",
        category="Client Projects",
        type=TransactionType.INCOME,
        amount=85_000.00,
        status=TransactionStatus.PENDING,
        notes="Payment expected within 30 days.",
    ))
    txns.append(Transaction(
        business_id=DEMO_BUSINESS.id,
        date=date(2026, 12, 10),
        description="Consulting — Strategic advisory ZenithTech (pending)",
        category="Consulting",
        type=TransactionType.INCOME,
        amount=35_000.00,
        status=TransactionStatus.PENDING,
        notes="Awaiting client approval, expected this month.",
    ))

    return sorted(txns, key=lambda t: t.date)


def generate_demo_invoices() -> list[Invoice]:
    """Generate realistic demo invoices with various statuses."""
    biz_id = DEMO_BUSINESS.id
    invoices: list[Invoice] = []

    _invoice_data = [
        # (number, client, email, items, status, issue, due, paid)
        ("INV-1001", "NexGen Corp", "billing@nexgen.pk",
         [("Website Redesign", 1, 180_000), ("SEO Audit", 1, 45_000), ("Content Strategy", 1, 60_000)],
         InvoiceStatus.PAID, date(2026, 1, 15), date(2026, 2, 15), date(2026, 2, 10)),
        ("INV-1002", "Al-Faisal Group", "accounts@alfaisal.pk",
         [("Brand Identity Package", 1, 350_000), ("Social Media Kit", 1, 100_000)],
         InvoiceStatus.PAID, date(2026, 3, 20), date(2026, 4, 30), date(2026, 4, 25)),
        ("INV-1003", "Urban Media", "finance@urbanmedia.pk",
         [("Monthly Retainer \u2014 Jan\u2013Mar", 3, 58_333)],
         InvoiceStatus.PAID, date(2026, 1, 5), date(2026, 4, 5), date(2026, 4, 1)),
        ("INV-1004", "NexGen Corp", "billing@nexgen.pk",
         [("E-commerce Platform Phase 2", 1, 280_000), ("Payment Gateway Integration", 1, 100_000)],
         InvoiceStatus.PAID, date(2026, 5, 10), date(2026, 6, 30), date(2026, 6, 28)),
        ("INV-1005", "ClearView Analytics", "ap@clearview.pk",
         [("Dashboard UI/UX Design", 1, 65_000), ("Data Visualization Module", 1, 30_000)],
         InvoiceStatus.OVERDUE, date(2026, 6, 1), date(2026, 7, 15), None),
        ("INV-1006", "Horizon Labs", "billing@horizonlabs.pk",
         [("Mobile App Prototype", 1, 150_000), ("Usability Testing", 1, 60_000)],
         InvoiceStatus.OVERDUE, date(2026, 6, 15), date(2026, 8, 1), None),
        ("INV-1007", "Al-Faisal Group", "accounts@alfaisal.pk",
         [("Annual Report Design", 1, 85_000), ("Print Production", 1, 40_000)],
         InvoiceStatus.PAID, date(2026, 8, 1), date(2026, 9, 10), date(2026, 9, 8)),
        ("INV-1008", "Urban Media", "finance@urbanmedia.pk",
         [("Monthly Retainer \u2014 Jul\u2013Sep", 3, 58_333)],
         InvoiceStatus.PENDING, date(2026, 7, 5), date(2026, 10, 5), None),
        ("INV-1009", "ZenithTech", "finance@zenithtech.pk",
         [("API Documentation", 1, 45_000), ("Developer Portal", 1, 120_000), ("Training Sessions", 4, 15_000)],
         InvoiceStatus.PENDING, date(2026, 10, 1), date(2026, 11, 5), None),
        ("INV-1010", "NexGen Corp", "billing@nexgen.pk",
         [("CRM Customization", 1, 200_000), ("Data Migration", 1, 80_000)],
         InvoiceStatus.SENT, date(2026, 11, 15), date(2026, 12, 30), None),
    ]

    for num, client, email, items, status, issued, due, paid in _invoice_data:
        inv_items = [
            InvoiceItem(description=desc, quantity=qty, unit_price=price, amount=qty * price)
            for desc, qty, price in items
        ]
        subtotal = sum(it.amount for it in inv_items)
        tax_rate = 0.0
        tax_amount = subtotal * tax_rate
        total = subtotal + tax_amount

        invoices.append(Invoice(
            business_id=biz_id,
            invoice_number=num,
            client_name=client,
            client_email=email,
            items=inv_items,
            subtotal=round(subtotal, 2),
            tax_rate=tax_rate,
            tax_amount=round(tax_amount, 2),
            total=round(total, 2),
            status=status,
            issue_date=issued,
            due_date=due,
            paid_date=paid,
        ))

    return invoices


def _income_desc(cat: str) -> str:
    clients = ["NexGen Corp", "Al-Faisal Group", "Urban Media", "ZenithTech", "ClearView Analytics", "Horizon Labs"]
    descs = {
        "Client Projects": f"Project delivery for {random.choice(clients)}",
        "Retainer Contracts": f"Monthly retainer — {random.choice(clients)}",
        "Consulting": f"Strategic consulting session — {random.choice(clients)}",
        "Other Income": "Miscellaneous income",
    }
    return descs.get(cat, "")


def _expense_desc(cat: str) -> str:
    descs = {
        "Salaries": random.choice(["Team payroll", "Contractor payment", "Payroll processing"]),
        "Marketing": random.choice(["Google Ads campaign", "Social media ads", "Content production", "SEO tools subscription"]),
        "Operations": random.choice(["Cloud hosting", "Office supplies", "Vendor payment", "Software licenses"]),
        "Software & Tools": random.choice(["Figma subscription", "GitHub Enterprise", "Slack workspace", "AWS services"]),
        "Utilities": random.choice(["Electricity bill", "Internet service", "Water & maintenance"]),
        "Professional Services": random.choice(["Legal consultation", "Accounting services", "Tax advisory"]),
    }
    return descs.get(cat, "")
