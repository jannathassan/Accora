/**
 * FinancialStore — Centralized state management for Accora.
 *
 * All financial data flows through this store. When transactions change,
 * metrics, health, insights, and forecasts are automatically refreshed.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import * as api from '../services/api';
import type {
  AIInsight,
  AppNotification,
  AppSettings,
  Business,
  BusinessHealthScore,
  CashFlowStatus,
  ChatResponse,
  FinancialMetrics,
  Forecast,
  Invoice,
  InvoiceCreate,
  InvoiceSummary,
  InvoiceUpdate,
  NextBestMove,
  SmartAction,
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  User,
} from '../types';

interface FinancialState {
  business: Business | null;
  user: User | null;
  transactions: Transaction[];
  metrics: FinancialMetrics[];
  latest: FinancialMetrics | null;
  health: BusinessHealthScore | null;
  insights: AIInsight[];
  actions: SmartAction[];
  cashFlow: CashFlowStatus | null;
  forecast: Forecast[];
  invoices: Invoice[];
  invoiceSummary: InvoiceSummary | null;
  notifications: AppNotification[];
  settings: AppSettings | null;
  nextBestMove: NextBestMove | null;
  loading: boolean;
  error: string | null;
}

interface FinancialActions {
  refreshAll: () => Promise<void>;
  addTransaction: (t: TransactionCreate) => Promise<void>;
  editTransaction: (id: string, t: TransactionUpdate) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  addInvoice: (i: InvoiceCreate) => Promise<void>;
  editInvoice: (id: string, i: InvoiceUpdate) => Promise<void>;
  removeInvoice: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateSettings: (s: AppSettings) => Promise<void>;
  updateInsightStatus: (id: string, status: string) => Promise<void>;
  askAI: (message: string) => Promise<ChatResponse>;
}

type FinancialContext = FinancialState & FinancialActions;

const Ctx = createContext<FinancialContext | null>(null);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<FinancialMetrics[]>([]);
  const [latest, setLatest] = useState<FinancialMetrics | null>(null);
  const [health, setHealth] = useState<BusinessHealthScore | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [actions, setActions] = useState<SmartAction[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowStatus | null>(null);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoiceSummary, setInvoiceSummary] = useState<InvoiceSummary | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [nextBestMove, setNextBestMove] = useState<NextBestMove | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await Promise.allSettled([
        api.getBusiness(),
        api.getUser(),
        api.getTransactions(),
        api.getMetrics(),
        api.getLatestMetrics(),
        api.getHealthScore(),
        api.getAIInsights(),
        api.getSmartActions(),
        api.getCashFlowStatus(),
        api.getForecast(),
        api.getInvoices(),
        api.getInvoiceSummary(),
        api.getNotifications(),
        api.getSettings(),
        api.getNextBestMove(),
      ]);

      const val = <T,>(i: number, fallback: T): T =>
        results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<T>).value : fallback;

      const errors: string[] = [];
      results.forEach((r, i) => {
        if (r.status === 'rejected') {
          const labels = ['business', 'user', 'transactions', 'metrics', 'latest metrics', 'health', 'insights', 'actions', 'cash flow', 'forecast', 'invoices', 'invoice summary', 'notifications', 'settings', 'next best move'];
          errors.push(`${labels[i]}: ${r.reason instanceof Error ? r.reason.message : 'Failed'}`);
        }
      });
      if (errors.length) console.warn('[FinancialStore] Partial load errors:', errors);

      setBusiness(val<Business | null>(0, null));
      setUser(val<User | null>(1, null));
      setTransactions(val<Transaction[]>(2, []));
      setMetrics(val<FinancialMetrics[]>(3, []));
      setLatest(val<FinancialMetrics | null>(4, null));
      setHealth(val<BusinessHealthScore | null>(5, null));
      setInsights(val<AIInsight[]>(6, []));
      setActions(val<SmartAction[]>(7, []));
      setCashFlow(val<CashFlowStatus | null>(8, null));
      setForecast(val<Forecast[]>(9, []));
      setInvoices(val<Invoice[]>(10, []));
      setInvoiceSummary(val<InvoiceSummary | null>(11, null));
      setNotifications(val<AppNotification[]>(12, []));
      setSettings(val<AppSettings | null>(13, null));
      setNextBestMove(val<NextBestMove | null>(14, null));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const addTransaction = useCallback(async (body: TransactionCreate) => {
    await api.createTransaction(body);
    await refreshAll();
  }, [refreshAll]);

  const editTransaction = useCallback(async (id: string, body: TransactionUpdate) => {
    await api.updateTransaction(id, body);
    await refreshAll();
  }, [refreshAll]);

  const removeTransaction = useCallback(async (id: string) => {
    await api.deleteTransaction(id);
    await refreshAll();
  }, [refreshAll]);

  const addInvoice = useCallback(async (body: InvoiceCreate) => {
    await api.createInvoice(body);
    await refreshAll();
  }, [refreshAll]);

  const editInvoice = useCallback(async (id: string, body: InvoiceUpdate) => {
    await api.updateInvoice(id, body);
    await refreshAll();
  }, [refreshAll]);

  const removeInvoice = useCallback(async (id: string) => {
    await api.deleteInvoice(id);
    await refreshAll();
  }, [refreshAll]);

  const markNotificationRead = useCallback(async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const updateSettingsAction = useCallback(async (s: AppSettings) => {
    await api.updateSettings(s);
    setSettings(s);
    // Refresh business data in case name/currency changed
    try {
      const updated = await api.getBusiness();
      setBusiness(updated);
    } catch { /* non-critical */ }
  }, []);

  const updateInsightStatus = useCallback(async (id: string, status: string) => {
    await api.updateInsightStatus(id, status);
  }, []);

  const askAI = useCallback(async (message: string): Promise<ChatResponse> => {
    try {
      return await api.chatWithAI({ message });
    } catch (e) {
      return {
        answer: e instanceof Error
          ? `Unable to reach Accora AI: ${e.message}. Please ensure the backend is running and try again.`
          : 'Something went wrong while connecting to Accora AI. Please try again in a moment.',
        evidence: [],
        interpretation: 'The AI service is currently unavailable.',
        recommendation: 'Check your connection and try again.',
        follow_ups: ['What are my top expenses?', 'How is my cash flow?'],
      };
    }
  }, []);

  const value: FinancialContext = {
    business, user, transactions, metrics, latest, health,
    insights, actions, cashFlow, forecast, invoices, invoiceSummary,
    notifications, settings, nextBestMove, loading, error,
    refreshAll, addTransaction, editTransaction, removeTransaction,
    addInvoice, editInvoice, removeInvoice,
    markNotificationRead, markAllNotificationsRead,
    updateSettings: updateSettingsAction, updateInsightStatus,
    askAI,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFinancial(): FinancialContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFinancial must be used within FinancialProvider');
  return ctx;
}
