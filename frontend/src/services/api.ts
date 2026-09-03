/** Accora API client — single point of contact with the backend. */

import type {
  AIInsight,
  AppNotification,
  AppSettings,
  Business,
  BusinessHealthScore,
  BusinessSummary,
  CashFlowReport,
  CashFlowStatus,
  Categories,
  ChatRequest,
  ChatResponse,
  ExpenseReport,
  FinancialMetrics,
  Forecast,
  Invoice,
  InvoiceCreate,
  InvoiceSummary,
  InvoiceUpdate,
  NextBestMove,
  PLReport,
  SmartAction,
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  User,
  WhatIfRequest,
  WhatIfResult,
} from '../types';

/** Resolve API base URL — works in both browser and Electron contexts. */
function resolveBase(): string {
  // Electron loads from file:// where relative paths cannot reach the backend.
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return 'http://localhost:8000/api/v1';
  }
  return '/api/v1';
}

const BASE = resolveBase();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return res.json();
}

// Business & User
export const getBusiness = () => request<Business>('/business');
export const getUser = () => request<User>('/user');

// Transactions — full CRUD
export const getTransactions = (params?: {
  category?: string;
  type?: string;
  month?: string;
  search?: string;
  status?: string;
}) => {
  const qs = new URLSearchParams();
  if (params?.category) qs.set('category', params.category);
  if (params?.type) qs.set('type', params.type);
  if (params?.month) qs.set('month', params.month);
  if (params?.search) qs.set('search', params.search);
  if (params?.status) qs.set('status', params.status);
  const q = qs.toString();
  return request<Transaction[]>(`/transactions${q ? `?${q}` : ''}`);
};

export const createTransaction = (body: TransactionCreate) =>
  request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(body) });

export const updateTransaction = (id: string, body: TransactionUpdate) =>
  request<Transaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteTransaction = (id: string) =>
  request<{ ok: boolean }>(`/transactions/${id}`, { method: 'DELETE' });

export const getCategories = () => request<Categories>('/transactions/categories');

// Metrics
export const getMetrics = (months?: number) =>
  request<FinancialMetrics[]>(`/metrics${months ? `?months=${months}` : ''}`);
export const getLatestMetrics = () => request<FinancialMetrics>('/metrics/latest');

// Health
export const getHealthScore = () => request<BusinessHealthScore>('/health');

// Cash Flow
export const getCashFlowStatus = () => request<CashFlowStatus>('/cashflow');

// Forecast
export const getForecast = () => request<Forecast[]>('/forecast');

// Smart Actions
export const getSmartActions = () => request<SmartAction[]>('/actions');

// AI
export const chatWithAI = (req: ChatRequest) =>
  request<ChatResponse>('/ai/chat', { method: 'POST', body: JSON.stringify(req) });
export const getAIInsights = () => request<AIInsight[]>('/ai/insights');

// What-If
export const whatIfAnalysis = (req: WhatIfRequest) =>
  request<WhatIfResult>('/ai/what-if', { method: 'POST', body: JSON.stringify(req) });

// Invoices
export const getInvoices = (params?: { status?: string; client?: string; search?: string }) => {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.client) qs.set('client', params.client);
  if (params?.search) qs.set('search', params.search);
  const q = qs.toString();
  return request<Invoice[]>(`/invoices${q ? `?${q}` : ''}`);
};
export const getInvoiceSummary = () => request<InvoiceSummary>('/invoices/summary');
export const createInvoice = (body: InvoiceCreate) =>
  request<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(body) });
export const updateInvoice = (id: string, body: InvoiceUpdate) =>
  request<Invoice>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteInvoice = (id: string) =>
  request<{ ok: boolean }>(`/invoices/${id}`, { method: 'DELETE' });

// Notifications
export const getNotifications = (unreadOnly = false) =>
  request<AppNotification[]>(`/notifications${unreadOnly ? '?unread_only=true' : ''}`);
export const markNotificationRead = (id: string) =>
  request<{ ok: boolean }>(`/notifications/${id}/read`, { method: 'PUT' });
export const markAllNotificationsRead = () =>
  request<{ ok: boolean }>('/notifications/read-all', { method: 'PUT' });

// Reports
export const getPLReport = (months?: number) =>
  request<PLReport>(`/reports/pnl${months ? `?months=${months}` : ''}`);
export const getExpenseReport = (months?: number) =>
  request<ExpenseReport>(`/reports/expenses${months ? `?months=${months}` : ''}`);
export const getCashFlowReport = (months?: number) =>
  request<CashFlowReport>(`/reports/cashflow${months ? `?months=${months}` : ''}`);
export const getBusinessSummary = () => request<BusinessSummary>('/reports/summary');

// Settings
export const getSettings = () => request<AppSettings>('/settings');
export const updateSettings = (body: AppSettings) =>
  request<AppSettings>('/settings', { method: 'PUT', body: JSON.stringify(body) });

// Insight Statuses
export const updateInsightStatus = (id: string, status: string) =>
  request<{ ok: boolean }>(`/insights/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
export const getInsightStatuses = () => request<Record<string, string>>('/insights/statuses');

// Next Best Move
export const getNextBestMove = () => request<NextBestMove>('/next-best-move');
