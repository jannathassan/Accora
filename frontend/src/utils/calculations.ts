/**
 * Pure, tested financial calculations for ACCORA.
 * All logic is deterministic and grounded strictly in user records.
 */

export interface TransactionRecord {
  id: string;
  type: 'in' | 'out';
  amount: number;
  category: string;
  note: string;
  date: string; // YYYY-MM-DD
  account?: 'cash' | 'bank' | 'wallet';
  repeatMonthly?: boolean;
}

export interface InvoiceRecord {
  id: string;
  client: string;
  amount: number;
  taxPercent?: number;
  dueDate: string; // YYYY-MM-DD
  paid: boolean;
  status?: 'draft' | 'sent' | 'paid' | 'overdue';
}

export interface BillRecord {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paid: boolean;
  repeatMonthly?: boolean;
}

export interface CommitteeRecord {
  id: string;
  name: string;
  monthlyAmount: number;
  members: number;
  startMonth: string; // YYYY-MM
  myTurn: number; // Month number (1 to members)
  paidMonths: number[]; // Month numbers paid
  receivedPayout?: boolean;
}

export interface HealthScoreResult {
  score: number; // 0 to 100
  verdict: 'healthy' | 'warning' | 'risk';
  summary: string;
  tips: string[];
}

export interface ForecastPoint {
  month: string; // YYYY-MM or Mon
  projectedBalance: number;
  isProjected: boolean;
}

export interface ForecastResult {
  currentBalance: number;
  avgMonthlyIncome: number;
  avgMonthlyExpense: number;
  netMonthlyPace: number;
  endBalance: number;
  monthsUntilEmpty: number | null;
  summarySentence: string;
  points: ForecastPoint[];
}

export interface AffordabilityResult {
  verdict: 'yes' | 'careful' | 'no';
  title: string;
  message: string;
  remainingCash: number;
  monthsBuffer: number;
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function addMonths(ym: string, delta: number): string {
  const [yearStr, monthStr] = ym.split('-');
  const d = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + delta, 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function monthsBetween(ymA: string, ymB: string): number {
  const [yA, mA] = ymA.split('-').map(Number);
  const [yB, mB] = ymB.split('-').map(Number);
  return (yB - yA) * 12 + (mB - mA);
}

/**
 * Auto-suggests a category from note text in plain Urdu/English.
 */
export function guessCategory(note: string): string {
  const l = (note || '').toLowerCase();
  if (/grocer|sabzi|ration|mart|store|supermarket/.test(l)) return 'Groceries';
  if (/rent|kiraya/.test(l)) return 'Rent';
  if (/electric|gas|water|bill|internet|wifi|phone|k-electric|ptcl|nayatel/.test(l)) return 'Utilities';
  if (/fuel|petrol|uber|careem|bus|van|cng|indrive/.test(l)) return 'Transport';
  if (/school|fee|college|tuition|academy|books/.test(l)) return 'School fees';
  if (/medic|doctor|pharm|clinic|hospital|dawa/.test(l)) return 'Medical';
  if (/stock|goods|wholesale|supplier|inventory|maal/.test(l)) return 'Stock';
  if (/salary|salaries|wage|helper|tankhwah/.test(l)) return 'Salaries';
  if (/ad |ads|facebook|instagram|meta|marketing/.test(l)) return 'Ads';
  if (/software|subscription|tool|hosting|domain|figma|canva/.test(l)) return 'Software';
  if (/food|kfc|restaurant|cafe|dinner|lunch|biryani|chai/.test(l)) return 'Eating out';
  if (/daraz|shop|clothes|cloth|shoes/.test(l)) return 'Shopping';
  if (/committee|bc |kameti/.test(l)) return 'Committee';
  return 'Other';
}

/**
 * Calculates sum of transactions for a specific month.
 */
export function sumMonthTransactions(
  transactions: TransactionRecord[],
  ym: string,
  type?: 'in' | 'out'
): number {
  return transactions
    .filter(t => t.date.slice(0, 7) === ym && (!type || t.type === type))
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Computes average monthly flow across the last 3 months.
 */
export function averageMonthlyFlow(
  transactions: TransactionRecord[],
  type: 'in' | 'out',
  currentYm: string = getCurrentMonth()
): number {
  let total = 0;
  let monthsWithData = 0;

  for (let m = 1; m <= 3; m++) {
    const ym = addMonths(currentYm, -m);
    const flow = sumMonthTransactions(transactions, ym, type);
    if (flow > 0) {
      total += flow;
      monthsWithData++;
    }
  }

  if (monthsWithData > 0) return Math.round(total / monthsWithData);
  return sumMonthTransactions(transactions, currentYm, type);
}

/**
 * Computes total balance from all recorded entries.
 */
export function computeTotalBalance(
  transactions: TransactionRecord[],
  startingBalance: number = 0
): number {
  const net = transactions.reduce((acc, t) => acc + (t.type === 'in' ? t.amount : -t.amount), 0);
  return net + startingBalance;
}

/**
 * Computes Money Health Score (0 to 100) with plain English tips.
 */
export function calculateHealthScore(
  transactions: TransactionRecord[],
  invoices: InvoiceRecord[] = [],
  currentYm: string = getCurrentMonth()
): HealthScoreResult {
  const currentIncome = sumMonthTransactions(transactions, currentYm, 'in') || averageMonthlyFlow(transactions, 'in', currentYm);
  const currentExpense = sumMonthTransactions(transactions, currentYm, 'out') || averageMonthlyFlow(transactions, 'out', currentYm);

  if (currentIncome <= 0) {
    return {
      score: 50,
      verdict: 'warning',
      summary: 'Add your income entries to get an accurate score.',
      tips: [
        'Add your sales or monthly salary in Income & Spending Tracker.',
        'Record regular client invoices to track expected cash inflow.',
        'Set up budget limits for top expense categories.',
      ],
    };
  }

  const retentionRatio = (currentIncome - currentExpense) / currentIncome;
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueCount = invoices.filter(i => !i.paid && i.dueDate < todayStr).length;

  const rawScore = Math.round(50 + retentionRatio * 200) - overdueCount * 5;
  const finalScore = Math.max(5, Math.min(98, rawScore));

  const keptPct = Math.round(retentionRatio * 100);

  if (retentionRatio >= 0.2) {
    return {
      score: finalScore,
      verdict: 'healthy',
      summary: `You keep about ${keptPct}% of what you earn this month. That is very healthy.`,
      tips: [
        'Channel your extra savings into your emergency savings goal.',
        'Pre-pay upcoming utilities or supplier invoices to avoid late fees.',
        'Keep setting aside estimated tax in a separate reserve.',
      ],
    };
  }

  if (retentionRatio >= 0) {
    return {
      score: finalScore,
      verdict: 'warning',
      summary: `You keep only ${keptPct}% of what you earn. Try to spend a little less on non-essentials.`,
      tips: [
        'Check Budget & Savings Goals to trim dining out or software costs.',
        'Send reminders for overdue client invoices to boost cash.',
        'Hold off on large one-time purchases until cash reserves reach 3 months of spending.',
      ],
    };
  }

  return {
    score: finalScore,
    verdict: 'risk',
    summary: 'You are spending more than you earn this month.',
    tips: [
      'Immediate action: pause non-critical costs until cash flow recovers.',
      'Check the “Can I Afford It?” tool before committing to any new expenses.',
      'Follow up on outstanding invoices using the WhatsApp reminder tool.',
    ],
  };
}

/**
 * Computes 3 or 6-month Future Forecast.
 */
export function calculateForecast(
  transactions: TransactionRecord[],
  monthsAhead: 3 | 6 = 6,
  startingBalance: number = 0,
  currentYm: string = getCurrentMonth()
): ForecastResult {
  const currentBal = computeTotalBalance(transactions, startingBalance);
  const avgIn = averageMonthlyFlow(transactions, 'in', currentYm);
  const avgOut = averageMonthlyFlow(transactions, 'out', currentYm);
  const netPace = avgIn - avgOut;

  const points: ForecastPoint[] = [
    {
      month: currentYm,
      projectedBalance: currentBal,
      isProjected: false,
    },
  ];

  let runningBal = currentBal;
  for (let i = 1; i <= monthsAhead; i++) {
    runningBal += netPace;
    points.push({
      month: addMonths(currentYm, i),
      projectedBalance: runningBal,
      isProjected: true,
    });
  }

  const endBalance = runningBal;
  let monthsUntilEmpty: number | null = null;
  let summarySentence = '';

  if (netPace >= 0) {
    summarySentence = `At this pace you will have about PKR ${Math.round(endBalance).toLocaleString()} in ${monthsAhead} months (saving about PKR ${Math.round(netPace).toLocaleString()} a month).`;
  } else {
    monthsUntilEmpty = avgOut > 0 ? Math.max(0, Math.floor(currentBal / Math.abs(netPace))) : 0;
    summarySentence = `You spend about PKR ${Math.round(Math.abs(netPace)).toLocaleString()} more than you earn each month. Cash may run low in about ${monthsUntilEmpty} month(s).`;
  }

  return {
    currentBalance: currentBal,
    avgMonthlyIncome: avgIn,
    avgMonthlyExpense: avgOut,
    netMonthlyPace: netPace,
    endBalance,
    monthsUntilEmpty,
    summarySentence,
    points,
  };
}

/**
 * Evaluates Affordability decision.
 */
export function evaluateAffordability(
  transactions: TransactionRecord[],
  decisionType: 'buy' | 'cost' | 'brk' | 'drop',
  amount: number,
  startingBalance: number = 0,
  currentYm: string = getCurrentMonth()
): AffordabilityResult {
  const currentCash = computeTotalBalance(transactions, startingBalance);
  const avgIn = averageMonthlyFlow(transactions, 'in', currentYm) || 100000;
  const avgOut = averageMonthlyFlow(transactions, 'out', currentYm) || 60000;

  if (decisionType === 'buy') {
    const remainingCash = currentCash - amount;
    const monthsBuffer = avgOut > 0 ? remainingCash / avgOut : 0;

    if (remainingCash < 0) {
      return {
        verdict: 'no',
        title: 'Not now',
        message: `This purchase would exceed your cash reserve by PKR ${Math.abs(remainingCash).toLocaleString()}.`,
        remainingCash,
        monthsBuffer: 0,
      };
    }

    if (monthsBuffer < 2) {
      return {
        verdict: 'careful',
        title: 'Be careful',
        message: `After this purchase you would keep PKR ${remainingCash.toLocaleString()}, leaving only ${monthsBuffer.toFixed(1)} months of emergency spending coverage. Aim for 3+ months.`,
        remainingCash,
        monthsBuffer,
      };
    }

    return {
      verdict: 'yes',
      title: 'Yes, you can afford it',
      message: `After this purchase you will still have PKR ${remainingCash.toLocaleString()}, which covers ${monthsBuffer.toFixed(1)} months of average spending comfortably.`,
      remainingCash,
      monthsBuffer,
    };
  }

  if (decisionType === 'cost') {
    const newNetMonthly = avgIn - (avgOut + amount);
    const monthsBuffer = (avgOut + amount) > 0 ? currentCash / (avgOut + amount) : 0;

    if (newNetMonthly < 0) {
      return {
        verdict: 'no',
        title: 'Not now',
        message: `This recurring monthly cost of PKR ${amount.toLocaleString()} would push your budget into negative monthly cash flow.`,
        remainingCash: currentCash,
        monthsBuffer,
      };
    }

    if (newNetMonthly < avgIn * 0.1) {
      return {
        verdict: 'careful',
        title: 'Be careful',
        message: `You would only save PKR ${newNetMonthly.toLocaleString()} per month after taking on this new monthly cost.`,
        remainingCash: currentCash,
        monthsBuffer,
      };
    }

    return {
      verdict: 'yes',
      title: 'Yes, you can manage this',
      message: `You will continue to keep approximately PKR ${newNetMonthly.toLocaleString()} each month after adding this cost.`,
      remainingCash: currentCash,
      monthsBuffer,
    };
  }

  if (decisionType === 'brk') {
    const weeklyRate = avgIn / 4.33;
    const lostIncome = Math.round(weeklyRate * amount);
    const remainingCash = currentCash - (amount * (avgOut / 4.33));
    const monthsBuffer = avgOut > 0 ? remainingCash / avgOut : 0;

    return {
      verdict: monthsBuffer < 2 ? 'careful' : 'yes',
      title: monthsBuffer < 2 ? 'Be careful' : 'Yes, you can take this break',
      message: `Taking ${amount} week(s) off will forego about PKR ${lostIncome.toLocaleString()} of income. You will have PKR ${remainingCash.toLocaleString()} remaining.`,
      remainingCash,
      monthsBuffer,
    };
  }

  // drop
  const dropPct = amount;
  const newIncome = avgIn * (1 - dropPct / 100);
  const newNet = newIncome - avgOut;
  const monthsBuffer = avgOut > 0 ? currentCash / avgOut : 0;

  return {
    verdict: newNet < 0 ? 'no' : newNet < avgIn * 0.1 ? 'careful' : 'yes',
    title: newNet < 0 ? 'High risk' : newNet < avgIn * 0.1 ? 'Tight margin' : 'Sustainable',
    message: `If income drops by ${dropPct}%, you would bring in PKR ${Math.round(newIncome).toLocaleString()} and keep PKR ${Math.round(newNet).toLocaleString()} monthly.`,
    remainingCash: currentCash,
    monthsBuffer,
  };
}

/**
 * Computes Tax Year total (July 1 to June 30).
 */
export function calculateTaxSetAside(
  transactions: TransactionRecord[],
  ratePercent: number = 1.5,
  referenceDate: Date = new Date()
): {
  taxYearStartDate: string;
  totalIncomeThisTaxYear: number;
  estimatedSetAside: number;
} {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-indexed
  const taxYearStartYear = currentMonth >= 6 ? currentYear : currentYear - 1;
  const taxYearStartDate = `${taxYearStartYear}-07-01`;

  const totalIncome = transactions
    .filter(t => t.type === 'in' && t.date >= taxYearStartDate)
    .reduce((sum, t) => sum + t.amount, 0);

  const estimatedSetAside = Math.round(totalIncome * (ratePercent / 100));

  return {
    taxYearStartDate,
    totalIncomeThisTaxYear: totalIncome,
    estimatedSetAside,
  };
}
