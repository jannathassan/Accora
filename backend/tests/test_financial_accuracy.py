"""Tests for financial calculation accuracy, edge cases, and business logic."""

from datetime import date
from uuid import uuid4
import pytest

from app.analytics.engine import (
    compute_cash_flow_status,
    compute_health_score,
    compute_invoice_summary,
    compute_monthly_metrics,
    generate_cashflow_report,
    generate_expense_report,
    generate_forecast,
    generate_next_best_move,
    generate_pnl_report,
)
from app.models.financial import (
    Business,
    ForecastMetric,
    Invoice,
    InvoiceItem,
    InvoiceStatus,
    Transaction,
    TransactionStatus,
    TransactionType,
)


def _make_txn(amount: float, txn_type: TransactionType, txn_date: str, status: TransactionStatus = TransactionStatus.COMPLETED, category: str = "General") -> Transaction:
    return Transaction(
        id=uuid4(),
        business_id=uuid4(),
        date=date.fromisoformat(txn_date),
        description="Test transaction",
        category=category,
        type=txn_type,
        amount=amount,
        status=status,
    )


def test_standard_profit_and_margin_calculation():
    """Verify revenue, expenses, net profit, and profit margin matching standard accounting.
    Specifically tests the test case:
    Revenue = PKR 485,000, Expenses = PKR 362,000 -> Profit = PKR 123,000, Margin = ~25.36%
    """
    txns = [
        _make_txn(485_000.0, TransactionType.INCOME, "2026-01-10"),
        _make_txn(362_000.0, TransactionType.EXPENSE, "2026-01-15"),
    ]
    metrics = compute_monthly_metrics(txns)
    assert len(metrics) == 1
    m = metrics[0]

    assert m.revenue == 485_000.0
    assert m.expenses == 362_000.0
    assert m.profit == 123_000.0
    # margin = 123,000 / 485,000 = 0.253608... -> rounded to 4 decimals = 0.2536 (25.36%)
    assert m.margin == pytest.approx(0.2536, abs=0.0001)
    assert round(m.margin * 100, 2) == 25.36


def test_zero_revenue_margin_safeguard():
    """Verify margin calculation when revenue is zero (avoid ZeroDivisionError)."""
    txns = [
        _make_txn(10_000.0, TransactionType.EXPENSE, "2026-02-15"),
    ]
    metrics = compute_monthly_metrics(txns)
    assert len(metrics) == 1
    m = metrics[0]
    assert m.revenue == 0.0
    assert m.expenses == 10_000.0
    assert m.profit == -10_000.0
    assert m.margin == 0.0  # Safe fallback


def test_net_loss_scenario():
    """Verify calculations when expenses exceed revenue (negative profit/cash flow)."""
    txns = [
        _make_txn(50_000.0, TransactionType.INCOME, "2026-03-01"),
        _make_txn(80_000.0, TransactionType.EXPENSE, "2026-03-10"),
    ]
    metrics = compute_monthly_metrics(txns)
    m = metrics[0]
    assert m.profit == -30_000.0
    assert m.margin == pytest.approx(-0.6, abs=0.0001)  # -60% margin


def test_pending_transactions_excluded_from_realized_revenue():
    """Pending income should not inflate realized monthly revenue, but should be tracked in outstanding."""
    txns = [
        _make_txn(100_000.0, TransactionType.INCOME, "2026-04-05", status=TransactionStatus.COMPLETED),
        _make_txn(50_000.0, TransactionType.INCOME, "2026-04-20", status=TransactionStatus.PENDING),
        _make_txn(40_000.0, TransactionType.EXPENSE, "2026-04-10", status=TransactionStatus.COMPLETED),
    ]
    metrics = compute_monthly_metrics(txns)
    m = metrics[0]
    assert m.revenue == 100_000.0  # Only completed
    assert m.outstanding == 50_000.0  # Pending captured in outstanding


def test_health_score_bounds_and_components():
    """Verify health score stays bounded between 0 and 100 with all components populated."""
    txns = [
        _make_txn(300_000.0, TransactionType.INCOME, "2026-01-05"),
        _make_txn(200_000.0, TransactionType.EXPENSE, "2026-01-10"),
        _make_txn(350_000.0, TransactionType.INCOME, "2026-02-05"),
        _make_txn(220_000.0, TransactionType.EXPENSE, "2026-02-10"),
    ]
    metrics = compute_monthly_metrics(txns)
    hs = compute_health_score(metrics)

    assert 0 <= hs.overall <= 100
    assert 0 <= hs.revenue_performance <= 100
    assert 0 <= hs.profitability <= 100
    assert 0 <= hs.expense_control <= 100
    assert 0 <= hs.cash_flow_health <= 100
    assert 0 <= hs.growth_trend <= 100
    assert hs.label in ("Excellent", "Healthy", "Needs Attention", "At Risk")
    assert len(hs.explanation) > 0


def test_cash_flow_status_projection():
    """Verify 3-month cash flow trajectory calculation."""
    txns = [
        _make_txn(100_000.0, TransactionType.INCOME, "2026-01-01"),
        _make_txn(60_000.0, TransactionType.EXPENSE, "2026-01-10"),
        _make_txn(110_000.0, TransactionType.INCOME, "2026-02-01"),
        _make_txn(70_000.0, TransactionType.EXPENSE, "2026-02-10"),
    ]
    metrics = compute_monthly_metrics(txns)
    cf_status = compute_cash_flow_status(metrics, currency="USD")

    assert cf_status.status in ("healthy", "watch", "at_risk")
    assert cf_status.projected_balance_3mo > 0
    assert "USD" in cf_status.explanation or "cash flow" in cf_status.explanation.lower()


def test_invoice_summary_calculations():
    """Verify invoice summary metrics (invoiced, paid, pending, overdue counts and totals)."""
    biz_id = uuid4()
    item = InvoiceItem(description="Service", quantity=1, unit_price=1000.0, amount=1000.0)
    invoices = [
        Invoice(
            id=uuid4(), business_id=biz_id, invoice_number="INV-001", client_name="Client A",
            items=[item], subtotal=1000.0, tax_rate=10.0, tax_amount=100.0, total=1100.0,
            status=InvoiceStatus.PAID, issue_date=date(2026, 1, 1), due_date=date(2026, 1, 15),
            paid_date=date(2026, 1, 14),
        ),
        Invoice(
            id=uuid4(), business_id=biz_id, invoice_number="INV-002", client_name="Client B",
            items=[item], subtotal=2000.0, tax_rate=0.0, tax_amount=0.0, total=2000.0,
            status=InvoiceStatus.SENT, issue_date=date(2026, 1, 10), due_date=date(2026, 2, 10),
        ),
        Invoice(
            id=uuid4(), business_id=biz_id, invoice_number="INV-003", client_name="Client C",
            items=[item], subtotal=3000.0, tax_rate=5.0, tax_amount=150.0, total=3150.0,
            status=InvoiceStatus.OVERDUE, issue_date=date(2025, 12, 1), due_date=date(2025, 12, 31),
        ),
    ]

    summary = compute_invoice_summary(invoices)
    assert summary.count == 3
    assert summary.total_invoiced == 1100.0 + 2000.0 + 3150.0  # 6250.0
    assert summary.total_paid == 1100.0
    assert summary.total_pending == 2000.0
    assert summary.total_overdue == 3150.0
    assert summary.overdue_count == 1
    assert summary.pending_count == 1


def test_forecast_confidence_bands():
    """Verify linear forecast generates expected historical + future points with expanding confidence bands."""
    txns = [
        _make_txn(100_000.0, TransactionType.INCOME, f"2026-0{i+1}-01")
        for i in range(5)
    ]
    metrics = compute_monthly_metrics(txns)
    forecasts = generate_forecast(metrics)

    assert len(forecasts) == 4  # revenue, expenses, profit, cash_flow
    rev_fc = next(f for f in forecasts if f.metric == ForecastMetric.REVENUE)
    assert len(rev_fc.points) == 5 + 3  # 5 historical + 3 future
    future_points = [p for p in rev_fc.points if p.is_predicted]
    assert len(future_points) == 3
    # Check that confidence bands expand with future horizons
    assert future_points[0].confidence_low is not None
    assert future_points[1].confidence_low is not None
    assert future_points[2].confidence_low is not None
    band_1 = future_points[0].confidence_high - future_points[0].confidence_low
    band_3 = future_points[2].confidence_high - future_points[2].confidence_low
    assert band_3 > band_1  # Expanding uncertainty


def test_pnl_report_generation():
    """Verify P&L report gross profit, net profit, and margin matching totals."""
    txns = [
        _make_txn(200_000.0, TransactionType.INCOME, "2026-01-05"),
        _make_txn(120_000.0, TransactionType.EXPENSE, "2026-01-10", category="Payroll"),
        _make_txn(300_000.0, TransactionType.INCOME, "2026-02-05"),
        _make_txn(180_000.0, TransactionType.EXPENSE, "2026-02-10", category="Marketing"),
    ]
    metrics = compute_monthly_metrics(txns)
    pnl = generate_pnl_report(metrics, months=12)

    assert pnl.revenue == 500_000.0
    assert pnl.expenses == 300_000.0
    assert pnl.net_profit == 200_000.0
    assert pnl.margin == pytest.approx(0.40, abs=0.0001)
    assert "Payroll" in pnl.expense_breakdown
    assert "Marketing" in pnl.expense_breakdown
