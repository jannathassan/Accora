/**
 * 4 Rich Pakistani Personas with 12 Months of Realistic PKR Data.
 * Grounded in local economic context (PKR amounts, traditional committees, FBR tax).
 */

import {
  type TransactionRecord,
  type InvoiceRecord,
  type BillRecord,
  type CommitteeRecord,
  addMonths,
  getCurrentMonth,
} from '../utils/calculations';

export interface PersonaProfile {
  key: 'shop' | 'free' | 'pro' | 'home';
  name: string;
  role: string;
  pain: string;
  startingBalance: number;
  taxRate: number;
  foreignBankShare?: number;
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
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function generatePersonaData(key: 'shop' | 'free' | 'pro' | 'home'): PersonaProfile {
  const currentYm = getCurrentMonth();
  const tx: TransactionRecord[] = [];

  if (key === 'shop') {
    // Ali, shop owner
    const monthlyTemplates = {
      in: [
        { cat: 'Sales', note: 'Shop physical counter sales', base: 180000, day: '05' },
        { cat: 'Sales', note: 'Daraz & online courier orders', base: 70000, day: '18' },
      ],
      out: [
        { cat: 'Stock', note: 'Wholesale market inventory purchase', base: 120000, day: '08' },
        { cat: 'Rent', note: 'Commercial shop rent', base: 35000, day: '01' },
        { cat: 'Salaries', note: 'Counter assistant helper salary', base: 30000, day: '02' },
        { cat: 'Utilities', note: 'Commercial electricity bill (WAPDA)', base: 12000, day: '12' },
        { cat: 'Ads', note: 'Meta & Instagram sponsored ads', base: 9000, day: '15' },
      ],
    };

    // Generate 12 months
    for (let m = 11; m >= 0; m--) {
      const ym = addMonths(currentYm, -m);
      const variance = 0.9 + 0.2 * Math.abs(Math.sin(m * 3.7));

      monthlyTemplates.in.forEach((t) => {
        tx.push({
          id: uid(),
          type: 'in',
          category: t.cat,
          note: t.note,
          amount: Math.round((t.base * variance) / 500) * 500,
          date: `${ym}-${t.day}`,
          account: 'bank',
        });
      });

      monthlyTemplates.out.forEach((t) => {
        tx.push({
          id: uid(),
          type: 'out',
          category: t.cat,
          note: t.note,
          amount: Math.round((t.base * variance) / 500) * 500,
          date: `${ym}-${t.day}`,
          account: 'cash',
        });
      });
    }

    return {
      key: 'shop',
      name: 'Ali, shop owner',
      role: 'Shop & online seller',
      pain: 'Hard to track cash vs. bank sales and keep enough stock money.',
      startingBalance: 160000,
      taxRate: 1.25,
      transactions: tx,
      invoices: [
        {
          id: uid(),
          client: 'Hassan Traders (Wholesale credit)',
          amount: 85000,
          dueDate: `${addMonths(currentYm, -1)}-25`,
          paid: false,
          status: 'overdue',
        },
        {
          id: uid(),
          client: 'Noor Studio (Bulk merchandise)',
          amount: 60000,
          dueDate: `${currentYm}-28`,
          paid: false,
          status: 'sent',
        },
      ],
      bills: [
        { id: uid(), name: 'Commercial shop rent', amount: 35000, dueDate: `${currentYm}-28`, paid: false },
        { id: uid(), name: 'Commercial electricity bill', amount: 12000, dueDate: `${currentYm}-20`, paid: true },
      ],
      committees: [],
      budgets: {
        Stock: 130000,
        Rent: 35000,
        Salaries: 30000,
        Utilities: 15000,
        Ads: 10000,
      },
      goals: [
        {
          id: uid(),
          name: 'Annual Ramadan Inventory Stocking',
          target: 350000,
          saved: 120000,
          byDate: addMonths(currentYm, 5),
        },
      ],
    };
  }

  if (key === 'free') {
    // Sara, freelancer
    const monthlyTemplates = {
      in: [
        { cat: 'Client payment', note: 'UI/UX Mobile App Retainer', base: 220000, day: '07' },
        { cat: 'Client payment', note: 'Design system consulting', base: 90000, day: '21' },
      ],
      out: [
        { cat: 'Rent', note: 'Home apartment rent', base: 45000, day: '02' },
        { cat: 'Software', note: 'Figma, Adobe, hosting subscriptions', base: 15000, day: '10' },
        { cat: 'Groceries', note: 'Monthly groceries & food', base: 30000, day: '05' },
        { cat: 'Utilities', note: 'High-speed fiber internet & phone', base: 6000, day: '14' },
        { cat: 'Transport', note: 'Careem & fuel for meetings', base: 10000, day: '16' },
      ],
    };

    for (let m = 11; m >= 0; m--) {
      const ym = addMonths(currentYm, -m);
      const variance = 0.95 + 0.15 * Math.abs(Math.cos(m * 2.3));

      monthlyTemplates.in.forEach((t) => {
        tx.push({
          id: uid(),
          type: 'in',
          category: t.cat,
          note: t.note,
          amount: Math.round((t.base * variance) / 500) * 500,
          date: `${ym}-${t.day}`,
          account: 'bank',
        });
      });

      monthlyTemplates.out.forEach((t) => {
        tx.push({
          id: uid(),
          type: 'out',
          category: t.cat,
          note: t.note,
          amount: Math.round((t.base * variance) / 500) * 500,
          date: `${ym}-${t.day}`,
          account: 'wallet',
        });
      });
    }

    return {
      key: 'free',
      name: 'Sara, freelancer',
      role: 'Freelancer & side-hustler',
      pain: 'Irregular client payments and not knowing how much tax to set aside.',
      startingBalance: 320000,
      taxRate: 1.0,
      foreignBankShare: 85,
      transactions: tx,
      invoices: [
        {
          id: uid(),
          client: 'Apex Global Tech (US Client)',
          amount: 150000,
          dueDate: `${currentYm}-25`,
          paid: false,
          status: 'sent',
        },
        {
          id: uid(),
          client: 'FinTech Lahore',
          amount: 80000,
          dueDate: `${addMonths(currentYm, -1)}-15`,
          paid: false,
          status: 'overdue',
        },
      ],
      bills: [
        { id: uid(), name: 'Home apartment rent', amount: 45000, dueDate: `${currentYm}-28`, paid: false },
        { id: uid(), name: 'Fiber optic internet', amount: 6000, dueDate: `${currentYm}-15`, paid: true },
      ],
      committees: [],
      budgets: {
        Rent: 45000,
        Groceries: 35000,
        Software: 18000,
        Transport: 12000,
      },
      goals: [
        {
          id: uid(),
          name: 'MacBook Pro M3 Workstation',
          target: 480000,
          saved: 240000,
          byDate: addMonths(currentYm, 4),
        },
      ],
    };
  }

  if (key === 'pro') {
    // Usman, employee
    const monthlyTemplates = {
      in: [
        { cat: 'Salary', note: 'Monthly salaried bank deposit', base: 180000, day: '01' },
      ],
      out: [
        { cat: 'Rent', note: 'House rent', base: 55000, day: '03' },
        { cat: 'Groceries', note: 'Monthly family groceries', base: 35000, day: '06' },
        { cat: 'Transport', note: 'Car fuel & maintenance', base: 15000, day: '11' },
        { cat: 'Utilities', note: 'Electricity & gas bills', base: 14000, day: '15' },
        { cat: 'Eating out', note: 'Weekend family dining', base: 12000, day: '20' },
      ],
    };

    for (let m = 11; m >= 0; m--) {
      const ym = addMonths(currentYm, -m);
      monthlyTemplates.in.forEach((t) => {
        tx.push({
          id: uid(),
          type: 'in',
          category: t.cat,
          note: t.note,
          amount: t.base,
          date: `${ym}-${t.day}`,
          account: 'bank',
        });
      });

      monthlyTemplates.out.forEach((t) => {
        tx.push({
          id: uid(),
          type: 'out',
          category: t.cat,
          note: t.note,
          amount: t.base,
          date: `${ym}-${t.day}`,
          account: 'wallet',
        });
      });
    }

    return {
      key: 'pro',
      name: 'Usman, employee',
      role: 'Working professional',
      pain: 'Salary vanishes within 15 days; unable to save for goals.',
      startingBalance: 85000,
      taxRate: 5.0,
      transactions: tx,
      invoices: [],
      bills: [
        { id: uid(), name: 'House rent', amount: 55000, dueDate: `${currentYm}-28`, paid: false },
        { id: uid(), name: 'Electricity bill', amount: 14000, dueDate: `${currentYm}-18`, paid: false },
      ],
      committees: [],
      budgets: {
        Rent: 55000,
        Groceries: 35000,
        Utilities: 15000,
        Transport: 15000,
        'Eating out': 12000,
      },
      goals: [
        {
          id: uid(),
          name: 'Emergency 6-Month Cash Buffer',
          target: 250000,
          saved: 80000,
          byDate: addMonths(currentYm, 8),
        },
      ],
    };
  }

  // key === 'home'
  // Ayesha, homemaker
  const monthlyTemplates = {
    in: [
      { cat: 'Household money', note: 'Monthly household allowance', base: 120000, day: '02' },
    ],
    out: [
      { cat: 'Groceries', note: 'Kitchen groceries, meat, and vegetables', base: 38000, day: '05' },
      { cat: 'School fees', note: 'Children school fees', base: 25000, day: '10' },
      { cat: 'Utilities', note: 'Sui gas & water bills', base: 11000, day: '14' },
      { cat: 'Medical', note: 'Monthly family medicines', base: 8000, day: '17' },
      { cat: 'Committee', note: 'Monthly family committee installment', base: 10000, day: '08' },
    ],
  };

  for (let m = 11; m >= 0; m--) {
    const ym = addMonths(currentYm, -m);
    monthlyTemplates.in.forEach((t) => {
      tx.push({
        id: uid(),
        type: 'in',
        category: t.cat,
        note: t.note,
        amount: t.base,
        date: `${ym}-${t.day}`,
        account: 'cash',
      });
    });

    monthlyTemplates.out.forEach((t) => {
      tx.push({
        id: uid(),
        type: 'out',
        category: t.cat,
        note: t.note,
        amount: t.base,
        date: `${ym}-${t.day}`,
        account: 'cash',
      });
    });
  }

  return {
    key: 'home',
    name: 'Ayesha, homemaker',
    role: 'Homemaker',
    pain: 'Managing household budget, committee turns, and emergency savings.',
    startingBalance: 45000,
    taxRate: 0,
    transactions: tx,
    invoices: [],
    bills: [
      { id: uid(), name: 'Children school fees', amount: 25000, dueDate: `${currentYm}-10`, paid: true },
      { id: uid(), name: 'Gas & electricity bill', amount: 11000, dueDate: `${currentYm}-25`, paid: false },
    ],
    committees: [
      {
        id: uid(),
        name: 'Family Kameti',
        monthlyAmount: 10000,
        members: 10,
        startMonth: addMonths(currentYm, -2),
        myTurn: 5,
        paidMonths: [1, 2, 3],
        receivedPayout: false,
      },
    ],
    budgets: {
      Groceries: 40000,
      'School fees': 25000,
      Utilities: 12000,
      Medical: 10000,
      Committee: 10000,
    },
    goals: [
      {
        id: uid(),
        name: 'Family Emergency Gold Fund',
        target: 180000,
        saved: 55000,
        byDate: addMonths(currentYm, 7),
      },
    ],
  };
}
