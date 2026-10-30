import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHealthScore,
  calculateForecast,
  evaluateAffordability,
  calculateTaxSetAside,
  guessCategory,
  computeTotalBalance,
  averageMonthlyFlow,
  type TransactionRecord,
} from './calculations.ts';
import { sanitizeCsvField } from './format.ts';

describe('ACCORA Financial Calculations (Pakistan PKR)', () => {
  const currentYm = '2026-10';

  const sampleTransactions: TransactionRecord[] = [
    // Month -2 (August)
    { id: '1', date: '2026-08-05', amount: 150000, type: 'in', category: 'Salary', note: 'Monthly salary' },
    { id: '2', date: '2026-08-10', amount: 40000, type: 'out', category: 'Rent', note: 'House rent' },
    { id: '3', date: '2026-08-15', amount: 30000, type: 'out', category: 'Groceries', note: 'Monthly ration' },

    // Month -1 (September)
    { id: '4', date: '2026-09-05', amount: 150000, type: 'in', category: 'Salary', note: 'Monthly salary' },
    { id: '5', date: '2026-09-10', amount: 40000, type: 'out', category: 'Rent', note: 'House rent' },
    { id: '6', date: '2026-09-15', amount: 35000, type: 'out', category: 'Groceries', note: 'Monthly ration' },

    // Current Month (October)
    { id: '7', date: '2026-10-05', amount: 150000, type: 'in', category: 'Salary', note: 'Monthly salary' },
    { id: '8', date: '2026-10-10', amount: 40000, type: 'out', category: 'Rent', note: 'House rent' },
    { id: '9', date: '2026-10-15', amount: 30000, type: 'out', category: 'Groceries', note: 'Monthly ration' },
  ];

  describe('1. Health Score Calculation', () => {
    it('returns a high score and healthy verdict when savings rate is >= 30%', () => {
      const result = calculateHealthScore(sampleTransactions, [], currentYm);
      assert.ok(result.score >= 70, `Expected score >= 70, got ${result.score}`);
      assert.strictEqual(result.verdict, 'healthy');
      assert.ok(result.summary.length > 0);
      assert.strictEqual(result.tips.length, 3);
    });

    it('returns high risk verdict when spending exceeds income', () => {
      const deficitTransactions: TransactionRecord[] = [
        { id: 'd1', date: '2026-10-01', amount: 50000, type: 'in', category: 'Salary', note: 'Part-time salary' },
        { id: 'd2', date: '2026-10-05', amount: 90000, type: 'out', category: 'Rent', note: 'Overdue rent' },
      ];
      const result = calculateHealthScore(deficitTransactions, [], currentYm);
      assert.ok(result.score <= 45, `Expected score <= 45, got ${result.score}`);
      assert.strictEqual(result.verdict, 'risk');
    });
  });

  describe('2. Future Forecast Calculation', () => {
    it('projects future balances accurately for 6 months', () => {
      const forecast = calculateForecast(sampleTransactions, 6, 200000, currentYm);
      assert.strictEqual(forecast.points.length, 7); // current month + 6 future months
      assert.ok(forecast.netMonthlyPace > 0, 'Expected positive monthly pace');
      assert.ok(forecast.endBalance > forecast.currentBalance, 'Projected balance should grow');
      assert.ok(forecast.summarySentence.includes('PKR'));
    });

    it('warns when cash will run low due to persistent deficit', () => {
      const losingTransactions: TransactionRecord[] = [
        { id: 'l1', date: '2026-10-01', amount: 20000, type: 'in', category: 'Income', note: 'Sales' },
        { id: 'l2', date: '2026-10-05', amount: 50000, type: 'out', category: 'Rent', note: 'Rent' },
      ];
      const forecast = calculateForecast(losingTransactions, 6, 40000, currentYm);
      assert.ok(forecast.netMonthlyPace < 0);
      assert.ok(forecast.monthsUntilEmpty !== null && forecast.monthsUntilEmpty <= 2);
    });
  });

  describe('3. "Can I Afford It?" Verdict Engine', () => {
    it('approves a small one-time purchase with green "Yes" verdict', () => {
      const verdict = evaluateAffordability(sampleTransactions, 'buy', 25000, 300000, currentYm);
      assert.strictEqual(verdict.verdict, 'yes');
      assert.strictEqual(verdict.title, 'Yes, you can afford it');
      assert.ok(verdict.monthsBuffer >= 2);
    });

    it('advises caution when a purchase eats into emergency buffer', () => {
      // 300k starting + 240k net transactions = 540k; 450k purchase leaves 90k, less than 2 months of ~70k spend
      const verdict = evaluateAffordability(sampleTransactions, 'buy', 450000, 300000, currentYm);
      assert.strictEqual(verdict.verdict, 'careful');
      assert.strictEqual(verdict.title, 'Be careful');
    });

    it('rejects a purchase that exceeds total cash balance with red "Not now"', () => {
      // purchase exceeding total balance
      const verdict = evaluateAffordability(sampleTransactions, 'buy', 900000, 100000, currentYm);
      assert.strictEqual(verdict.verdict, 'no');
      assert.strictEqual(verdict.title, 'Not now');
    });

    it('regression: rejects a break when living costs exceed total cash reserve (negative cash)', () => {
      // Total cash = 235k net + 20k = 255k. 20 weeks cost ~335k -> deficit of ~80k
      const verdict = evaluateAffordability(sampleTransactions, 'brk', 20, 20000, currentYm);
      assert.strictEqual(verdict.verdict, 'no');
      assert.strictEqual(verdict.title, 'Not now');
      assert.ok(verdict.remainingCash < 0);
      assert.strictEqual(verdict.remainingCash, Math.round(verdict.remainingCash)); // integer check
      assert.strictEqual(verdict.monthsBuffer, 0);
    });

    it('regression: warns when a break leaves less than 2 months emergency buffer', () => {
      // Total cash = 255k. 10 weeks cost ~167k -> leaves 87k, which is ~1.2 months of ~72.5k spend (< 2)
      const verdict = evaluateAffordability(sampleTransactions, 'brk', 10, 20000, currentYm);
      assert.strictEqual(verdict.verdict, 'careful');
      assert.strictEqual(verdict.title, 'Be careful');
      assert.ok(verdict.monthsBuffer > 0 && verdict.monthsBuffer < 2);
    });

    it('regression: approves a break when remaining cash covers 2+ months buffer', () => {
      // Total cash = 255k. 4 weeks cost ~67k -> leaves ~188k, which is ~2.6 months of ~72.5k spend (>= 2)
      const verdict = evaluateAffordability(sampleTransactions, 'brk', 4, 20000, currentYm);
      assert.strictEqual(verdict.verdict, 'yes');
      assert.strictEqual(verdict.title, 'Yes, you can take this break');
      assert.ok(verdict.monthsBuffer >= 2);
    });
  });

  describe('4. Tax Helper Set-Aside', () => {
    it('calculates Pakistani tax year set-aside starting July 1', () => {
      const refDate = new Date('2026-10-15');
      const taxData = calculateTaxSetAside(sampleTransactions, 1.5, refDate);
      assert.strictEqual(taxData.taxYearStartDate, '2026-07-01');
      assert.strictEqual(taxData.totalIncomeThisTaxYear, 450000); // 3 months x 150k
      assert.strictEqual(taxData.estimatedSetAside, Math.round(450000 * 0.015)); // 6,750
    });
  });

  describe('5. Pakistani Category Guesser (Urdu & English terms)', () => {
    it('accurately identifies grocery and ration terms', () => {
      assert.strictEqual(guessCategory('Sabzi mandi bazaar purchase'), 'Groceries');
      assert.strictEqual(guessCategory('Monthly ration from Imtiaz'), 'Groceries');
    });

    it('accurately identifies rent and utilities', () => {
      assert.strictEqual(guessCategory('Shop monthly kiraya'), 'Rent');
      assert.strictEqual(guessCategory('K-Electric bijli bill payment'), 'Utilities');
      assert.strictEqual(guessCategory('Sui gas bill for heating'), 'Utilities');
    });

    it('accurately identifies transport and fuel', () => {
      assert.strictEqual(guessCategory('PSO petrol fuel fill up'), 'Transport');
      assert.strictEqual(guessCategory('Uber ride to client office'), 'Transport');
    });

    it('accurately identifies business stock and education', () => {
      assert.strictEqual(guessCategory('Wholesale inventory goods restock'), 'Stock');
      assert.strictEqual(guessCategory('Children school tuition fee'), 'School fees');
    });
  });

  describe('6. Balance and Average Flow Computations', () => {
    it('computes total net balance accurately with starting balance', () => {
      const bal = computeTotalBalance(sampleTransactions, 50000);
      // in: 450,000, out: (40k+30k) + (40k+35k) + (40k+30k) = 215,000. Net = 235,000 + 50,000 = 285,000
      assert.strictEqual(bal, 285000);
    });

    it('computes average monthly outflow across trailing 3 months', () => {
      const avgOut = averageMonthlyFlow(sampleTransactions, 'out', currentYm);
      assert.strictEqual(avgOut, 72500);
    });
  });
  describe('7. CSV Export Security (Formula Injection Protection)', () => {
    it('safely wraps standard text fields in quotes', () => {
      assert.strictEqual(sanitizeCsvField('Groceries from Imtiaz'), '"Groceries from Imtiaz"');
      assert.strictEqual(sanitizeCsvField(50000), '"50000"');
    });

    it('neutralizes spreadsheet formula injection starting with =, +, -, @', () => {
      assert.strictEqual(sanitizeCsvField('=calc'), '"\'=calc"');
      assert.strictEqual(sanitizeCsvField('+12345'), '"\'+12345"');
      assert.strictEqual(sanitizeCsvField('-5000'), '"\'-5000"');
      assert.strictEqual(sanitizeCsvField('@SUM(A1:B10)'), '"\'@SUM(A1:B10)"');
    });

    it('escapes internal double quotes properly', () => {
      assert.strictEqual(sanitizeCsvField('Note with "quotes" inside'), '"Note with ""quotes"" inside"');
    });

    it('handles undefined and null gracefully without throwing', () => {
      assert.strictEqual(sanitizeCsvField(undefined), '""');
      assert.strictEqual(sanitizeCsvField(null), '""');
    });
  });
});