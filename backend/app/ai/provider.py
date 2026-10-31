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

        # Parse context parameters dynamically
        ctx_map: dict[str, str] = {}
        for line in (context or "").splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                ctx_map[k.strip().lower()] = v.strip()

        currency = ctx_map.get("currency", "USD")
        biz_name = ctx_map.get("business", "Your Business").split("(")[0].strip()
        is_estimated = "estimated baseline" in (context or "").lower()
        rev_str = ctx_map.get("revenue", f"{currency} 0")
        exp_str = ctx_map.get("expenses", f"{currency} 0")
        prof_str = ctx_map.get("profit", f"{currency} 0")
        margin_str = ctx_map.get("margin", "0.0%")
        cf_str = ctx_map.get("net cash flow", ctx_map.get("cash flow", f"{currency} 0"))
        cash_str = ctx_map.get("cash balance", f"{currency} 0")
        loan_balance_str = ctx_map.get("loan balance", f"{currency} 0")
        loan_repayment_str = ctx_map.get("monthly loan repayment", f"{currency} 0")
        ar_str = ctx_map.get("outstanding ar", f"{currency} 0")
        growth_str = ctx_map.get("expected growth rate", "0%")
        mode_note = " (Grounded in your business setup profile baseline estimates.)" if is_estimated else ""

        # --- Loan & Debt questions ---
        if "loan" in q or "debt" in q or "repayment" in q or "borrow" in q:
            return ChatResponse(
                answer=f"Your outstanding loan balance is {loan_balance_str} with monthly loan repayments of {loan_repayment_str}. Debt repayments reduce your net monthly cash flow.{mode_note}",
                evidence=[
                    f"Outstanding loan balance: {loan_balance_str}",
                    f"Monthly loan repayment: {loan_repayment_str}",
                    f"Current cash balance: {cash_str}",
                    f"Monthly net cash flow: {cf_str}",
                ],
                interpretation="Loan service payments are financing cash outflows that reduce your bank balance without lowering your operating accounting profit.",
                recommendation="Ensure operating cash inflows remain well above monthly debt service obligations to maintain positive liquidity.",
                follow_ups=[
                    "What is my current cash balance?",
                    "How does debt affect my cash flow?",
                    "What is my next best move?",
                ],
            )

        # --- Profit questions ---
        if "profit" in q and any(w in q for w in ("decrease", "down", "drop", "low", "enough")):
            return ChatResponse(
                answer=f"Your profit for {biz_name} is {prof_str} with a margin of {margin_str}. While positive, expense trends should be monitored closely to maintain target margins.{mode_note}",
                evidence=[
                    f"Current profit: {prof_str} (margin {margin_str})",
                    f"Revenue: {rev_str}",
                    f"Expenses: {exp_str}",
                    f"Expected Growth Target: {growth_str}",
                ],
                interpretation="You are making profit, but the rate of expense growth is gradually eating into your margins. The trend needs monitoring over the next 2-3 months.",
                recommendation="Focus on your top expense categories and evaluate which costs are generating proportional revenue returns.",
                follow_ups=[
                    "What are my biggest expense categories?",
                    "How can I improve my profit margin?",
                    "What will happen to profit next month?",
                ],
            )
        if "profit" in q and any(w in q for w in ("improve", "increase", "grow", "better")):
            return ChatResponse(
                answer=f"To improve profit for {biz_name}, you can expand revenue from {rev_str} or reduce expenses from {exp_str}. Current margin is {margin_str}.{mode_note}",
                evidence=[
                    f"Current revenue: {rev_str}",
                    f"Current expenses: {exp_str}",
                    f"Current margin: {margin_str}",
                    f"Target growth: {growth_str}",
                ],
                interpretation="Optimizing operational expenses by 10% would directly expand monthly net income.",
                recommendation="Audit recurring vendor contracts and eliminate unused software subscriptions or unallocated contractor hours.",
                follow_ups=[
                    "What are my biggest expense categories?",
                    "Can I afford to hire someone?",
                    "What should I focus on next month?",
                ],
            )

        # --- Expense questions ---
        if "expense" in q or "spend" in q or "overspend" in q or "cost" in q:
            return ChatResponse(
                answer=f"Your monthly expenses are currently {exp_str} against revenue of {rev_str}, yielding a profit of {prof_str} (margin {margin_str}).{mode_note}",
                evidence=[
                    f"Monthly expenses: {exp_str}",
                    f"Revenue: {rev_str}",
                    f"Operating profit: {prof_str}",
                    f"Profit margin: {margin_str}",
                ],
                interpretation="Keeping fixed and variable expenses proportional to revenue growth ensures sustained profitability.",
                recommendation="Review Operations and Marketing spending for the highest-impact savings.",
                follow_ups=[
                    "How can I improve my profit?",
                    "What is my revenue forecast?",
                    "Are there any risks I should know about?",
                ],
            )

        # --- Revenue questions ---
        if "revenue" in q or "income" in q or "earn" in q or "sales" in q:
            return ChatResponse(
                answer=f"Your recorded monthly revenue for {biz_name} is {rev_str}. Target annual growth rate is set to {growth_str}.{mode_note}",
                evidence=[
                    f"Total revenue: {rev_str}",
                    f"Operating profit: {prof_str} (margin {margin_str})",
                    f"Target growth rate: {growth_str}",
                    f"Uncollected customer invoices (AR): {ar_str}",
                ],
                interpretation="Consistent revenue generation and prompt invoice collection ensure steady operating cash inflows.",
                recommendation="Focus on converting one-time project clients into predictable retainer contracts.",
                follow_ups=[
                    "What is my revenue forecast?",
                    "How can I increase profit?",
                    "What should I focus on next month?",
                ],
            )

        # --- Cash flow questions ---
        if "cash" in q or "flow" in q or "runway" in q or "balance" in q:
            return ChatResponse(
                answer=f"Your current cash balance is approximately {cash_str} with a monthly net cash flow of {cf_str} for {biz_name}.{mode_note}",
                evidence=[
                    f"Cash balance: {cash_str}",
                    f"Monthly net cash flow: {cf_str}",
                    f"Monthly loan repayment: {loan_repayment_str}",
                    f"Outstanding receivables (AR): {ar_str}",
                ],
                interpretation="Your cash balance reflects reconciled opening working capital adjusted for recorded operating cash flows and loan payments.",
                recommendation=f"Maintain a cash reserve buffer of at least 3 months operating expenses ({exp_str} monthly burn) to safeguard liquidity.",
                follow_ups=[
                    "Can I afford to hire someone?",
                    "What is my loan situation?",
                    "What is my next best move?",
                ],
            )

        # --- Hiring / afford questions ---
        if "hire" in q or "employee" in q or "afford" in q or "salary" in q:
            return ChatResponse(
                answer=f"Based on your cash balance of {cash_str} and monthly net flow of {cf_str}, evaluating new headcount depends on your role ROI and runway.{mode_note}",
                evidence=[
                    f"Cash balance: {cash_str}",
                    f"Monthly net flow: {cf_str}",
                    f"Current monthly expenses: {exp_str}",
                    f"Target revenue: {rev_str}",
                ],
                interpretation="A new hire represents a fixed monthly burn commitment. Ensure new headcount directly accelerates top-line growth or unlocks operational scale.",
                recommendation="Proceed with the hire only with clear 90-day performance milestones that support key revenue objectives.",
                follow_ups=[
                    "What is my current cash position?",
                    "How will this affect my profit?",
                    "What should I focus on next month?",
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
        return ChatResponse(
            answer=f"I've analyzed your financial data for {biz_name}. Current revenue is {rev_str}, expenses are {exp_str}, and cash balance is {cash_str}.{mode_note}",
            evidence=[
                f"Revenue: {rev_str}",
                f"Expenses: {exp_str}",
                f"Net Profit: {prof_str} ({margin_str})",
                f"Cash Balance: {cash_str}",
            ],
            interpretation="The business is actively tracked in your private workspace ledger.",
            recommendation="Ask me about specific areas like expenses, revenue, cash flow, or what you should focus on next.",
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

        if latest.is_estimated:
            return [
                AIInsight(
                    type=InsightType.POSITIVE if latest.profit >= 0 else InsightType.RISK,
                    severity=InsightSeverity.LOW if latest.profit >= 0 else InsightSeverity.HIGH,
                    title="Profile Setup: Baseline Operating Margin",
                    explanation=(
                        f"Based on your setup profile (Revenue: {latest.revenue:,.0f}, Expenses: {latest.expenses:,.0f}), "
                        f"your baseline profit margin is {latest.margin * 100:.1f}%. "
                        f"This serves as your benchmark until historical transactions are imported."
                    ),
                    evidence=[
                        f"Baseline revenue: {latest.revenue:,.0f}",
                        f"Baseline expenses: {latest.expenses:,.0f}",
                        f"Estimated profit: {latest.profit:,.0f}",
                        "Source: Business Profile Setup",
                    ],
                    recommendation="Import your transaction CSV or enter regular records to compare actual performance against this baseline.",
                ),
                AIInsight(
                    type=InsightType.OPPORTUNITY,
                    severity=InsightSeverity.MEDIUM,
                    title="Working Capital Buffer",
                    explanation=(
                        f"Your opening cash balance of {latest.cash_balance:,.0f} provides initial runway. "
                        f"Estimated monthly net cash flow is {latest.cash_flow:,.0f} after financing obligations."
                    ),
                    evidence=[
                        f"Opening cash: {latest.opening_balance:,.0f}",
                        f"Net monthly flow: {latest.cash_flow:,.0f}",
                        f"Financing debt service: {latest.financing_cash_flow:,.0f}",
                    ],
                    recommendation="Maintain at least 3-6 months of operating expenses in reserve as you scale transaction history.",
                ),
            ]

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
    if settings.ai_provider == "gemini" or (settings.ai_provider == "mock" and settings.gemini_api_key):
        from app.ai.gemini import GeminiAIProvider
        return GeminiAIProvider()

    if settings.ai_provider == "alibaba":
        # Future: from app.ai.alibaba import AlibabaProvider; return AlibabaProvider()
        raise NotImplementedError(
            "Alibaba Cloud AI provider is not yet configured. "
            "Set ACCORA_AI_PROVIDER=gemini or ACCORA_AI_PROVIDER=mock for development."
        )
    return MockAIProvider()
