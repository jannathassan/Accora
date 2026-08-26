"""Financial data models for Accora.

These Pydantic models define the core data structures for businesses,
transactions, financial metrics, AI insights, and forecasts.
"""

from __future__ import annotations

from datetime import date as Date, datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class TransactionStatus(str, Enum):
    COMPLETED = "completed"
    PENDING = "pending"
    CANCELLED = "cancelled"


class InsightType(str, Enum):
    RISK = "risk"
    ANOMALY = "anomaly"
    OPPORTUNITY = "opportunity"
    TREND = "trend"
    POSITIVE = "positive"


class InsightSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ForecastMetric(str, Enum):
    REVENUE = "revenue"
    EXPENSES = "expenses"
    PROFIT = "profit"
    CASH_FLOW = "cash_flow"


# ---------------------------------------------------------------------------
# Business & User
# ---------------------------------------------------------------------------

class Business(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    industry: str = ""
    business_type: str = ""
    currency: str = "USD"
    monthly_revenue_range: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class User(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    email: str
    business_id: UUID | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# Transaction
# ---------------------------------------------------------------------------

class Transaction(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    business_id: UUID
    date: Date
    description: str
    category: str
    type: TransactionType
    amount: float = Field(ge=0)
    status: TransactionStatus = TransactionStatus.COMPLETED
    notes: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TransactionCreate(BaseModel):
    date: Date
    description: str
    category: str
    type: TransactionType
    amount: float = Field(ge=0)
    status: TransactionStatus = TransactionStatus.COMPLETED
    notes: str = ""


class TransactionUpdate(BaseModel):
    date: Date | None = None
    description: str | None = None
    category: str | None = None
    type: TransactionType | None = None
    amount: float | None = Field(default=None, ge=0)
    status: TransactionStatus | None = None
    notes: str | None = None


# ---------------------------------------------------------------------------
# Financial Metrics
# ---------------------------------------------------------------------------

class FinancialMetrics(BaseModel):
    """Aggregated financial metrics for a given period."""
    period: str  # e.g. "2026-01" or "2026-Q1"
    revenue: float
    expenses: float
    profit: float
    margin: float  # profit / revenue
    cash_flow: float
    cash_balance: float
    outstanding: float = 0.0
    revenue_change_pct: float = 0.0
    expenses_change_pct: float = 0.0
    profit_change_pct: float = 0.0
    expense_breakdown: dict[str, float] = {}


class BusinessHealthScore(BaseModel):
    """Multi-dimensional business health assessment."""
    overall: float  # 0–100
    label: str = ""  # e.g. "Healthy", "Needs Attention"
    revenue_performance: float
    profitability: float
    expense_control: float
    cash_flow_health: float
    growth_trend: float
    explanation: str
    strengths: list[str] = []
    improvements: list[str] = []


# ---------------------------------------------------------------------------
# AI Insight
# ---------------------------------------------------------------------------

class AIInsight(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    type: InsightType
    severity: InsightSeverity
    title: str
    explanation: str
    evidence: list[str] = []
    recommendation: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# Forecast
# ---------------------------------------------------------------------------

class SmartAction(BaseModel):
    """Prioritized action item derived from insights."""
    id: UUID = Field(default_factory=uuid4)
    priority: int  # 1 = highest
    title: str
    description: str
    impact: str  # e.g. "Potential saving: PKR 8,000/month"
    action_label: str = "Review"
    insight_type: InsightType = InsightType.RISK


class CashFlowStatus(BaseModel):
    """Cash-flow health indicator with explanation."""
    status: str  # "healthy" | "watch" | "at_risk"
    label: str
    explanation: str
    projected_balance_3mo: float
    recommendation: str


class ForecastPoint(BaseModel):
    date: str
    value: float
    is_predicted: bool = False
    confidence_low: float | None = None
    confidence_high: float | None = None


class Forecast(BaseModel):
    metric: ForecastMetric
    points: list[ForecastPoint]
    explanation: str = ""
    generated_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# AI Chat
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    message: str
    context: str = ""  # optional extra context


class ChatResponse(BaseModel):
    answer: str
    evidence: list[str] = []
    interpretation: str = ""
    recommendation: str = ""
    follow_ups: list[str] = []


# ---------------------------------------------------------------------------
# What-If Scenario
# ---------------------------------------------------------------------------

class WhatIfRequest(BaseModel):
    scenario_type: str  # "revenue_change" | "expense_change" | "hire" | "custom"
    description: str
    params: dict  # e.g. {"revenue_change_pct": -20}


class WhatIfResult(BaseModel):
    description: str
    projected_revenue: float
    projected_expenses: float
    projected_profit: float
    projected_cash_flow: float
    projected_health_score: float
    ai_interpretation: str
    recommendation: str


# ---------------------------------------------------------------------------
# Invoice
# ---------------------------------------------------------------------------

class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    PAID = "paid"
    PENDING = "pending"
    OVERDUE = "overdue"


class InvoiceItem(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    description: str
    quantity: float = 1
    unit_price: float = Field(ge=0)
    amount: float = Field(ge=0)


class Invoice(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    business_id: UUID
    invoice_number: str
    client_name: str
    client_email: str = ""
    items: list[InvoiceItem] = []
    subtotal: float = 0.0
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total: float = 0.0
    status: InvoiceStatus = InvoiceStatus.DRAFT
    issue_date: Date
    due_date: Date
    paid_date: Date | None = None
    notes: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)


class InvoiceCreate(BaseModel):
    client_name: str
    client_email: str = ""
    items: list[InvoiceItem] = []
    tax_rate: float = 0.0
    status: InvoiceStatus = InvoiceStatus.DRAFT
    issue_date: Date
    due_date: Date
    notes: str = ""


class InvoiceUpdate(BaseModel):
    client_name: str | None = None
    client_email: str | None = None
    items: list[InvoiceItem] | None = None
    tax_rate: float | None = None
    status: InvoiceStatus | None = None
    issue_date: Date | None = None
    due_date: Date | None = None
    paid_date: Date | None = None
    notes: str | None = None


class InvoiceSummary(BaseModel):
    total_invoiced: float
    total_paid: float
    total_pending: float
    total_overdue: float
    count: int
    overdue_count: int
    pending_count: int


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

class NotificationType(str, Enum):
    OVERDUE_INVOICE = "overdue_invoice"
    EXPENSE_SPIKE = "expense_spike"
    CASHFLOW_WARNING = "cashflow_warning"
    REVENUE_MILESTONE = "revenue_milestone"
    INSIGHT = "insight"
    GENERAL = "general"


class NotificationSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Notification(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    type: NotificationType
    title: str
    message: str
    severity: NotificationSeverity = NotificationSeverity.MEDIUM
    read: bool = False
    action_url: str = ""
    related_id: str = ""
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# Insight Status
# ---------------------------------------------------------------------------

class InsightStatus(str, Enum):
    NEW = "new"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"


class InsightStatusUpdate(BaseModel):
    status: InsightStatus


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------

class BusinessSettings(BaseModel):
    business_name: str = ""
    industry: str = ""
    business_type: str = ""
    currency: str = "PKR"
    monthly_revenue_range: str = ""
    fiscal_year_start: str = "January"


class UserPreferences(BaseModel):
    date_format: str = "MMM DD, YYYY"
    default_view: str = "dashboard"
    compact_mode: bool = False


class AIPreferences(BaseModel):
    proactive_insights: bool = True
    forecast_horizon_months: int = 3
    risk_tolerance: str = "moderate"


class AppSettings(BaseModel):
    business: BusinessSettings = BusinessSettings()
    preferences: UserPreferences = UserPreferences()
    ai_preferences: AIPreferences = AIPreferences()


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------

class PLReport(BaseModel):
    period: str
    revenue: float
    expenses: float
    gross_profit: float
    net_profit: float
    margin: float
    revenue_breakdown: dict[str, float] = {}
    expense_breakdown: dict[str, float] = {}


class ExpenseCategory(BaseModel):
    category: str
    amount: float
    pct: float


class ExpenseReport(BaseModel):
    period: str
    total: float
    breakdown: dict[str, float] = {}
    top_categories: list[ExpenseCategory] = []
    change_vs_prior: float = 0.0


class CashFlowReport(BaseModel):
    period: str
    inflow: float
    outflow: float
    net: float
    opening_balance: float
    closing_balance: float


class BusinessSummary(BaseModel):
    period: str
    ai_summary: str
    highlights: list[str] = []
    concerns: list[str] = []
    recommendations: list[str] = []


# ---------------------------------------------------------------------------
# Next Best Move
# ---------------------------------------------------------------------------

class NextBestMove(BaseModel):
    title: str
    description: str
    why_it_matters: str
    action_label: str
    action_url: str
    impact: str
    secondary: list[str] = []
