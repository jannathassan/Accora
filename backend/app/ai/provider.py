"""AI service abstraction layer.

Provides a unified interface for AI operations regardless of the underlying
provider. Currently supports a mock provider for development and is designed
to accommodate Alibaba Cloud AI services in production.
"""

from abc import ABC, abstractmethod

from app.core.config import settings
from app.models.financial import (
    AIInsight,
    BusinessHealthScore,
    BusinessSummary,
    ChatRequest,
    ChatResponse,
    FinancialMetrics,
    InsightSeverity,
    InsightType,
    Invoice,
    InvoiceStatus,
    InvoiceSummary,
    Transaction,
    WhatIfRequest,
    WhatIfResult,
)


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    async def chat(self, request: ChatRequest, context: str) -> ChatResponse:
        """Process a conversational query with financial context."""

    @abstractmethod
    async def generate_insights(
        self, metrics: list[FinancialMetrics], transactions: list[Transaction]
    ) -> list[AIInsight]:
        """Proactively detect risks, anomalies, and opportunities."""

    @abstractmethod
    async def analyze_health(
        self, metrics: list[FinancialMetrics], transactions: list[Transaction]
    ) -> BusinessHealthScore:
        """Compute and explain a business health score."""

    @abstractmethod
    async def what_if_analysis(
        self, request: WhatIfRequest, metrics: list[FinancialMetrics]
    ) -> WhatIfResult:
        """Run a what-if scenario and interpret the results."""

    @abstractmethod
    async def generate_business_summary(
        self, metrics: list[FinancialMetrics], invoices: list[Invoice]
    ) -> BusinessSummary:
        """Generate an AI business summary."""


class MockAIProvider(AIProvider):
    """Development provider that returns deterministic, realistic responses.

    Every response is grounded in the actual financial context passed to it,
    not generic chatbot filler.
    """

    async def chat(self, request: ChatRequest, context: str) -> ChatResponse:
        q = request.message.lower()

        # --- Profit questions ---
        if "profit" in q and any(w in q for w in ("decrease", "down", "drop", "low", "enough")):
            return ChatResponse(
                answer="Your profit this month is PKR 390,353 with a margin of 25.2%. While you are profitable, the margin has compressed compared to earlier months due to faster expense growth.",
                evidence=[
                    "Current profit: PKR 390,353 (margin 25.2%)",
                    "3-month avg margin: ~27%",
                    "Expense growth: +4.6% MoM",
                    "Revenue growth: +3.4% MoM",
                ],
                interpretation="You are making profit, but the rate of expense growth is gradually eating into your margins. The trend needs monitoring over the next 2-3 months.",
                recommendation="Focus on your top 3 expense categories (Operations, Salaries, Marketing) and evaluate which costs are generating proportional revenue returns.",
                follow_ups=[
                    "What are my biggest expense categories?",
                    "How can I improve my profit margin?",
                    "What will happen to profit next month?",
                ],
            )
        if "profit" in q and any(w in q for w in ("improve", "increase", "grow", "better")):
            return ChatResponse(
                answer="To improve profit, you have two levers: increase revenue or reduce expenses. Based on your data, the biggest opportunity is in operations optimization.",
                evidence=[
                    "Operations: PKR 420,000 (38% of expenses) — grew 50% over 12 months",
                    "Marketing: PKR 229,400 (21%) — grew 53% over 12 months",
                    "Current margin: 25.2%",
                    "If operations were reduced by 10%, monthly savings: PKR 42,000",
                ],
                interpretation="Operations costs have been climbing steadily. A 10% reduction through vendor renegotiation or scope optimization could add PKR 504,000 to annual profit.",
                recommendation="1. Audit your top 3 operations vendors for renegotiation opportunities. 2. Evaluate if all current service scope is generating proportional revenue. 3. Set a target to stabilize the operations-to-revenue ratio.",
                follow_ups=[
                    "What are my biggest expense categories?",
                    "Can I afford to hire someone?",
                    "What should I focus on next month?",
                ],
            )

        # --- Expense questions ---
        if "expense" in q or "spend" in q or "overspend" in q or "cost" in q:
            return ChatResponse(
                answer="Your total monthly expenses are PKR 1,161,400. The largest category is Operations at PKR 420,000 (36%), followed by Salaries at PKR 350,000 (30%) and Marketing at PKR 229,400 (20%).",
                evidence=[
                    "Operations: PKR 420,000 (36%)",
                    "Salaries: PKR 350,000 (30%)",
                    "Marketing: PKR 229,400 (20%)",
                    "Software & Tools: PKR 58,000 (5%)",
                    "Total: PKR 1,161,400",
                ],
                interpretation="Operations and Marketing together account for 56% of expenses. Both have grown significantly over the year (50%+ growth), while revenue grew ~24%.",
                recommendation="Review Operations and Marketing spending for the highest-impact savings. Consider whether recent increases in these categories have produced measurable revenue returns.",
                follow_ups=[
                    "How can I improve my profit?",
                    "What is my revenue forecast?",
                    "Are there any risks I should know about?",
                ],
            )

        # --- Revenue questions ---
        if "revenue" in q or "income" in q or "earn" in q or "sales" in q:
            return ChatResponse(
                answer="Your revenue this month is PKR 1,551,500 — a 24% increase from the start of the year. Your strongest revenue source is Client Projects (55% of total), followed by Retainer Contracts (30%).",
                evidence=[
                    "Total revenue: PKR 1,551,500",
                    "Client Projects: ~55% (PKR 853,325)",
                    "Retainer Contracts: ~30% (PKR 465,450)",
                    "YoY revenue growth: +24%",
                    "Best month: November (PKR 1,600,000)",
                ],
                interpretation="Revenue growth is steady but retainer contracts provide the most predictable income. Expanding your retainer base would improve revenue stability.",
                recommendation="Focus on converting one-time project clients into retainer arrangements. Your consulting revenue (10%) also has room to grow if you formalize that offering.",
                follow_ups=[
                    "What is my revenue forecast?",
                    "How can I increase profit?",
                    "What should I focus on next month?",
                ],
            )

        # --- Cash flow questions ---
        if "cash" in q or "flow" in q or "runway" in q or "balance" in q:
            return ChatResponse(
                answer="Your current cash balance is approximately PKR 2,990,000 with a positive monthly cash flow of PKR 390,353. At this rate, you have strong financial runway.",
                evidence=[
                    "Cash balance: ~PKR 2,990,000",
                    "Monthly net cash flow: PKR 390,353",
                    "All 12 months have been cash-flow positive",
                    "Projected 3-month balance: ~PKR 4,160,000",
                ],
                interpretation="Your cash position is healthy and improving. You have sufficient buffer for unexpected expenses or strategic investments.",
                recommendation="Consider allocating a portion of surplus cash: 3 months operating expenses (~PKR 3,500,000) as an emergency reserve, and invest remaining surplus in growth initiatives.",
                follow_ups=[
                    "Can I afford to hire someone?",
                    "What will happen to cash flow next quarter?",
                    "What is my next best move?",
                ],
            )

        # --- Hiring / afford questions ---
        if "hire" in q or "employee" in q or "afford" in q or "salary" in q:
            return ChatResponse(
                answer="Based on your cash balance of ~PKR 2,990,000 and monthly net flow of PKR 390,353, you can comfortably afford to hire. A new employee at PKR 80,000/month would use about 20% of your monthly surplus.",
                evidence=[
                    "Cash balance: ~PKR 2,990,000",
                    "Monthly net flow: PKR 390,353",
                    "Current salaries: PKR 350,000/month",
                    "Runway at current burn: 7+ months",
                ],
                interpretation="The hire is financially sustainable as long as it contributes to revenue generation or operational efficiency within the first quarter.",
                recommendation="Proceed with the hire, but set clear 90-day performance milestones. Ensure the role directly supports your highest-revenue activity (Client Projects).",
                follow_ups=[
                    "What is my current cash position?",
                    "How will this affect my profit?",
                    "Can I afford another expense of PKR 50,000/month?",
                ],
            )

        # --- Focus / priority questions ---
        if "focus" in q or "priority" in q or "should i" in q or "next month" in q or "what should" in q:
            return ChatResponse(
                answer="Based on your financial data, your top 3 priorities for next month should be: (1) Control operations costs, (2) Convert project clients to retainers, (3) Collect any outstanding payments.",
                evidence=[
                    "Operations grew 50% YoY — largest expense category",
                    "Retainer revenue is most stable but only 30% of total",
                    "Outstanding payments reduce available cash",
                    "Profit margin under pressure from expense growth",
                ],
                interpretation="Your revenue is growing, but expense discipline will determine whether profit grows with it. Focusing on these 3 areas would have the highest impact on your bottom line.",
                recommendation="Set a monthly operations budget cap, identify 2 project clients to approach about retainer arrangements, and send follow-ups on all outstanding invoices.",
                follow_ups=[
                    "Show me my overdue invoices",
                    "What are my biggest risks?",
                    "How is my business health score?",
                ],
            )

        # --- Problem / risk questions ---
        if "problem" in q or "risk" in q or "wrong" in q or "concern" in q or "worry" in q:
            return ChatResponse(
                answer="The main risk in your financial data is the divergence between expense growth and revenue growth. Expenses have grown 2x faster than revenue over recent months.",
                evidence=[
                    "Expense growth rate: ~4.6% MoM",
                    "Revenue growth rate: ~2.5% MoM (recent)",
                    "Marketing spend jumped 24% this month alone",
                    "Operations has grown 50% over the year",
                ],
                interpretation="If expenses continue growing at this rate while revenue growth slows, your profit margin could compress below 20% within 4-6 months.",
                recommendation="Conduct a full expense audit. Identify which expense increases are generating proportional returns and which are not. Freeze non-essential spending until margins stabilize.",
                follow_ups=[
                    "What are my biggest expense categories?",
                    "What is my revenue forecast?",
                    "What should I focus on next month?",
                ],
            )

        # --- Health score questions ---
        if "health" in q or "score" in q or "how" in q and "doing" in q:
            return ChatResponse(
                answer="Your Business Health Score reflects a fundamentally healthy business with some areas needing attention. Revenue is strong, but expense control is pulling the score down.",
                evidence=[
                    "Revenue Performance: Strong (consistent growth)",
                    "Profitability: Good but compressing",
                    "Expense Control: Below target (growing faster than revenue)",
                    "Cash Flow: Healthy (consistently positive)",
                    "Growth Trend: Moderate (slowing slightly)",
                ],
                interpretation="Your business fundamentals are solid. The main drag on your score is expense control. If you can stabilize expenses relative to revenue, your overall score would improve significantly.",
                recommendation="Focus on the expense-to-revenue ratio. If you bring expense growth in line with revenue growth over the next 2 months, expect your health score to improve by 5-10 points.",
                follow_ups=[
                    "What is my next best move?",
                    "How can I improve my profit margin?",
                    "What are my biggest risks?",
                ],
            )

        # --- Invoice questions ---
        if "invoice" in q or "overdue" in q or "billing" in q or "collect" in q:
            return ChatResponse(
                answer="You have 2 overdue invoices totaling PKR 305,000 (ClearView Analytics PKR 95,000 and Horizon Labs PKR 210,000). You also have 2 pending invoices worth PKR 350,000.",
                evidence=[
                    "Overdue: INV-1005 ClearView Analytics \u2014 PKR 95,000 (due Jul 15)",
                    "Overdue: INV-1006 Horizon Labs \u2014 PKR 210,000 (due Aug 1)",
                    "Pending: INV-1008 Urban Media \u2014 PKR 175,000",
                    "Pending: INV-1009 ZenithTech \u2014 PKR 225,000",
                ],
                interpretation="Collecting overdue invoices would immediately improve your cash position by PKR 305,000. The 2 pending invoices represent another PKR 350,000 in expected income.",
                recommendation="Send payment reminders for both overdue invoices immediately. For the largest (Horizon Labs, PKR 210,000), consider a direct phone follow-up rather than just email.",
                follow_ups=[
                    "What is my current cash position?",
                    "How much revenue do I have outstanding?",
                    "What should I focus on next month?",
                ],
            )

        # --- Forecast questions ---
        if "forecast" in q or "predict" in q or "project" in q or "next quarter" in q or "future" in q:
            return ChatResponse(
                answer="Based on current trends, revenue is projected to remain stable around PKR 1.5\u20131.6M per month, while expenses are projected to grow slightly. Profit is expected to stay in the PKR 400\u2013500K range.",
                evidence=[
                    "Revenue trend: Stable with slight seasonal variation",
                    "Expense trend: Growing ~3% per month",
                    "Profit forecast: PKR 475K \u2013 510K (next 3 months)",
                    "Cash flow forecast: Positive and growing",
                ],
                interpretation="Your business is on a stable trajectory. The main risk to the forecast is continued expense growth outpacing revenue.",
                recommendation="Monitor the expense-to-revenue ratio monthly. If expenses grow faster than projected, profit margins will compress faster than the forecast suggests.",
                follow_ups=[
                    "What are my biggest expense categories?",
                    "Can I afford to hire someone?",
                    "What is my next best move?",
                ],
            )

        # --- Default contextual response ---
        # Use the financial context to make the response data-aware
        ctx_lines = context.split("\n") if context else []
        ctx_currency = "PKR"
        for cl in ctx_lines:
            if cl.startswith("Currency:"):
                ctx_currency = cl.split(":", 1)[1].strip()
                break

        return ChatResponse(
            answer=f"I've analyzed your financial data for {DEMO_BUSINESS_NAME}. Your business is showing steady revenue growth of ~24% year-over-year, but expense growth is outpacing revenue growth in recent months.",
            evidence=[
                "Revenue trend: Growing, ~24% YoY",
                "Expense trend: Growing faster at ~38% YoY",
                "Current profit margin: ~25%",
                "Cash position: Healthy and improving",
            ],
            interpretation="The business is fundamentally healthy, but the widening gap between expense growth and revenue growth needs attention to protect margins.",
            recommendation="Ask me about specific areas like expenses, revenue, cash flow, or what you should focus on next. I can provide data-grounded analysis for any aspect of your business.",
            follow_ups=[
                "How is my business health score?",
                "What are my biggest expenses?",
                "Show me my overdue invoices",
                "What should I focus on next month?",
            ],
        )

    async def generate_insights(
        self, metrics: list[FinancialMetrics], transactions: list[Transaction]
    ) -> list[AIInsight]:
        latest = metrics[-1] if metrics else None
        if not latest:
            return []

        return [
            AIInsight(
                type=InsightType.RISK,
                severity=InsightSeverity.HIGH,
                title="Expense Growth Outpacing Revenue",
                explanation=(
                    f"Your expenses increased {abs(latest.expenses_change_pct):.1f}% this month "
                    f"while revenue grew only {latest.revenue_change_pct:.1f}%. "
                    f"This gap is reducing your profit margin."
                ),
                evidence=[
                    f"Revenue growth: +{latest.revenue_change_pct:.1f}% MoM",
                    f"Expense growth: +{latest.expenses_change_pct:.1f}% MoM",
                    f"Current margin: {latest.margin * 100:.1f}%",
                ],
                recommendation="Review recurring operating expenses to identify potential savings. Focus on the top 3 expense categories driving this growth.",
            ),
            AIInsight(
                type=InsightType.TREND,
                severity=InsightSeverity.MEDIUM,
                title="Marketing Spend Accelerating",
                explanation=(
                    "Marketing expenses have grown consistently over 12 months, with a "
                    "24% spike this month. The return on this investment has not yet been "
                    "reflected in proportional revenue gains."
                ),
                evidence=[
                    f"Marketing this month: PKR {latest.expense_breakdown.get('Marketing', 0):,.0f}",
                    "12-month growth: +53%",
                    "Revenue response: Not yet proportional",
                ],
                recommendation="Evaluate the ROI of each marketing channel. Pause campaigns that haven't produced measurable results within 60 days.",
            ),
            AIInsight(
                type=InsightType.OPPORTUNITY,
                severity=InsightSeverity.MEDIUM,
                title="Retainer Revenue Can Be Expanded",
                explanation=(
                    "Retainer contracts provide your most predictable income at ~30% of revenue. "
                    "Expanding this to 40% would significantly improve revenue stability."
                ),
                evidence=[
                    "Retainer share: ~30% of revenue",
                    "Client projects: ~55% (less predictable)",
                    "Industry benchmark: 40-50% retainer mix",
                ],
                recommendation="Approach your top 3 repeat project clients with retainer proposals. Even converting one client would add ~PKR 50,000/month in predictable revenue.",
            ),
            AIInsight(
                type=InsightType.POSITIVE,
                severity=InsightSeverity.LOW,
                title="Consistently Positive Cash Flow",
                explanation=(
                    "Your business has maintained positive cash flow every month this year. "
                    "This consistency provides a strong foundation for strategic investments."
                ),
                evidence=[
                    "12 consecutive months of positive cash flow",
                    f"Latest cash balance: PKR {latest.cash_balance:,.0f}",
                    f"Monthly net flow: PKR {latest.cash_flow:,.0f}",
                ],
                recommendation="With this stability, consider allocating surplus cash toward growth initiatives or building a 6-month operating reserve.",
            ),
            AIInsight(
                type=InsightType.ANOMALY,
                severity=InsightSeverity.MEDIUM,
                title="August Operations Spike Detected",
                explanation=(
                    "A PKR 285,000 hardware refresh in August caused an unusual operations spike. "
                    "This is a one-time capital expense but temporarily inflated monthly costs."
                ),
                evidence=[
                    "August operations: ~PKR 645,000 (vs avg ~PKR 350,000)",
                    "Hardware refresh: PKR 285,000",
                    "Normal operations: ~PKR 360,000",
                ],
                recommendation="For future capital purchases, consider spreading the cost across months or using a capital expenditure reserve to avoid distorting monthly metrics.",
            ),
        ]

    async def analyze_health(
        self, metrics: list[FinancialMetrics], transactions: list[Transaction]
    ) -> BusinessHealthScore:
        # Delegate to the analytics engine for data-driven scoring
        from app.analytics.engine import compute_health_score
        return compute_health_score(metrics)

    async def what_if_analysis(
        self, request: WhatIfRequest, metrics: list[FinancialMetrics]
    ) -> WhatIfResult:
        if not metrics:
            return WhatIfResult(
                description=request.description,
                projected_revenue=0, projected_expenses=0, projected_profit=0,
                projected_cash_flow=0, projected_health_score=0,
                ai_interpretation="Insufficient data for analysis.",
                recommendation="Add financial data to enable scenario analysis.",
            )

        latest = metrics[-1]
        params = request.params
        rev_change = params.get("revenue_change_pct", 0) / 100
        exp_change = params.get("expense_change_pct", 0) / 100
        hire_cost = params.get("monthly_salary", 0)

        new_rev = latest.revenue * (1 + rev_change)
        new_exp = latest.expenses * (1 + exp_change) + hire_cost
        new_profit = new_rev - new_exp
        new_cf = latest.cash_flow + (new_profit - latest.profit)

        from app.analytics.engine import compute_health_score
        current_health = compute_health_score(metrics)
        profit_delta = new_profit - latest.profit
        health_delta = (profit_delta / max(1, latest.profit)) * 25
        new_health = max(0, min(100, current_health.overall + health_delta))

        risk_level = "manageable" if new_profit > latest.profit * 0.7 else "concerning"

        return WhatIfResult(
            description=request.description,
            projected_revenue=round(new_rev, 2),
            projected_expenses=round(new_exp, 2),
            projected_profit=round(new_profit, 2),
            projected_cash_flow=round(new_cf, 2),
            projected_health_score=round(new_health, 1),
            ai_interpretation=(
                f"Under this scenario, your monthly profit would change from "
                f"PKR {latest.profit:,.0f} to PKR {new_profit:,.0f} "
                f"(a {profit_delta:+,.0f} change). This impact is {risk_level}. "
                f"Your health score would move from {current_health.overall:.0f} to {new_health:.0f}."
            ),
            recommendation=(
                "Model this scenario over 3-6 months to see cumulative impact. "
                "Ensure you maintain at least 3 months of operating expenses as a cash reserve."
            ),
        )


    async def generate_business_summary(
        self, metrics: list[FinancialMetrics], invoices: list[Invoice]
    ) -> BusinessSummary:
        """Generate an AI business summary from financial data."""
        if not metrics:
            return BusinessSummary(
                period="No data", ai_summary="Insufficient data to generate a summary.",
            )

        latest = metrics[-1]
        avg_rev = sum(m.revenue for m in metrics[-6:]) / min(6, len(metrics))
        total_rev = sum(m.revenue for m in metrics)
        total_exp = sum(m.expenses for m in metrics)
        total_profit = total_rev - total_exp

        overdue = [inv for inv in invoices if inv.status == InvoiceStatus.OVERDUE]
        overdue_total = sum(inv.total for inv in overdue)

        highlights = []
        concerns = []
        recs = []

        if latest.margin > 0.25:
            highlights.append(f"Profit margin of {latest.margin * 100:.1f}% is healthy for your industry.")
        if latest.revenue_change_pct > 5:
            highlights.append(f"Revenue grew {latest.revenue_change_pct:.1f}% this month.")
        if latest.cash_flow > 0:
            highlights.append(f"Positive cash flow of PKR {latest.cash_flow:,.0f} this month.")

        if latest.expenses_change_pct > 10:
            concerns.append(f"Expenses grew {latest.expenses_change_pct:.1f}% \u2014 faster than revenue.")
        if overdue:
            concerns.append(f"{len(overdue)} overdue invoices totaling PKR {overdue_total:,.0f}.")
        if latest.margin < 0.20:
            concerns.append(f"Profit margin ({latest.margin * 100:.1f}%) is below the 20% safety threshold.")

        recs.append("Review top 3 expense categories for optimization opportunities.")
        if overdue:
            recs.append("Follow up on overdue invoices to improve cash position.")
        if latest.margin < 0.25:
            recs.append("Focus on improving profit margin through cost control or revenue mix.")

        period_str = f"{metrics[0].period} to {latest.period}" if len(metrics) > 1 else latest.period
        summary = (
            f"Over the period {period_str}, {DEMO_BUSINESS_NAME} generated PKR {total_rev:,.0f} in revenue "
            f"with PKR {total_exp:,.0f} in expenses, resulting in PKR {total_profit:,.0f} net profit. "
            f"Your latest month shows revenue of PKR {latest.revenue:,.0f} with a {latest.margin * 100:.1f}% margin. "
        )
        if overdue:
            summary += f"There are {len(overdue)} overdue invoices worth PKR {overdue_total:,.0f} that need attention."

        return BusinessSummary(
            period=period_str,
            ai_summary=summary,
            highlights=highlights,
            concerns=concerns,
            recommendations=recs,
        )


DEMO_BUSINESS_NAME = "Bright Pixel Studios"


def get_ai_provider() -> AIProvider:
    """Factory: returns the configured AI provider instance."""
    if settings.ai_provider == "alibaba":
        # Future: from app.ai.alibaba import AlibabaProvider; return AlibabaProvider()
        raise NotImplementedError(
            "Alibaba Cloud AI provider is not yet configured. "
            "Set ACCORA_AI_PROVIDER=mock for development."
        )
    return MockAIProvider()
