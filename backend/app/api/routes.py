"""API route definitions for Accora."""

from datetime import date
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.ai.provider import get_ai_provider
from app.analytics.engine import (
    compute_cash_flow_status,
    compute_health_score,
    compute_invoice_summary,
    compute_monthly_metrics,
    generate_cashflow_report,
    generate_expense_report,
    generate_forecast,
    generate_next_best_move,
    generate_notifications,
    generate_pnl_report,
)
from app.data.demo import (
    DEMO_BUSINESS,
    DEMO_SETTINGS,
    DEMO_USER,
    generate_demo_invoices,
    generate_demo_transactions,
)
from app.models.financial import (
    AIInsight,
    AppSettings,
    BusinessHealthScore,
    BusinessSummary,
    CashFlowReport,
    CashFlowStatus,
    ChatRequest,
    ChatResponse,
    ExpenseReport,
    FinancialMetrics,
    Forecast,
    InsightStatus,
    InsightStatusUpdate,
    Invoice,
    InvoiceCreate,
    InvoiceItem,
    InvoiceStatus,
    InvoiceSummary,
    InvoiceUpdate,
    Notification,
    PLReport,
    SmartAction,
    Transaction,
    TransactionCreate,
    TransactionStatus,
    TransactionType,
    TransactionUpdate,
    NextBestMove,
    WhatIfRequest,
    WhatIfResult,
)

router = APIRouter()

# In-memory store (demo mode). Will be replaced by a database layer.
_transactions: list[Transaction] | None = None
_metrics: list[FinancialMetrics] | None = None
_invoices: list[Invoice] | None = None
_notifications: list[Notification] | None = None
_settings: AppSettings | None = None
_insight_statuses: dict[str, InsightStatus] = {}  # insight_id -> status


def _get_transactions() -> list[Transaction]:
    global _transactions
    if _transactions is None:
        _transactions = generate_demo_transactions()
    return _transactions


def _get_metrics() -> list[FinancialMetrics]:
    global _metrics
    if _metrics is None:
        _metrics = compute_monthly_metrics(_get_transactions())
    return _metrics


def _get_invoices() -> list[Invoice]:
    global _invoices
    if _invoices is None:
        _invoices = generate_demo_invoices()
    return _invoices


def _get_settings() -> AppSettings:
    global _settings
    if _settings is None:
        _settings = DEMO_SETTINGS.model_copy(deep=True)
    return _settings


def _get_notifications() -> list[Notification]:
    global _notifications
    if _notifications is None:
        _notifications = generate_notifications(
            _get_metrics(), _get_invoices(), compute_cash_flow_status(_get_metrics())
        )
    return _notifications


def _recompute() -> list[FinancialMetrics]:
    """Force recompute metrics after transaction changes."""
    global _metrics, _notifications
    _metrics = compute_monthly_metrics(_get_transactions())
    _notifications = None  # force regeneration
    return _metrics


def _recompute_invoices() -> None:
    """Force recompute invoice-dependent data."""
    global _notifications
    _notifications = None


# ---------------------------------------------------------------------------
# Business & User
# ---------------------------------------------------------------------------

@router.get("/business")
async def get_business():
    return DEMO_BUSINESS


@router.get("/user")
async def get_user():
    return DEMO_USER


# ---------------------------------------------------------------------------
# Transactions — full CRUD
# ---------------------------------------------------------------------------

@router.get("/transactions", response_model=list[Transaction])
async def list_transactions(
    category: str | None = None,
    type: str | None = None,
    month: str | None = None,
    search: str | None = None,
    status: str | None = None,
):
    txns = list(_get_transactions())
    if category:
        txns = [t for t in txns if t.category.lower() == category.lower()]
    if type:
        txns = [t for t in txns if t.type.value == type]
    if month:
        txns = [t for t in txns if t.date.strftime("%Y-%m") == month]
    if search:
        q = search.lower()
        txns = [t for t in txns if q in t.description.lower() or q in t.category.lower()]
    if status:
        txns = [t for t in txns if t.status.value == status]
    return sorted(txns, key=lambda t: t.date, reverse=True)


@router.post("/transactions", response_model=Transaction)
async def create_transaction(body: TransactionCreate):
    txn = Transaction(
        id=uuid4(),
        business_id=DEMO_BUSINESS.id,
        date=body.date,
        description=body.description,
        category=body.category,
        type=body.type,
        amount=body.amount,
        status=body.status,
        notes=body.notes,
    )
    _get_transactions().append(txn)
    _recompute()
    return txn


@router.put("/transactions/{txn_id}", response_model=Transaction)
async def update_transaction(txn_id: str, body: TransactionUpdate):
    txns = _get_transactions()
    for i, t in enumerate(txns):
        if str(t.id) == txn_id:
            updates = body.model_dump(exclude_unset=True)
            updated = t.model_copy(update=updates)
            txns[i] = updated
            _recompute()
            return updated
    raise HTTPException(404, f"Transaction {txn_id} not found.")


@router.delete("/transactions/{txn_id}")
async def delete_transaction(txn_id: str):
    txns = _get_transactions()
    for i, t in enumerate(txns):
        if str(t.id) == txn_id:
            txns.pop(i)
            _recompute()
            return {"ok": True}
    raise HTTPException(404, f"Transaction {txn_id} not found.")


@router.get("/transactions/categories")
async def get_categories():
    txns = _get_transactions()
    income = sorted({t.category for t in txns if t.type == TransactionType.INCOME})
    expense = sorted({t.category for t in txns if t.type == TransactionType.EXPENSE})
    return {"income": income, "expense": expense}


# ---------------------------------------------------------------------------
# Financial Metrics
# ---------------------------------------------------------------------------

@router.get("/metrics", response_model=list[FinancialMetrics])
async def get_metrics(months: int | None = None):
    m = _get_metrics()
    if months and months > 0:
        m = m[-months:]
    return m


@router.get("/metrics/latest", response_model=FinancialMetrics)
async def get_latest_metrics():
    metrics = _get_metrics()
    if not metrics:
        raise HTTPException(404, "No financial data available.")
    return metrics[-1]


# ---------------------------------------------------------------------------
# Business Health
# ---------------------------------------------------------------------------

@router.get("/health", response_model=BusinessHealthScore)
async def get_health_score():
    return compute_health_score(_get_metrics())


# ---------------------------------------------------------------------------
# Cash Flow
# ---------------------------------------------------------------------------

@router.get("/cashflow", response_model=CashFlowStatus)
async def get_cashflow_status():
    return compute_cash_flow_status(_get_metrics())


# ---------------------------------------------------------------------------
# Forecast
# ---------------------------------------------------------------------------

@router.get("/forecast", response_model=list[Forecast])
async def get_forecast():
    return generate_forecast(_get_metrics())


# ---------------------------------------------------------------------------
# Smart Actions
# ---------------------------------------------------------------------------

@router.get("/actions", response_model=list[SmartAction])
async def get_smart_actions():
    """Derive prioritized actions from current financial state."""
    provider = get_ai_provider()
    insights = await provider.generate_insights(_get_metrics(), _get_transactions())
    metrics = _get_metrics()
    latest = metrics[-1] if metrics else None
    actions: list[SmartAction] = []
    priority = 1

    # Actions from insights
    for ins in insights:
        actions.append(SmartAction(
            priority=priority,
            title=ins.title,
            description=ins.explanation,
            impact=ins.recommendation,
            action_label="Review" if ins.type.value in ("risk", "anomaly") else "Explore",
            insight_type=ins.type,
        ))
        priority += 1

    # Outstanding payments
    if latest and latest.outstanding > 0:
        actions.append(SmartAction(
            priority=priority,
            title="Collect Outstanding Payments",
            description=f"PKR {latest.outstanding:,.0f} in payments is currently outstanding.",
            impact=f"Collecting would improve cash position by PKR {latest.outstanding:,.0f}.",
            action_label="Follow Up",
            insight_type="risk",
        ))
        priority += 1

    # Outstanding payments from invoices
    inv_summary = compute_invoice_summary(_get_invoices())
    if inv_summary.overdue_count > 0:
        actions.append(SmartAction(
            priority=priority,
            title="Collect Overdue Invoices",
            description=f"{inv_summary.overdue_count} overdue invoices totaling PKR {inv_summary.total_overdue:,.0f}.",
            impact=f"Collecting would improve cash position by PKR {inv_summary.total_overdue:,.0f}.",
            action_label="Follow Up",
            insight_type="risk",
        ))
        priority += 1

    return sorted(actions, key=lambda a: a.priority)


# ---------------------------------------------------------------------------
# Invoices — full CRUD
# ---------------------------------------------------------------------------

@router.get("/invoices", response_model=list[Invoice])
async def list_invoices(
    status: str | None = None,
    client: str | None = None,
    search: str | None = None,
):
    invs = list(_get_invoices())
    if status:
        invs = [i for i in invs if i.status.value == status]
    if client:
        q = client.lower()
        invs = [i for i in invs if q in i.client_name.lower()]
    if search:
        q = search.lower()
        invs = [i for i in invs if q in i.client_name.lower() or q in i.invoice_number.lower()]
    return sorted(invs, key=lambda i: i.issue_date, reverse=True)


@router.get("/invoices/summary", response_model=InvoiceSummary)
async def invoice_summary():
    return compute_invoice_summary(_get_invoices())


@router.post("/invoices", response_model=Invoice)
async def create_invoice(body: InvoiceCreate):
    # Auto-generate invoice number
    existing = _get_invoices()
    max_num = max((int(i.invoice_number.replace("INV-", "")) for i in existing if i.invoice_number.startswith("INV-")), default=1000)
    invoice_number = f"INV-{max_num + 1}"

    # Recalculate amounts
    subtotal = sum(it.amount for it in body.items)
    tax_amount = subtotal * body.tax_rate
    total = subtotal + tax_amount

    inv = Invoice(
        id=uuid4(),
        business_id=DEMO_BUSINESS.id,
        invoice_number=invoice_number,
        client_name=body.client_name,
        client_email=body.client_email,
        items=body.items,
        subtotal=round(subtotal, 2),
        tax_rate=body.tax_rate,
        tax_amount=round(tax_amount, 2),
        total=round(total, 2),
        status=body.status,
        issue_date=body.issue_date,
        due_date=body.due_date,
        notes=body.notes,
    )
    _get_invoices().append(inv)
    _recompute_invoices()
    return inv


@router.put("/invoices/{inv_id}", response_model=Invoice)
async def update_invoice(inv_id: str, body: InvoiceUpdate):
    invs = _get_invoices()
    for i, inv in enumerate(invs):
        if str(inv.id) == inv_id:
            updates = body.model_dump(exclude_unset=True)
            # Recalculate totals if items changed
            if "items" in updates and updates["items"] is not None:
                items = updates["items"]
                subtotal = sum(it.amount if hasattr(it, 'amount') else it.get('amount', 0) for it in items)
                tax_rate = updates.get("tax_rate", inv.tax_rate) or inv.tax_rate
                updates["subtotal"] = round(subtotal, 2)
                updates["tax_amount"] = round(subtotal * tax_rate, 2)
                updates["total"] = round(subtotal + subtotal * tax_rate, 2)
            updated = inv.model_copy(update=updates)
            invs[i] = updated
            _recompute_invoices()
            return updated
    raise HTTPException(404, f"Invoice {inv_id} not found.")


@router.delete("/invoices/{inv_id}")
async def delete_invoice(inv_id: str):
    invs = _get_invoices()
    for i, inv in enumerate(invs):
        if str(inv.id) == inv_id:
            invs.pop(i)
            _recompute_invoices()
            return {"ok": True}
    raise HTTPException(404, f"Invoice {inv_id} not found.")


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

@router.get("/notifications", response_model=list[Notification])
async def list_notifications(unread_only: bool = False):
    notifs = _get_notifications()
    if unread_only:
        notifs = [n for n in notifs if not n.read]
    return notifs


@router.put("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str):
    for n in _get_notifications():
        if str(n.id) == notif_id:
            n.read = True
            return {"ok": True}
    raise HTTPException(404, "Notification not found.")


@router.put("/notifications/read-all")
async def mark_all_notifications_read():
    for n in _get_notifications():
        n.read = True
    return {"ok": True}


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------

@router.get("/reports/pnl", response_model=PLReport)
async def report_pnl(months: int = 12):
    return generate_pnl_report(_get_metrics(), months)


@router.get("/reports/expenses", response_model=ExpenseReport)
async def report_expenses(months: int = 12):
    return generate_expense_report(_get_metrics(), months)


@router.get("/reports/cashflow", response_model=CashFlowReport)
async def report_cashflow(months: int = 12):
    return generate_cashflow_report(_get_metrics(), months)


@router.get("/reports/summary", response_model=BusinessSummary)
async def report_summary():
    provider = get_ai_provider()
    return await provider.generate_business_summary(_get_metrics(), _get_invoices())


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

@router.get("/settings", response_model=AppSettings)
async def get_settings():
    return _get_settings()


@router.put("/settings", response_model=AppSettings)
async def update_settings(body: AppSettings):
    global _settings
    _settings = body
    return _settings


# ---------------------------------------------------------------------------
# Insight Status Tracking
# ---------------------------------------------------------------------------

@router.put("/insights/{insight_id}/status")
async def update_insight_status(insight_id: str, body: InsightStatusUpdate):
    _insight_statuses[insight_id] = body.status
    return {"ok": True, "status": body.status.value}


@router.get("/insights/statuses")
async def get_insight_statuses():
    return {k: v.value for k, v in _insight_statuses.items()}


# ---------------------------------------------------------------------------
# Next Best Move
# ---------------------------------------------------------------------------

@router.get("/next-best-move", response_model=NextBestMove)
async def get_next_best_move():
    return generate_next_best_move(
        _get_metrics(),
        _get_invoices(),
        compute_cash_flow_status(_get_metrics()),
    )


# ---------------------------------------------------------------------------
# AI Copilot
# ---------------------------------------------------------------------------

@router.post("/ai/chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest):
    provider = get_ai_provider()
    context = _build_financial_context()
    return await provider.chat(request, context)


@router.get("/ai/insights", response_model=list[AIInsight])
async def ai_insights():
    provider = get_ai_provider()
    return await provider.generate_insights(_get_metrics(), _get_transactions())


# ---------------------------------------------------------------------------
# What-If
# ---------------------------------------------------------------------------

@router.post("/ai/what-if", response_model=WhatIfResult)
async def ai_what_if(request: WhatIfRequest):
    provider = get_ai_provider()
    return await provider.what_if_analysis(request, _get_metrics())


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_financial_context() -> str:
    """Build a text summary of the user's financial data for AI context."""
    metrics = _get_metrics()
    if not metrics:
        return "No financial data available."

    latest = metrics[-1]
    inv_summary = compute_invoice_summary(_get_invoices())
    lines = [
        f"Business: {DEMO_BUSINESS.name} ({DEMO_BUSINESS.industry})",
        f"Currency: {DEMO_BUSINESS.currency}",
        f"Latest period: {latest.period}",
        f"Revenue: {latest.revenue:,.0f}",
        f"Expenses: {latest.expenses:,.0f}",
        f"Profit: {latest.profit:,.0f}",
        f"Margin: {latest.margin * 100:.1f}%",
        f"Cash flow: {latest.cash_flow:,.0f}",
        f"Cash balance: {latest.cash_balance:,.0f}",
        f"Outstanding payments: {latest.outstanding:,.0f}",
        "",
        f"Invoices: {inv_summary.count} total, {inv_summary.overdue_count} overdue (PKR {inv_summary.total_overdue:,.0f}), {inv_summary.pending_count} pending (PKR {inv_summary.total_pending:,.0f})",
        "",
        "Expense breakdown (latest):",
    ]
    for cat, amt in sorted(latest.expense_breakdown.items(), key=lambda x: -x[1]):
        pct = (amt / latest.expenses * 100) if latest.expenses else 0
        lines.append(f"  {cat}: PKR {amt:,.0f} ({pct:.0f}%)")
    lines.append("")
    lines.append("Monthly trend (last 6 months):")
    for m in metrics[-6:]:
        lines.append(
            f"  {m.period}: Rev {m.revenue:,.0f} | Exp {m.expenses:,.0f} | "
            f"Profit {m.profit:,.0f} | Margin {m.margin * 100:.1f}%"
        )
    return "\n".join(lines)
