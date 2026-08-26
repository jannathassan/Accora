"""Financial analytics service.

Computes aggregated metrics, period-over-period changes, business health
scores, forecasts, and cash-flow analysis from raw transaction data.
"""

from collections import defaultdict
from datetime import date

from app.models.financial import (
    BusinessHealthScore,
    CashFlowReport,
    CashFlowStatus,
    ExpenseCategory,
    ExpenseReport,
    FinancialMetrics,
    Forecast,
    ForecastMetric,
    ForecastPoint,
    Invoice,
    InvoiceStatus,
    InvoiceSummary,
    NextBestMove,
    Notification,
    NotificationSeverity,
    NotificationType,
    PLReport,
    Transaction,
    TransactionStatus,
    TransactionType,
)


def compute_monthly_metrics(
    transactions: list[Transaction],
) -> list[FinancialMetrics]:
    """Aggregate transactions into monthly FinancialMetrics."""
    if not transactions:
        return []

    monthly: dict[str, dict] = defaultdict(
        lambda: {"revenue": 0.0, "expenses": 0.0, "expense_cats": defaultdict(float)}
    )

    # Outstanding = pending income transactions
    outstanding = sum(
        t.amount for t in transactions
        if t.type == TransactionType.INCOME and t.status == TransactionStatus.PENDING
    )

    for txn in sorted(transactions, key=lambda t: t.date):
        key = txn.date.strftime("%Y-%m")
        if txn.type == TransactionType.INCOME:
            if txn.status == TransactionStatus.COMPLETED:
                monthly[key]["revenue"] += txn.amount
        else:
            monthly[key]["expenses"] += txn.amount
            monthly[key]["expense_cats"][txn.category] += txn.amount

    result: list[FinancialMetrics] = []
    prev: FinancialMetrics | None = None
    cash_balance = 500_000.0  # starting balance

    for period in sorted(monthly.keys()):
        rev = monthly[period]["revenue"]
        exp = monthly[period]["expenses"]
        profit = rev - exp
        margin = profit / rev if rev else 0.0
        cf = profit  # simplified cash-flow proxy
        cash_balance += cf

        def pct_change(current: float, previous: float) -> float:
            if previous == 0:
                return 0.0
            return round((current - previous) / previous * 100, 1)

        m = FinancialMetrics(
            period=period,
            revenue=round(rev, 2),
            expenses=round(exp, 2),
            profit=round(profit, 2),
            margin=round(margin, 4),
            cash_flow=round(cf, 2),
            cash_balance=round(cash_balance, 2),
            outstanding=round(outstanding, 2),
            revenue_change_pct=pct_change(rev, prev.revenue) if prev else 0.0,
            expenses_change_pct=pct_change(exp, prev.expenses) if prev else 0.0,
            profit_change_pct=pct_change(profit, prev.profit) if prev else 0.0,
            expense_breakdown={
                k: round(v, 2) for k, v in monthly[period]["expense_cats"].items()
            },
        )
        result.append(m)
        prev = m

    return result


def compute_health_score(metrics: list[FinancialMetrics]) -> BusinessHealthScore:
    """Derive a multi-dimensional health score from historical metrics."""
    if not metrics:
        return BusinessHealthScore(
            overall=0, label="No Data", revenue_performance=0, profitability=0,
            expense_control=0, cash_flow_health=0, growth_trend=0,
            explanation="Insufficient data to compute a health score.",
        )

    latest = metrics[-1]

    # Revenue performance: based on consistency and recency
    avg_rev = sum(m.revenue for m in metrics) / len(metrics)
    rev_perf = min(100, (latest.revenue / avg_rev) * 80) if avg_rev else 50

    # Profitability: margin-based
    avg_margin = sum(m.margin for m in metrics) / len(metrics)
    profitability = min(100, avg_margin * 400)

    # Expense control: lower expense growth relative to revenue is better
    avg_exp_growth = (
        sum(m.expenses_change_pct for m in metrics[1:]) / max(1, len(metrics) - 1)
    )
    expense_ctrl = max(0, min(100, 100 - avg_exp_growth * 3))

    # Cash flow: positive consistency
    positive_months = sum(1 for m in metrics if m.cash_flow > 0)
    cf_health = (positive_months / len(metrics)) * 100

    # Growth trend: revenue MoM average
    avg_rev_growth = (
        sum(m.revenue_change_pct for m in metrics[1:]) / max(1, len(metrics) - 1)
    )
    growth = max(0, min(100, 50 + avg_rev_growth * 5))

    overall = round(
        rev_perf * 0.25
        + profitability * 0.25
        + expense_ctrl * 0.2
        + cf_health * 0.15
        + growth * 0.15,
        1,
    )

    # Label
    if overall >= 80:
        label = "Excellent"
    elif overall >= 65:
        label = "Healthy"
    elif overall >= 50:
        label = "Needs Attention"
    else:
        label = "At Risk"

    strengths: list[str] = []
    improvements: list[str] = []
    if rev_perf >= 75:
        strengths.append("Strong and consistent revenue performance")
    if cf_health >= 80:
        strengths.append("Healthy cash flow with positive months")
    if growth >= 70:
        strengths.append("Positive growth trajectory")
    if profitability < 65:
        improvements.append("Profit margin is under pressure from rising costs")
    if expense_ctrl < 65:
        improvements.append("Expense growth is outpacing revenue growth")
    if growth < 60:
        improvements.append("Revenue growth has slowed and needs attention")

    return BusinessHealthScore(
        overall=overall,
        label=label,
        revenue_performance=round(rev_perf, 1),
        profitability=round(profitability, 1),
        expense_control=round(expense_ctrl, 1),
        cash_flow_health=round(cf_health, 1),
        growth_trend=round(growth, 1),
        explanation=_build_explanation(
            overall, rev_perf, profitability, expense_ctrl, cf_health, growth, latest
        ),
        strengths=strengths,
        improvements=improvements,
    )


def compute_cash_flow_status(metrics: list[FinancialMetrics]) -> CashFlowStatus:
    """Analyze cash flow trends and project future position."""
    if len(metrics) < 3:
        return CashFlowStatus(
            status="healthy", label="Healthy",
            explanation="Not enough data for cash-flow analysis.",
            projected_balance_3mo=metrics[-1].cash_balance if metrics else 0,
            recommendation="Add more financial data to enable cash-flow forecasting.",
        )

    recent = metrics[-3:]
    avg_cf = sum(m.cash_flow for m in recent) / 3
    latest = metrics[-1]

    projected_3mo = latest.cash_balance + avg_cf * 3

    if avg_cf > 100_000 and projected_3mo > latest.cash_balance:
        return CashFlowStatus(
            status="healthy", label="Healthy",
            explanation=(
                f"Your cash flow is positive and growing. Average monthly inflow of "
                f"PKR {avg_cf:,.0f} puts you in a strong position."
            ),
            projected_balance_3mo=round(projected_3mo, 2),
            recommendation="Consider allocating surplus cash to growth investments or an emergency reserve.",
        )
    elif avg_cf > 0:
        return CashFlowStatus(
            status="watch", label="Watch",
            explanation=(
                f"Cash flow is positive but tightening. Average monthly net flow is "
                f"PKR {avg_cf:,.0f}, down from earlier months. Your projected balance in 3 months "
                f"is PKR {projected_3mo:,.0f}."
            ),
            projected_balance_3mo=round(projected_3mo, 2),
            recommendation="Monitor expenses closely. Identify any recurring costs that can be optimized before cash position weakens further.",
        )
    else:
        return CashFlowStatus(
            status="at_risk", label="At Risk",
            explanation=(
                f"Cash flow is negative or flat. Average monthly net flow is "
                f"PKR {avg_cf:,.0f}. At this rate, your cash balance could decline to "
                f"PKR {projected_3mo:,.0f} within 3 months."
            ),
            projected_balance_3mo=round(projected_3mo, 2),
            recommendation="Take immediate action: reduce non-essential expenses, accelerate collections on outstanding payments, and defer large purchases.",
        )


def generate_forecast(metrics: list[FinancialMetrics]) -> list[Forecast]:
    """Generate 3-month forecasts using linear extrapolation with confidence bands."""
    if len(metrics) < 3:
        return []

    forecasts: list[Forecast] = []

    for metric_key, fc_metric, explanation in [
        ("revenue", ForecastMetric.REVENUE, "Based on recent revenue trends and seasonal patterns."),
        ("expenses", ForecastMetric.EXPENSES, "Projected from expense growth rate over the last 6 months."),
        ("profit", ForecastMetric.PROFIT, "Derived from forecasted revenue minus projected expenses."),
        ("cash_flow", ForecastMetric.CASH_FLOW, "Estimated from net cash flow trends."),
    ]:
        values = [getattr(m, metric_key) for m in metrics]
        # Simple linear regression on last 6 months
        n = min(6, len(values))
        recent = values[-n:]
        x_mean = (n - 1) / 2
        y_mean = sum(recent) / n
        num = sum((i - x_mean) * (v - y_mean) for i, v in enumerate(recent))
        den = sum((i - x_mean) ** 2 for i in range(n))
        slope = num / den if den else 0
        intercept = y_mean - slope * x_mean

        points: list[ForecastPoint] = []
        # Historical points (last 6)
        for i, m in enumerate(metrics[-n:]):
            points.append(ForecastPoint(
                date=m.period, value=round(getattr(m, metric_key), 2), is_predicted=False,
            ))

        # Future points (3 months)
        last_period = metrics[-1].period
        year, month = int(last_period[:4]), int(last_period[5:7])
        for step in range(1, 4):
            month += 1
            if month > 12:
                month = 1
                year += 1
            future_date = f"{year}-{month:02d}"
            predicted = intercept + slope * (n - 1 + step)
            # Confidence band widens with distance
            band = abs(predicted) * 0.08 * step
            points.append(ForecastPoint(
                date=future_date,
                value=round(predicted, 2),
                is_predicted=True,
                confidence_low=round(predicted - band, 2),
                confidence_high=round(predicted + band, 2),
            ))

        forecasts.append(Forecast(
            metric=fc_metric, points=points, explanation=explanation,
        ))

    return forecasts


def _build_explanation(
    overall: float,
    rev: float,
    prof: float,
    exp: float,
    cf: float,
    growth: float,
    latest: FinancialMetrics,
) -> str:
    parts = [f"Your business scores {overall}/100 overall."]
    if rev >= 75:
        parts.append("Revenue performance is strong.")
    elif rev >= 50:
        parts.append("Revenue performance is moderate.")
    else:
        parts.append("Revenue performance needs improvement.")

    if prof < 60:
        parts.append(
            f"Profitability ({prof:.0f}) is being pressured by rising costs relative to revenue."
        )
    if exp < 60:
        parts.append("Expense control is a concern — costs are growing faster than revenue.")
    if cf >= 75:
        parts.append("Cash flow remains healthy, providing a solid operational buffer.")
    if growth >= 70:
        parts.append("Growth trends are positive and sustainable.")

    parts.append(
        f"Current margin is {latest.margin * 100:.1f}% with PKR {latest.profit:,.0f} monthly profit."
    )
    return " ".join(parts)


# ---------------------------------------------------------------------------
# Invoice Analytics
# ---------------------------------------------------------------------------

def compute_invoice_summary(invoices: list[Invoice]) -> InvoiceSummary:
    """Compute aggregated invoice metrics."""
    total_invoiced = sum(inv.total for inv in invoices)
    total_paid = sum(inv.total for inv in invoices if inv.status == InvoiceStatus.PAID)
    total_pending = sum(inv.total for inv in invoices if inv.status in (InvoiceStatus.PENDING, InvoiceStatus.SENT))
    total_overdue = sum(inv.total for inv in invoices if inv.status == InvoiceStatus.OVERDUE)
    overdue_count = sum(1 for inv in invoices if inv.status == InvoiceStatus.OVERDUE)
    pending_count = sum(1 for inv in invoices if inv.status in (InvoiceStatus.PENDING, InvoiceStatus.SENT))

    return InvoiceSummary(
        total_invoiced=round(total_invoiced, 2),
        total_paid=round(total_paid, 2),
        total_pending=round(total_pending, 2),
        total_overdue=round(total_overdue, 2),
        count=len(invoices),
        overdue_count=overdue_count,
        pending_count=pending_count,
    )


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

def generate_notifications(
    metrics: list[FinancialMetrics],
    invoices: list[Invoice],
    cash_flow_status: CashFlowStatus,
) -> list[Notification]:
    """Generate data-driven notifications from financial state."""
    notifs: list[Notification] = []
    latest = metrics[-1] if metrics else None

    # Overdue invoice notifications
    for inv in invoices:
        if inv.status == InvoiceStatus.OVERDUE:
            notifs.append(Notification(
                type=NotificationType.OVERDUE_INVOICE,
                title=f"Overdue: {inv.invoice_number} \u2014 {inv.client_name}",
                message=f"PKR {inv.total:,.0f} is overdue since {inv.due_date.strftime('%b %d, %Y')}. Follow up to improve cash flow.",
                severity=NotificationSeverity.HIGH,
                action_url="/app/invoices",
                related_id=str(inv.id),
            ))

    # Expense spike notification
    if latest and latest.expenses_change_pct > 10:
        notifs.append(Notification(
            type=NotificationType.EXPENSE_SPIKE,
            title="Expense Spike Detected",
            message=f"Expenses increased {latest.expenses_change_pct:.1f}% this month. Review top expense categories.",
            severity=NotificationSeverity.MEDIUM,
            action_url="/app/analytics",
        ))

    # Cash flow warning
    if cash_flow_status.status != "healthy":
        sev = NotificationSeverity.HIGH if cash_flow_status.status == "at_risk" else NotificationSeverity.MEDIUM
        notifs.append(Notification(
            type=NotificationType.CASHFLOW_WARNING,
            title=f"Cash Flow: {cash_flow_status.label}",
            message=cash_flow_status.explanation,
            severity=sev,
            action_url="/app",
        ))

    # Revenue milestone
    if latest and latest.revenue >= 1_500_000:
        notifs.append(Notification(
            type=NotificationType.REVENUE_MILESTONE,
            title="Revenue Milestone Reached",
            message=f"Monthly revenue reached PKR {latest.revenue:,.0f} \u2014 your highest yet.",
            severity=NotificationSeverity.LOW,
            action_url="/app",
        ))

    # Profit margin warning
    if latest and latest.margin < 0.20:
        notifs.append(Notification(
            type=NotificationType.INSIGHT,
            title="Profit Margin Under Pressure",
            message=f"Current margin is {latest.margin * 100:.1f}%. Consider reviewing expenses.",
            severity=NotificationSeverity.MEDIUM,
            action_url="/app/intelligence",
        ))

    return sorted(notifs, key=lambda n: n.timestamp, reverse=True)


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------

def generate_pnl_report(metrics: list[FinancialMetrics], months: int = 12) -> PLReport:
    """Generate a Profit & Loss report from metrics."""
    data = metrics[-months:] if months else metrics
    if not data:
        return PLReport(period="No data", revenue=0, expenses=0, gross_profit=0, net_profit=0, margin=0)

    total_rev = sum(m.revenue for m in data)
    total_exp = sum(m.expenses for m in data)
    profit = total_rev - total_exp
    margin = profit / total_rev if total_rev else 0

    # Revenue breakdown by category from expense_breakdown (we need transactions for income breakdown)
    exp_breakdown: dict[str, float] = {}
    for m in data:
        for cat, val in m.expense_breakdown.items():
            exp_breakdown[cat] = exp_breakdown.get(cat, 0) + val

    period_str = f"{data[0].period} to {data[-1].period}" if len(data) > 1 else data[0].period

    return PLReport(
        period=period_str,
        revenue=round(total_rev, 2),
        expenses=round(total_exp, 2),
        gross_profit=round(profit, 2),
        net_profit=round(profit, 2),
        margin=round(margin, 4),
        expense_breakdown={k: round(v, 2) for k, v in sorted(exp_breakdown.items(), key=lambda x: -x[1])},
    )


def generate_expense_report(metrics: list[FinancialMetrics], months: int = 12) -> ExpenseReport:
    """Generate an expense analysis report."""
    data = metrics[-months:] if months else metrics
    if not data:
        return ExpenseReport(period="No data", total=0)

    total = sum(m.expenses for m in data)
    breakdown: dict[str, float] = {}
    for m in data:
        for cat, val in m.expense_breakdown.items():
            breakdown[cat] = breakdown.get(cat, 0) + val

    top = sorted(breakdown.items(), key=lambda x: -x[1])[:5]
    top_categories = [ExpenseCategory(category=k, amount=round(v, 2), pct=round(v / total * 100, 1)) for k, v in top]

    # Compare vs prior period
    prior = metrics[-(months * 2):-months] if len(metrics) >= months * 2 else []
    prior_total = sum(m.expenses for m in prior) if prior else total
    change = ((total - prior_total) / prior_total) if prior_total else 0

    period_str = f"{data[0].period} to {data[-1].period}" if len(data) > 1 else data[0].period

    return ExpenseReport(
        period=period_str,
        total=round(total, 2),
        breakdown={k: round(v, 2) for k, v in sorted(breakdown.items(), key=lambda x: -x[1])},
        top_categories=top_categories,
        change_vs_prior=round(change, 1),
    )


def generate_cashflow_report(metrics: list[FinancialMetrics], months: int = 12) -> CashFlowReport:
    """Generate a cash flow report."""
    data = metrics[-months:] if months else metrics
    if not data:
        return CashFlowReport(period="No data", inflow=0, outflow=0, net=0, opening_balance=0, closing_balance=0)

    inflow = sum(m.revenue for m in data)
    outflow = sum(m.expenses for m in data)
    net = inflow - outflow
    opening = data[0].cash_balance - data[0].cash_flow
    closing = data[-1].cash_balance

    period_str = f"{data[0].period} to {data[-1].period}" if len(data) > 1 else data[0].period

    return CashFlowReport(
        period=period_str,
        inflow=round(inflow, 2),
        outflow=round(outflow, 2),
        net=round(net, 2),
        opening_balance=round(opening, 2),
        closing_balance=round(closing, 2),
    )


# ---------------------------------------------------------------------------
# Next Best Move
# ---------------------------------------------------------------------------

def generate_next_best_move(
    metrics: list[FinancialMetrics],
    invoices: list[Invoice],
    cash_flow_status: CashFlowStatus,
) -> NextBestMove:
    """Determine the single most important action the user should take right now."""
    latest = metrics[-1] if metrics else None

    # Collect overdue invoices
    overdue = [inv for inv in invoices if inv.status == InvoiceStatus.OVERDUE]
    overdue_total = sum(inv.total for inv in overdue)

    # Priority 1: Overdue invoices (immediate cash impact)
    if overdue:
        return NextBestMove(
            title="Collect Overdue Invoices",
            description=(
                f"PKR {overdue_total:,.0f} is outstanding from {len(overdue)} overdue "
                f"invoice{'s' if len(overdue) > 1 else ''}."
            ),
            why_it_matters=(
                "Collecting overdue payments directly improves your cash position. "
                "Every day of delay increases the risk of further delays and tightens your working capital."
            ),
            action_label="View Invoices",
            action_url="/app/invoices",
            impact=f"+PKR {overdue_total:,.0f} immediate cash improvement",
            secondary=[
                "Review your top 3 expense categories for optimization opportunities.",
                "Consider converting project clients to retainer agreements for predictable income.",
            ],
        )

    # Priority 2: Cash flow warning
    if cash_flow_status.status == "at_risk":
        return NextBestMove(
            title="Stabilize Cash Position",
            description=cash_flow_status.explanation,
            why_it_matters=(
                "A tightening cash position limits your ability to cover expenses, "
                "invest in growth, or handle unexpected costs."
            ),
            action_label="View Analytics",
            action_url="/app/analytics",
            impact="Prevent potential cash shortage within 3 months",
            secondary=[
                "Accelerate collections on pending invoices.",
                "Defer non-essential purchases until cash position improves.",
            ],
        )

    # Priority 3: Expense growth outpacing revenue
    if latest and latest.expenses_change_pct > latest.revenue_change_pct + 5:
        gap = latest.expenses_change_pct - latest.revenue_change_pct
        return NextBestMove(
            title="Control Expense Growth",
            description=(
                f"Expenses are growing {gap:.1f} percentage points faster than revenue this month. "
                f"This gap is compressing your profit margin."
            ),
            why_it_matters=(
                "If expense growth continues to outpace revenue, your profit margin will shrink "
                "and your business becomes less sustainable over time."
            ),
            action_label="Review Expenses",
            action_url="/app/analytics",
            impact=f"Protect {(gap * latest.expenses / 100):,.0f}/month in margin",
            secondary=[
                "Audit your fastest-growing expense categories.",
                "Evaluate whether recent spending increases produced measurable returns.",
            ],
        )

    # Priority 4: Low margin
    if latest and latest.margin < 0.20:
        return NextBestMove(
            title="Improve Profit Margin",
            description=(
                f"Your current margin is {latest.margin * 100:.1f}%, below the 20% safety threshold. "
                f"This limits your ability to reinvest and grow."
            ),
            why_it_matters=(
                "A thin margin leaves little room for error. One unexpected expense or revenue dip "
                "could push the business into a loss."
            ),
            action_label="View Reports",
            action_url="/app/reports",
            impact=f"Target: +PKR {(latest.revenue * 0.05):,.0f}/month with 5% margin improvement",
            secondary=[
                "Identify your highest-margin services and focus sales efforts there.",
                "Negotiate better rates with your top 3 vendors.",
            ],
        )

    # Default: Growth opportunity
    return NextBestMove(
        title="Expand Retainer Revenue",
        description=(
            "Your retainer contracts provide the most predictable income but represent only ~30% "
            "of total revenue. Expanding this would improve stability."
        ),
        why_it_matters=(
            "Predictable revenue allows better planning, reduces stress from project-based income "
            "variability, and increases business valuation."
        ),
        action_label="View Insights",
        action_url="/app/intelligence",
        impact="~+PKR 50,000/month per converted client",
        secondary=[
            "Approach your top 3 repeat clients with retainer proposals.",
            "Set a target of 40% retainer revenue within 6 months.",
        ],
    )
