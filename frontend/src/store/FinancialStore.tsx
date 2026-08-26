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
      const [b, u, txns, m, l, h, ins, acts, cf, fc, invs, invSum, notifs, sett, nbm] = await Promise.all([
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
      setBusiness(b);
      setUser(u);
      setTransactions(txns);
      setMetrics(m);
      setLatest(l);
      setHealth(h);
      setInsights(ins);
      setActions(acts);
      setCashFlow(cf);
      setForecast(fc);
      setInvoices(invs);
      setInvoiceSummary(invSum);
      setNotifications(notifs);
      setSettings(sett);
      setNextBestMove(nbm);
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
  }, []);

  const updateInsightStatus = useCallback(async (id: string, status: string) => {
    await api.updateInsightStatus(id, status);
  }, []);

  const askAI = useCallback(async (message: string): Promise<ChatResponse> => {
    return api.chatWithAI({ message });
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
