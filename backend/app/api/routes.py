"""API route definitions for Accora — protected and isolated per business workspace."""

from datetime import date
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, status

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
from app.core.auth import get_current_user, get_optional_user
from app.core.config import settings
from app.core.database import (
    db_create_invoice,
    db_create_transaction,
    db_create_transactions_batch,
    db_delete_invoice,
    db_delete_transaction,
    db_get_business,
    db_get_insight_statuses,
    db_get_invoices,
    db_get_notifications,
    db_get_settings,
    db_get_transactions,
    db_get_user_by_email,
    db_mark_all_notifications_read,
    db_mark_notification_read,
    db_set_insight_status,
    db_update_business,
    db_update_invoice,
    db_update_settings,
    db_update_transaction,
)
from app.models.financial import (
    AIInsight,
    AppSettings,
    Business,
    BusinessHealthScore,
    BusinessSummary,
    BusinessUpdate,
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
    NextBestMove,
    Notification,
    PLReport,
    SmartAction,
    Transaction,
    TransactionBatchImportRequest,
    TransactionBatchImportResponse,
    TransactionCreate,
    TransactionStatus,
    TransactionType,
    TransactionUpdate,
    User,
    WhatIfRequest,
    WhatIfResult,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Business & User
# ---------------------------------------------------------------------------

@router.get("/business", response_model=Business)
async def get_business(current_user: User = Depends(get_current_user)):
    biz = db_get_business(current_user.business_id)
    if not biz:
        raise HTTPException(status_code=404, detail="Business profile not found.")
    return biz


@router.put("/business", response_model=Business)
async def update_business(
    body: BusinessUpdate,
    current_user: User = Depends(get_current_user),
):
    biz = db_update_business(current_user.business_id, body)
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found.")
    return biz


@router.get("/user", response_model=User)
async def get_user(current_user: User = Depends(get_current_user)):
    return current_user


# ---------------------------------------------------------------------------
# Transactions — isolated by business_id
# ---------------------------------------------------------------------------

@router.get("/transactions", response_model=list[Transaction])
async def list_transactions(
    category: str | None = None,
    type: str | None = None,
    month: str | None = None,
    search: str | None = None,
    status: str | None = None,
    current_user: User = Depends(get_current_user),
):
    return db_get_transactions(
        business_id=current_user.business_id,
        category=category,
        txn_type=type,
        month=month,
        search=search,
        status=status,
    )


@router.post("/transactions", response_model=Transaction, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    body: TransactionCreate,
    current_user: User = Depends(get_current_user),
):
    return db_create_transaction(
        business_id=current_user.business_id,
        txn_date=body.date,
        description=body.description,
        category=body.category,
        txn_type=body.type,
        amount=body.amount,
        status=body.status,
        notes=body.notes,
    )


@router.post("/transactions/batch", response_model=TransactionBatchImportResponse)
async def batch_import_transactions(
    body: TransactionBatchImportRequest,
    current_user: User = Depends(get_current_user),
):
    imported, duplicates = db_create_transactions_batch(
        business_id=current_user.business_id,
        transactions=body.transactions,
        skip_duplicates=body.skip_duplicates,
    )
    return TransactionBatchImportResponse(
        imported_count=len(imported),
        skipped_count=len(duplicates) if body.skip_duplicates else 0,
        total_count=len(body.transactions),
        duplicates=duplicates,
    )


@router.put("/transactions/{txn_id}", response_model=Transaction)
async def update_transaction(
    txn_id: str,
    body: TransactionUpdate,
    current_user: User = Depends(get_current_user),
):
    updated = db_update_transaction(
        business_id=current_user.business_id,
        txn_id=txn_id,
        txn_date=body.date,
        description=body.description,
        category=body.category,
        txn_type=body.type,
        amount=body.amount,
        status=body.status,
        notes=body.notes,
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Transaction {txn_id} not found.")
    return updated


@router.delete("/transactions/{txn_id}")
async def delete_transaction(
    txn_id: str,
    current_user: User = Depends(get_current_user),
):
    deleted = db_delete_transaction(business_id=current_user.business_id, txn_id=txn_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Transaction {txn_id} not found.")
    return {"ok": True}


@router.get("/transactions/categories")
async def get_categories(current_user: User = Depends(get_current_user)):
    txns = db_get_transactions(current_user.business_id)
    income = sorted({t.category for t in txns if t.type == TransactionType.INCOME})
    expense = sorted({t.category for t in txns if t.type == TransactionType.EXPENSE})
    if not income:
        income = ["Client Retainer", "Project Milestone", "Consulting", "Service Fee"]
    if not expense:
        expense = ["Payroll", "Cloud Infrastructure", "Marketing", "Software Subscriptions", "Office Rent"]
    return {"income": income, "expense": expense}


# ---------------------------------------------------------------------------
# Financial Metrics & Analytics
# ---------------------------------------------------------------------------

@router.get("/metrics", response_model=list[FinancialMetrics])
async def get_metrics(
    months: int | None = None,
    current_user: User = Depends(get_current_user),
):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    m = compute_monthly_metrics(txns, business=biz)
    if months and months > 0:
        m = m[-months:]
    return m


@router.get("/metrics/latest", response_model=FinancialMetrics)
async def get_latest_metrics(current_user: User = Depends(get_current_user)):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    if not metrics:
        return FinancialMetrics(
            period=date.today().strftime("%Y-%m"),
            revenue=0.0,
            expenses=0.0,
            profit=0.0,
            margin=0.0,
            cash_flow=0.0,
            cash_balance=biz.opening_cash_balance if biz else 0.0,
            outstanding=biz.outstanding_ar if biz else 0.0,
            revenue_change_pct=0.0,
            expenses_change_pct=0.0,
            profit_change_pct=0.0,
            expense_breakdown={},
        )
    return metrics[-1]


@router.get("/health", response_model=BusinessHealthScore)
async def get_health_score(current_user: User = Depends(get_current_user)):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    return compute_health_score(metrics)


@router.get("/cashflow", response_model=CashFlowStatus)
async def get_cashflow_status(current_user: User = Depends(get_current_user)):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    return compute_cash_flow_status(metrics, currency=biz.currency if biz else "USD")


@router.get("/forecast", response_model=list[Forecast])
async def get_forecast(current_user: User = Depends(get_current_user)):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    return generate_forecast(metrics)


# ---------------------------------------------------------------------------
# Smart Actions & Next Best Move
# ---------------------------------------------------------------------------

@router.get("/actions", response_model=list[SmartAction])
async def get_smart_actions(current_user: User = Depends(get_current_user)):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    invs = db_get_invoices(current_user.business_id)

    provider = get_ai_provider()
    insights = await provider.generate_insights(metrics, txns)
    latest = metrics[-1] if metrics else None
    actions: list[SmartAction] = []
    priority = 1

    for ins in insights:
        actions.append(
            SmartAction(
                priority=priority,
                title=ins.title,
                description=ins.explanation,
                impact=ins.recommendation,
                action_label="Review" if ins.type.value in ("risk", "anomaly") else "Explore",
                insight_type=ins.type,
            )
        )
        priority += 1

    if latest and latest.outstanding > 0:
        actions.append(
            SmartAction(
                priority=priority,
                title="Collect Outstanding Payments",
                description="Payments are currently outstanding.",
                impact=f"Collecting would improve cash position by {latest.outstanding:,.0f}.",
                action_label="Follow Up",
                insight_type="risk",
            )
        )
        priority += 1

    inv_summary = compute_invoice_summary(invs)
    if inv_summary.overdue_count > 0:
        actions.append(
            SmartAction(
                priority=priority,
                title="Collect Overdue Invoices",
                description=f"{inv_summary.overdue_count} overdue invoices totaling {inv_summary.total_overdue:,.0f}.",
                impact=f"Collecting would improve cash position by {inv_summary.total_overdue:,.0f}.",
                action_label="Follow Up",
                insight_type="risk",
            )
        )

    return sorted(actions, key=lambda a: a.priority)


@router.get("/next-best-move", response_model=NextBestMove)
async def get_next_best_move(current_user: User = Depends(get_current_user)):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    invs = db_get_invoices(current_user.business_id)
    cf_status = compute_cash_flow_status(metrics, currency=biz.currency if biz else "USD")
    return generate_next_best_move(metrics, invs, cf_status, currency=biz.currency if biz else "USD")


# ---------------------------------------------------------------------------
# Invoices — isolated by business_id
# ---------------------------------------------------------------------------

@router.get("/invoices", response_model=list[Invoice])
async def list_invoices(
    status: str | None = None,
    client: str | None = None,
    search: str | None = None,
    current_user: User = Depends(get_current_user),
):
    invs = db_get_invoices(current_user.business_id)
    if status:
        invs = [i for i in invs if i.status.value == status]
    if client:
        q = client.lower()
        invs = [i for i in invs if q in i.client_name.lower()]
    if search:
        q = search.lower()
        invs = [i for i in invs if q in i.client_name.lower() or q in i.invoice_number.lower()]
    return invs


@router.get("/invoices/summary", response_model=InvoiceSummary)
async def invoice_summary(current_user: User = Depends(get_current_user)):
    invs = db_get_invoices(current_user.business_id)
    return compute_invoice_summary(invs)


@router.post("/invoices", response_model=Invoice, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    body: InvoiceCreate,
    current_user: User = Depends(get_current_user),
):
    return db_create_invoice(
        business_id=current_user.business_id,
        client_name=body.client_name,
        client_email=body.client_email,
        items=body.items,
        tax_rate=body.tax_rate,
        status=body.status,
        issue_date=body.issue_date,
        due_date=body.due_date,
        notes=body.notes,
    )


@router.put("/invoices/{inv_id}", response_model=Invoice)
async def update_invoice(
    inv_id: str,
    body: InvoiceUpdate,
    current_user: User = Depends(get_current_user),
):
    updated = db_update_invoice(
        business_id=current_user.business_id,
        invoice_id=inv_id,
        client_name=body.client_name,
        client_email=body.client_email,
        items=body.items,
        tax_rate=body.tax_rate,
        status=body.status,
        issue_date=body.issue_date,
        due_date=body.due_date,
        paid_date=body.paid_date,
        notes=body.notes,
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"Invoice {inv_id} not found.")
    return updated


@router.delete("/invoices/{inv_id}")
async def delete_invoice(
    inv_id: str,
    current_user: User = Depends(get_current_user),
):
    deleted = db_delete_invoice(business_id=current_user.business_id, invoice_id=inv_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Invoice {inv_id} not found.")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

@router.get("/notifications", response_model=list[Notification])
async def list_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
):
    notifs = db_get_notifications(current_user.business_id)
    if unread_only:
        notifs = [n for n in notifs if not n.read]
    return notifs


@router.put("/notifications/{notif_id}/read")
async def mark_notification_read(
    notif_id: str,
    current_user: User = Depends(get_current_user),
):
    success = db_mark_notification_read(current_user.business_id, notif_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found.")
    return {"ok": True}


@router.put("/notifications/read-all")
async def mark_all_notifications_read(current_user: User = Depends(get_current_user)):
    db_mark_all_notifications_read(current_user.business_id)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------

@router.get("/reports/pnl", response_model=PLReport)
async def report_pnl(
    months: int = 12,
    current_user: User = Depends(get_current_user),
):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    return generate_pnl_report(metrics, months)


@router.get("/reports/expenses", response_model=ExpenseReport)
async def report_expenses(
    months: int = 12,
    current_user: User = Depends(get_current_user),
):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    return generate_expense_report(metrics, months)


@router.get("/reports/cashflow", response_model=CashFlowReport)
async def report_cashflow(
    months: int = 12,
    current_user: User = Depends(get_current_user),
):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    return generate_cashflow_report(metrics, months)


@router.get("/reports/summary", response_model=BusinessSummary)
async def report_summary(current_user: User = Depends(get_current_user)):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    invs = db_get_invoices(current_user.business_id)
    provider = get_ai_provider()
    return await provider.generate_business_summary(metrics, invs)


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

@router.get("/settings", response_model=AppSettings)
async def get_settings(current_user: User = Depends(get_current_user)):
    return db_get_settings(current_user.business_id)


@router.put("/settings", response_model=AppSettings)
async def update_settings(
    body: AppSettings,
    current_user: User = Depends(get_current_user),
):
    return db_update_settings(current_user.business_id, body)


# ---------------------------------------------------------------------------
# Insight Status Overrides
# ---------------------------------------------------------------------------

@router.put("/insights/{insight_id}/status")
async def update_insight_status(
    insight_id: str,
    body: InsightStatusUpdate,
    current_user: User = Depends(get_current_user),
):
    db_set_insight_status(current_user.business_id, insight_id, body.status.value)
    return {"ok": True, "status": body.status.value}


@router.get("/insights/statuses")
async def get_insight_statuses(current_user: User = Depends(get_current_user)):
    return db_get_insight_statuses(current_user.business_id)


# ---------------------------------------------------------------------------
# AI Copilot & What-If
# ---------------------------------------------------------------------------

@router.get("/ai/status")
async def ai_status():
    """Return the active AI provider status and model configuration."""
    provider = get_ai_provider()
    is_gemini = type(provider).__name__ == "GeminiAIProvider"
    provider_name = "gemini" if is_gemini else ("alibaba" if settings.ai_provider == "alibaba" else "mock")
    return {
        "status": "online",
        "provider": provider_name,
        "model": settings.gemini_model_id if is_gemini else "rule-based",
        "configured": bool(settings.gemini_api_key),
    }


@router.post("/ai/chat", response_model=ChatResponse)
async def ai_chat(
    request: ChatRequest,
    current_user: User | None = Depends(get_optional_user),
):
    biz = None
    txns = []
    invs = []
    metrics = []

    if current_user:
        txns = db_get_transactions(current_user.business_id)
        biz = db_get_business(current_user.business_id)
        metrics = compute_monthly_metrics(txns, business=biz)
        invs = db_get_invoices(current_user.business_id)
    else:
        # Check if demo business exists in DB
        demo_user_row = db_get_user_by_email("ayesha@brightpixel.pk")
        if demo_user_row and demo_user_row["business_id"]:
            biz = db_get_business(demo_user_row["business_id"])
        if not biz:
            from app.data.demo import DEMO_BUSINESS_ID
            biz = db_get_business(DEMO_BUSINESS_ID)
        if biz:
            txns = db_get_transactions(biz.id)
            metrics = compute_monthly_metrics(txns, business=biz)
            invs = db_get_invoices(biz.id)

    provider = get_ai_provider()
    server_context = _build_financial_context(biz, metrics, invs, txns)

    if request.context and request.context.strip():
        full_context = f"{server_context}\n\nClient Session Context:\n{request.context.strip()}"
    else:
        full_context = server_context

    return await provider.chat(request, full_context)


@router.get("/ai/insights", response_model=list[AIInsight])
async def ai_insights(current_user: User = Depends(get_current_user)):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    provider = get_ai_provider()
    return await provider.generate_insights(metrics, txns)


@router.post("/ai/what-if", response_model=WhatIfResult)
async def ai_what_if(
    request: WhatIfRequest,
    current_user: User = Depends(get_current_user),
):
    txns = db_get_transactions(current_user.business_id)
    biz = db_get_business(current_user.business_id)
    metrics = compute_monthly_metrics(txns, business=biz)
    provider = get_ai_provider()
    return await provider.what_if_analysis(request, metrics)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _build_financial_context(
    business: Business | None,
    metrics: list[FinancialMetrics],
    invoices: list[Invoice],
    transactions: list[Transaction] | None = None,
) -> str:
    """Build dynamic context for AI copilot based strictly on the user's data."""
    biz_name = business.name if business else "Business"
    biz_ind = business.industry if business else "General"
    biz_curr = business.currency if business else "USD"

    lines = [
        f"Business: {biz_name} ({biz_ind})",
        f"Currency: {biz_curr}",
    ]
    if business:
        lines.extend([
            f"Business Type: {business.business_type}",
            f"Country: {business.country}",
            f"Employees: {business.employee_count}",
            f"Fiscal Year Start: {business.fiscal_year_start}",
            f"Opening Cash Balance: {biz_curr} {business.opening_cash_balance:,.0f}",
            f"Baseline Expected Monthly Revenue: {biz_curr} {business.avg_monthly_revenue:,.0f}",
            f"Monthly Fixed Expenses: {biz_curr} {business.monthly_fixed_expenses:,.0f}",
            f"Monthly Variable Expenses: {biz_curr} {business.monthly_variable_expenses:,.0f}",
            f"Outstanding AR: {biz_curr} {business.outstanding_ar:,.0f}",
            f"Outstanding AP: {biz_curr} {business.outstanding_ap:,.0f}",
            f"Loan Balance: {biz_curr} {business.loan_balance:,.0f}",
            f"Monthly Loan Repayment: {biz_curr} {business.monthly_loan_repayment:,.0f}",
            f"Expected Growth Rate: {business.expected_growth_rate}%",
            f"Financial Goals: {business.financial_goals or 'None specified'}",
        ])

    if not metrics:
        lines.append("Status: No transactions recorded yet. Calculations reflect onboarding baseline profile.")
    else:
        latest = metrics[-1]
        if latest.is_estimated:
            lines.append("Data Mode: ESTIMATED BASELINE from Business Profile Setup (no actual transaction records imported yet).")
        else:
            lines.append("Data Mode: ACTUAL HISTORICAL LEDGER based on recorded transactions.")

        inv_summary = compute_invoice_summary(invoices)
        lines.extend([
            f"Latest period: {latest.period}",
            f"Revenue: {biz_curr} {latest.revenue:,.0f}",
            f"Expenses: {biz_curr} {latest.expenses:,.0f}",
            f"Profit: {biz_curr} {latest.profit:,.0f}",
            f"Margin: {latest.margin * 100:.1f}%",
            f"Operating Cash Flow: {biz_curr} {latest.operating_cash_flow:,.0f}",
            f"Financing Cash Flow (Debt Service): {biz_curr} {latest.financing_cash_flow:,.0f}",
            f"Net Cash flow: {biz_curr} {latest.cash_flow:,.0f}",
            f"Cash balance: {biz_curr} {latest.cash_balance:,.0f}",
            f"Outstanding payments: {biz_curr} {latest.outstanding:,.0f}",
            "",
            f"Invoices: {inv_summary.count} total, {inv_summary.overdue_count} overdue ({biz_curr} {inv_summary.total_overdue:,.0f}), {inv_summary.pending_count} pending ({biz_curr} {inv_summary.total_pending:,.0f})",
            "",
            "Expense breakdown (latest):",
        ])
        for cat, amt in sorted(latest.expense_breakdown.items(), key=lambda x: -x[1]):
            pct = (amt / latest.expenses * 100) if latest.expenses else 0
            lines.append(f"  {cat}: {biz_curr} {amt:,.0f} ({pct:.0f}%)")
        lines.append("")
        lines.append("Monthly trend (last 6 months):")
        for m in metrics[-6:]:
            est_tag = " [ESTIMATED]" if m.is_estimated else ""
            lines.append(
                f"  {m.period}{est_tag}: Rev {biz_curr} {m.revenue:,.0f} | Exp {biz_curr} {m.expenses:,.0f} | "
                f"Profit {biz_curr} {m.profit:,.0f} | Margin {m.margin * 100:.1f}% | Cash {biz_curr} {m.cash_balance:,.0f}"
            )

    if invoices:
        unpaid = [inv for inv in invoices if inv.status != InvoiceStatus.PAID]
        if unpaid:
            lines.append("\nUnpaid / Actionable Invoices:")
            for inv in unpaid[:8]:
                c_name = getattr(inv, "client_name", getattr(inv, "client", "Client"))
                lines.append(f"  - {c_name}: {biz_curr} {inv.total:,.0f} (Status: {inv.status}, Due: {inv.due_date})")

    if transactions:
        lines.append("\nRecent Transaction History:")
        for t in transactions[-8:]:
            lines.append(f"  - {t.date}: {t.type.upper()} {biz_curr} {t.amount:,.0f} [{t.category}] {t.description}")

    return "\n".join(lines)
