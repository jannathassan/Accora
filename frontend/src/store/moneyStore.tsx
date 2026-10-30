import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  type TransactionRecord,
  type InvoiceRecord,
  type BillRecord,
  type CommitteeRecord,
  type HealthScoreResult,
  type ForecastResult,
  calculateHealthScore,
  calculateForecast,
  computeTotalBalance,
  sumMonthTransactions,
  getCurrentMonth,
  addMonths,
} from '../utils/calculations';
import { generatePersonaData, type PersonaProfile } from '../data/personas';

const STORAGE_KEY = 'accora_money_store_v1';

export interface ToastItem {
  id: string;
  message: string;
  nextStepPrompt?: string;
  nextStepRoute?: string;
  undoAction?: () => void;
}

export interface MoneyStoreState {
  isDemo: boolean;
  activePersonaKey: 'shop' | 'free' | 'pro' | 'home';
  userName: string;
  userRole: string;
  startingBalance: number;
  taxRate: number;
  foreignBankShare: number;
  transactions: TransactionRecord[];
  invoices: InvoiceRecord[];
  bills: BillRecord[];
  committees: CommitteeRecord[];
  budgets: Record<string, number>;
  goals: {
    id: string;
    name: string;
    target: number;
    saved: number;
    byDate: string;
  }[];
  checklist: {
    firstIncomeAdded: boolean;
    firstSpendingAdded: boolean;
    budgetSet: boolean;
    questionAsked: boolean;
    affordabilityChecked: boolean;
  };
  tourStep: number; // -1 = closed
  toasts: ToastItem[];
  
  // Computed reactive getters
  balance: number;
  monthIn: number;
  monthOut: number;
  monthKept: number;
  health: HealthScoreResult;
  forecast: ForecastResult;
  alerts: string[];
}

export interface MoneyStoreActions {
  loadPersona: (key: 'shop' | 'free' | 'pro' | 'home') => void;
  resetDemo: () => void;
  setupCustomUser: (opts: {
    name: string;
    role: string;
    startingBalance?: number;
    taxRate?: number;
    withSampleData?: boolean;
  }) => void;
  addTransaction: (record: Omit<TransactionRecord, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<InvoiceRecord, 'id' | 'paid'>) => Promise<void>;
  markInvoicePaid: (id: string) => Promise<void>;
  addBill: (bill: Omit<BillRecord, 'id' | 'paid'>) => Promise<void>;
  markBillPaid: (id: string) => Promise<void>;
  addCommittee: (committee: Omit<CommitteeRecord, 'id' | 'paidMonths'>) => Promise<void>;
  markCommitteeMonthPaid: (id: string, monthIdx: number) => Promise<void>;
  markCommitteePayoutReceived: (id: string) => Promise<void>;
  setBudgetLimit: (category: string, limit: number) => Promise<void>;
  addSavingsGoal: (goal: { name: string; target: number; byDate: string }) => Promise<void>;
  contributeToGoal: (id: string, amount: number) => Promise<void>;
  setTourStep: (step: number) => void;
  dismissToast: (id: string) => void;
  showToast: (opts: Omit<ToastItem, 'id'>) => void;
}

type MoneyContextType = MoneyStoreState & MoneyStoreActions;

const MoneyContext = createContext<MoneyContextType | null>(null);

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function MoneyProvider({ children }: { children: ReactNode }) {
  // Initialize with 'shop' (Ali) demo persona or load from localStorage
  const [profile, setProfile] = useState<PersonaProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return generatePersonaData('shop');
  });

  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [checklist, setChecklist] = useState({
    firstIncomeAdded: true,
    firstSpendingAdded: true,
    budgetSet: true,
    questionAsked: false,
    affordabilityChecked: false,
  });
  const [tourStep, setTourStep] = useState<number>(-1);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Sync state to localStorage whenever profile changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Storage unavailable
    }
  }, [profile]);

  const showToast = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = uid();
    setToasts((prev) => [...prev, { ...opts, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadPersona = useCallback((key: 'shop' | 'free' | 'pro' | 'home') => {
    const newPersona = generatePersonaData(key);
    setProfile(newPersona);
    setIsDemo(true);
    showToast({
      message: `Loaded ${newPersona.name} with 12 months of PKR records.`,
      nextStepPrompt: 'See your forecast ->',
      nextStepRoute: '/app/forecast',
    });
  }, [showToast]);

  const resetDemo = useCallback(() => {
    const reset = generatePersonaData(profile.key || 'shop');
    setProfile(reset);
    setIsDemo(true);
    showToast({
      message: 'Demo records reset to default scenario.',
    });
  }, [profile.key, showToast]);

  const setupCustomUser = useCallback((opts: {
    name: string;
    role: string;
    startingBalance?: number;
    taxRate?: number;
    withSampleData?: boolean;
  }) => {
    if (opts.withSampleData) {
      const persona = generatePersonaData('shop');
      persona.name = opts.name;
      persona.role = opts.role;
      persona.startingBalance = opts.startingBalance || 50000;
      setProfile(persona);
    } else {
      setProfile({
        key: 'shop',
        name: opts.name,
        role: opts.role,
        pain: 'Managing income, spending, and savings.',
        startingBalance: opts.startingBalance || 0,
        taxRate: opts.taxRate || 1.5,
        transactions: [],
        invoices: [],
        bills: [],
        committees: [],
        budgets: {},
        goals: [],
      });
      setChecklist({
        firstIncomeAdded: false,
        firstSpendingAdded: false,
        budgetSet: false,
        questionAsked: false,
        affordabilityChecked: false,
      });
    }
    setIsDemo(false);
    showToast({
      message: `Welcome, ${opts.name}! Account initialized.`,
      nextStepPrompt: 'Add your first record ->',
      nextStepRoute: '/app/transactions',
    });
  }, [showToast]);

  const addTransaction = useCallback(async (record: Omit<TransactionRecord, 'id'>) => {
    const newTx: TransactionRecord = {
      ...record,
      id: uid(),
    };

    setProfile((prev) => {
      const nextTx = [newTx, ...prev.transactions];

      // If repeatMonthly is enabled, schedule for next 2 months too
      if (record.repeatMonthly) {
        const ym = record.date.slice(0, 7);
        for (let i = 1; i <= 2; i++) {
          const nextYm = addMonths(ym, i);
          nextTx.push({
            ...newTx,
            id: uid(),
            date: `${nextYm}-${record.date.slice(8, 10)}`,
          });
        }
      }

      return {
        ...prev,
        transactions: nextTx,
      };
    });

    setChecklist((prev) => ({
      ...prev,
      firstIncomeAdded: prev.firstIncomeAdded || record.type === 'in',
      firstSpendingAdded: prev.firstSpendingAdded || record.type === 'out',
    }));

    showToast({
      message: `Recorded ${record.type === 'in' ? 'income' : 'spending'} of PKR ${record.amount.toLocaleString()}.`,
      nextStepPrompt: 'See your forecast ->',
      nextStepRoute: '/app/forecast',
    });
  }, [showToast]);

  const deleteTransaction = useCallback(async (id: string) => {
    const removed = profile.transactions.find((t) => t.id === id);
    if (!removed) return;

    setProfile((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));

    showToast({
      message: 'Entry deleted.',
      undoAction: () => {
        setProfile((prev) => ({
          ...prev,
          transactions: [removed, ...prev.transactions],
        }));
      },
    });
  }, [profile.transactions, showToast]);

  const addInvoice = useCallback(async (invoice: Omit<InvoiceRecord, 'id' | 'paid'>) => {
    const newInv: InvoiceRecord = {
      ...invoice,
      id: uid(),
      paid: false,
      status: invoice.status || 'sent',
    };

    setProfile((prev) => ({
      ...prev,
      invoices: [newInv, ...prev.invoices],
    }));

    showToast({
      message: `Invoice for ${invoice.client} created (PKR ${invoice.amount.toLocaleString()}).`,
      nextStepPrompt: 'View unpaid invoices ->',
      nextStepRoute: '/app/invoices',
    });
  }, [showToast]);

  const markInvoicePaid = useCallback(async (id: string) => {
    const inv = profile.invoices.find((i) => i.id === id);
    if (!inv) return;

    setProfile((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) => (i.id === id ? { ...i, paid: true, status: 'paid' } : i)),
    }));

    // Auto-create income transaction per spec!
    await addTransaction({
      amount: inv.amount,
      type: 'in',
      category: 'Client payment',
      note: `Invoice payment received: ${inv.client}`,
      date: new Date().toISOString().slice(0, 10),
      account: 'bank',
    });

    showToast({
      message: `Invoice marked paid! Added PKR ${inv.amount.toLocaleString()} to your income.`,
      nextStepPrompt: 'Check dashboard ->',
      nextStepRoute: '/app',
    });
  }, [profile.invoices, addTransaction, showToast]);

  const addBill = useCallback(async (bill: Omit<BillRecord, 'id' | 'paid'>) => {
    const newBill: BillRecord = {
      ...bill,
      id: uid(),
      paid: false,
    };

    setProfile((prev) => ({
      ...prev,
      bills: [newBill, ...prev.bills],
    }));

    showToast({
      message: `Bill "${bill.name}" saved (PKR ${bill.amount.toLocaleString()}).`,
    });
  }, [showToast]);

  const markBillPaid = useCallback(async (id: string) => {
    const b = profile.bills.find((x) => x.id === id);
    if (!b) return;

    setProfile((prev) => ({
      ...prev,
      bills: prev.bills.map((x) => (x.id === id ? { ...x, paid: true } : x)),
    }));

    // Auto-create expense entry per spec!
    await addTransaction({
      amount: b.amount,
      type: 'out',
      category: 'Utilities',
      note: `Bill paid: ${b.name}`,
      date: new Date().toISOString().slice(0, 10),
      account: 'wallet',
    });

    showToast({
      message: `Bill paid! Added PKR ${b.amount.toLocaleString()} to your spending.`,
      nextStepPrompt: 'See your forecast ->',
      nextStepRoute: '/app/forecast',
    });
  }, [profile.bills, addTransaction, showToast]);

  const addCommittee = useCallback(async (committee: Omit<CommitteeRecord, 'id' | 'paidMonths'>) => {
    const newBc: CommitteeRecord = {
      ...committee,
      id: uid(),
      paidMonths: [],
      receivedPayout: false,
    };

    setProfile((prev) => ({
      ...prev,
      committees: [...prev.committees, newBc],
    }));

    showToast({
      message: `Committee "${committee.name}" created. Schedule generated.`,
    });
  }, [showToast]);

  const markCommitteeMonthPaid = useCallback(async (id: string, monthIdx: number) => {
    const bc = profile.committees.find((c) => c.id === id);
    if (!bc) return;

    setProfile((prev) => ({
      ...prev,
      committees: prev.committees.map((c) =>
        c.id === id && !c.paidMonths.includes(monthIdx)
          ? { ...c, paidMonths: [...c.paidMonths, monthIdx] }
          : c
      ),
    }));

    // Auto-create expense entry per spec!
    await addTransaction({
      amount: bc.monthlyAmount,
      type: 'out',
      category: 'Committee',
      note: `Committee payment (Month ${monthIdx}): ${bc.name}`,
      date: new Date().toISOString().slice(0, 10),
      account: 'cash',
    });

    showToast({
      message: `Committee installment (Month ${monthIdx}) recorded.`,
      nextStepPrompt: 'View Committee Tracker ->',
      nextStepRoute: '/app/committee',
    });
  }, [profile.committees, addTransaction, showToast]);

  const markCommitteePayoutReceived = useCallback(async (id: string) => {
    const bc = profile.committees.find((c) => c.id === id);
    if (!bc) return;

    const totalPayout = bc.monthlyAmount * bc.members;
    setProfile((prev) => ({
      ...prev,
      committees: prev.committees.map((c) => (c.id === id ? { ...c, receivedPayout: true } : c)),
    }));

    // Auto-create income entry per spec!
    await addTransaction({
      amount: totalPayout,
      type: 'in',
      category: 'Committee',
      note: `Committee lump-sum payout received: ${bc.name}`,
      date: new Date().toISOString().slice(0, 10),
      account: 'bank',
    });

    showToast({
      message: `Congratulations! Recorded PKR ${totalPayout.toLocaleString()} committee payout.`,
      nextStepPrompt: 'See your updated balance ->',
      nextStepRoute: '/app',
    });
  }, [profile.committees, addTransaction, showToast]);

  const setBudgetLimit = useCallback(async (category: string, limit: number) => {
    setProfile((prev) => ({
      ...prev,
      budgets: {
        ...prev.budgets,
        [category]: limit,
      },
    }));

    setChecklist((prev) => ({ ...prev, budgetSet: true }));

    showToast({
      message: `Monthly budget limit for ${category} set to PKR ${limit.toLocaleString()}.`,
    });
  }, [showToast]);

  const addSavingsGoal = useCallback(async (goal: { name: string; target: number; byDate: string }) => {
    const newGoal = {
      ...goal,
      id: uid(),
      saved: 0,
    };

    setProfile((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));

    showToast({
      message: `Savings goal "${goal.name}" created (Target: PKR ${goal.target.toLocaleString()}).`,
    });
  }, [showToast]);

  const contributeToGoal = useCallback(async (id: string, amount: number) => {
    const g = profile.goals.find((x) => x.id === id);
    if (!g) return;

    setProfile((prev) => ({
      ...prev,
      goals: prev.goals.map((x) => (x.id === id ? { ...x, saved: x.saved + amount } : x)),
    }));

    // Creates savings expense entry
    await addTransaction({
      amount,
      type: 'out',
      category: 'Savings',
      note: `Savings goal contribution: ${g.name}`,
      date: new Date().toISOString().slice(0, 10),
      account: 'bank',
    });

    showToast({
      message: `Added PKR ${amount.toLocaleString()} to "${g.name}".`,
    });
  }, [profile.goals, addTransaction, showToast]);

  // Reactive Computed Getters
  const currentYm = getCurrentMonth();
  const balance = computeTotalBalance(profile.transactions, profile.startingBalance);
  const monthIn = sumMonthTransactions(profile.transactions, currentYm, 'in');
  const monthOut = sumMonthTransactions(profile.transactions, currentYm, 'out');
  const monthKept = monthIn - monthOut;

  const health = calculateHealthScore(profile.transactions, profile.invoices, currentYm);
  const forecast = calculateForecast(profile.transactions, 6, profile.startingBalance, currentYm);

  // Generate reactive alerts list (Section 6)
  const alerts: string[] = [];
  const todayStr = new Date().toISOString().slice(0, 10);
  const sevenDaysLater = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  // Unpaid bills due soon
  profile.bills
    .filter((b) => !b.paid && b.dueDate <= sevenDaysLater)
    .forEach((b) => {
      alerts.push(`Bill due soon: ${b.name} (PKR ${b.amount.toLocaleString()}) on ${b.dueDate}`);
    });

  // Overdue invoices
  profile.invoices
    .filter((i) => !i.paid && i.dueDate < todayStr)
    .forEach((i) => {
      alerts.push(`Overdue invoice: ${i.client} owes PKR ${i.amount.toLocaleString()}`);
    });

  // Budget warnings (>= 80% or >= 100%)
  Object.entries(profile.budgets).forEach(([cat, limit]) => {
    const spentThisMonth = profile.transactions
      .filter((t) => t.type === 'out' && t.category === cat && t.date.slice(0, 7) === currentYm)
      .reduce((sum, t) => sum + t.amount, 0);

    if (limit > 0 && spentThisMonth >= limit) {
      alerts.push(`Over budget: ${cat} is at ${Math.round((spentThisMonth / limit) * 100)}% of limit!`);
    } else if (limit > 0 && spentThisMonth >= limit * 0.8) {
      alerts.push(`Budget alert: ${cat} reached ${Math.round((spentThisMonth / limit) * 100)}% of monthly limit.`);
    }
  });

  const value: MoneyContextType = {
    isDemo,
    activePersonaKey: profile.key,
    userName: profile.name,
    userRole: profile.role,
    startingBalance: profile.startingBalance,
    taxRate: profile.taxRate,
    foreignBankShare: profile.foreignBankShare || 80,
    transactions: profile.transactions,
    invoices: profile.invoices,
    bills: profile.bills,
    committees: profile.committees,
    budgets: profile.budgets,
    goals: profile.goals,
    checklist,
    tourStep,
    toasts,
    balance,
    monthIn,
    monthOut,
    monthKept,
    health,
    forecast,
    alerts,
    loadPersona,
    resetDemo,
    setupCustomUser,
    addTransaction,
    deleteTransaction,
    addInvoice,
    markInvoicePaid,
    addBill,
    markBillPaid,
    addCommittee,
    markCommitteeMonthPaid,
    markCommitteePayoutReceived,
    setBudgetLimit,
    addSavingsGoal,
    contributeToGoal,
    setTourStep,
    dismissToast,
    showToast,
  };

  return <MoneyContext.Provider value={value}>{children}</MoneyContext.Provider>;
}

export function useMoneyStore(): MoneyContextType {
  const ctx = useContext(MoneyContext);
  if (!ctx) {
    throw new Error('useMoneyStore must be used within a MoneyProvider');
  }
  return ctx;
}
