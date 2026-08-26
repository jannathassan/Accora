/** Core TypeScript types for Accora frontend. Mirrors backend models. */

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';
export type InsightType = 'risk' | 'anomaly' | 'opportunity' | 'trend' | 'positive';
export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Business {
  id: string;
  name: string;
  industry: string;
  business_type: string;
  currency: string;
  monthly_revenue_range: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  business_id: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  business_id: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  notes: string;
  created_at: string;
}

export interface TransactionCreate {
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  status?: TransactionStatus;
  notes?: string;
}

export interface TransactionUpdate {
  date?: string;
  description?: string;
  category?: string;
  type?: TransactionType;
  amount?: number;
  status?: TransactionStatus;
  notes?: string;
}

export interface FinancialMetrics {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  cash_flow: number;
  cash_balance: number;
  outstanding: number;
  revenue_change_pct: number;
  expenses_change_pct: number;
  profit_change_pct: number;
  expense_breakdown: Record<string, number>;
}

export interface BusinessHealthScore {
  overall: number;
  label: string;
  revenue_performance: number;
  profitability: number;
  expense_control: number;
  cash_flow_health: number;
  growth_trend: number;
  explanation: string;
  strengths: string[];
  improvements: string[];
}

export interface AIInsight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  explanation: string;
  evidence: string[];
  recommendation: string;
  timestamp: string;
}

export interface SmartAction {
  id: string;
  priority: number;
  title: string;
  description: string;
  impact: string;
  action_label: string;
  insight_type: InsightType;
}

export interface CashFlowStatus {
  status: 'healthy' | 'watch' | 'at_risk';
  label: string;
  explanation: string;
  projected_balance_3mo: number;
  recommendation: string;
}

export interface ForecastPoint {
  date: string;
  value: number;
  is_predicted: boolean;
  confidence_low: number | null;
  confidence_high: number | null;
}

export interface Forecast {
  metric: string;
  points: ForecastPoint[];
  explanation: string;
  generated_at: string;
}

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  answer: string;
  evidence: string[];
  interpretation: string;
  recommendation: string;
  follow_ups: string[];
}

export interface WhatIfRequest {
  scenario_type: string;
  description: string;
  params: Record<string, number>;
}

export interface WhatIfResult {
  description: string;
  projected_revenue: number;
  projected_expenses: number;
  projected_profit: number;
  projected_cash_flow: number;
  projected_health_score: number;
  ai_interpretation: string;
  recommendation: string;
}

export interface Categories {
  income: string[];
  expense: string[];
}

// ---------------------------------------------------------------------------
// Invoice
// ---------------------------------------------------------------------------

export type InvoiceStatusType = 'draft' | 'sent' | 'paid' | 'pending' | 'overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  business_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: InvoiceStatusType;
  issue_date: string;
  due_date: string;
  paid_date: string | null;
  notes: string;
  created_at: string;
}

export interface InvoiceCreate {
  client_name: string;
  client_email?: string;
  items: InvoiceItem[];
  tax_rate?: number;
  status?: InvoiceStatusType;
  issue_date: string;
  due_date: string;
  notes?: string;
}

export interface InvoiceUpdate {
  client_name?: string;
  client_email?: string;
  items?: InvoiceItem[];
  tax_rate?: number;
  status?: InvoiceStatusType;
  issue_date?: string;
  due_date?: string;
  paid_date?: string;
  notes?: string;
}

export interface InvoiceSummary {
  total_invoiced: number;
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  count: number;
  overdue_count: number;
  pending_count: number;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export type NotificationType = 'overdue_invoice' | 'expense_spike' | 'cashflow_warning' | 'revenue_milestone' | 'insight' | 'general';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  read: boolean;
  action_url: string;
  related_id: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Insight Status
// ---------------------------------------------------------------------------

export type InsightStatusType = 'new' | 'reviewed' | 'resolved';

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export interface BusinessSettings {
  business_name: string;
  industry: string;
  business_type: string;
  currency: string;
  monthly_revenue_range: string;
  fiscal_year_start: string;
}

export interface UserPreferences {
  date_format: string;
  default_view: string;
  compact_mode: boolean;
}

export interface AIPreferences {
  proactive_insights: boolean;
  forecast_horizon_months: number;
  risk_tolerance: string;
}

export interface AppSettings {
  business: BusinessSettings;
  preferences: UserPreferences;
  ai_preferences: AIPreferences;
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface PLReport {
  period: string;
  revenue: number;
  expenses: number;
  gross_profit: number;
  net_profit: number;
  margin: number;
  revenue_breakdown: Record<string, number>;
  expense_breakdown: Record<string, number>;
}

export interface ExpenseReport {
  period: string;
  total: number;
  breakdown: Record<string, number>;
  top_categories: { category: string; amount: number; pct: number }[];
  change_vs_prior: number;
}

export interface CashFlowReport {
  period: string;
  inflow: number;
  outflow: number;
  net: number;
  opening_balance: number;
  closing_balance: number;
}

export interface BusinessSummary {
  period: string;
  ai_summary: string;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
}

// ---------------------------------------------------------------------------
// Next Best Move
// ---------------------------------------------------------------------------

export interface NextBestMove {
  title: string;
  description: string;
  why_it_matters: string;
  action_label: string;
  action_url: string;
  impact: string;
  secondary: string[];
}
