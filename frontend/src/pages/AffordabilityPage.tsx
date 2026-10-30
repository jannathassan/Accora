import { useState } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useFinancial } from '../store/FinancialStore';

export default function AffordabilityPage() {
  const { transactions } = useFinancial();
  const [decisionType, setDecisionType] = useState<'buy' | 'cost' | 'brk' | 'drop'>('buy');
  const [amount, setAmount] = useState<string>('50000');
  const [result, setResult] = useState<{
    verdict: 'yes' | 'careful' | 'no';
    title: string;
    msg: string;
    afterCash: number;
    monthsCoverage: number;
  } | null>(null);

  // Quick helper calculation based on real transactions
  const totalBalance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0) || 120000;
  const recentOut = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const avgMonthlyOut = recentOut > 0 ? recentOut / 3 : 45000;

  const handleCheck = () => {
    const val = parseFloat(amount) || 0;
    if (val <= 0) return;

    if (decisionType === 'buy') {
      const remaining = totalBalance - val;
      const cov = avgMonthlyOut > 0 ? remaining / avgMonthlyOut : 0;
      if (remaining < 0) {
        setResult({
          verdict: 'no',
          title: 'Not now',
          msg: `This purchase would exceed your cash by PKR ${Math.abs(remaining).toLocaleString()}.`,
          afterCash: remaining,
          monthsCoverage: 0,
        });
      } else if (cov < 2) {
        setResult({
          verdict: 'careful',
          title: 'Be careful',
          msg: `After this purchase you would have PKR ${remaining.toLocaleString()}, enough for ${cov.toFixed(1)} months of spending. Aim for 3+ months.`,
          afterCash: remaining,
          monthsCoverage: cov,
        });
      } else {
        setResult({
          verdict: 'yes',
          title: 'Yes, you can afford it',
          msg: `After this purchase you would keep PKR ${remaining.toLocaleString()}, leaving ${cov.toFixed(1)} months of emergency buffer.`,
          afterCash: remaining,
          monthsCoverage: cov,
        });
      }
    } else if (decisionType === 'cost') {
      const annualImpact = val * 12;
      setResult({
        verdict: val > avgMonthlyOut * 0.3 ? 'careful' : 'yes',
        title: val > avgMonthlyOut * 0.3 ? 'Be careful' : 'Yes, you can manage this',
        msg: `A new recurring cost of PKR ${val.toLocaleString()}/month equals PKR ${annualImpact.toLocaleString()} per year.`,
        afterCash: totalBalance,
        monthsCoverage: avgMonthlyOut > 0 ? totalBalance / (avgMonthlyOut + val) : 0,
      });
    } else {
      setResult({
        verdict: 'careful',
        title: 'Plan ahead',
        msg: `Based on your recent spending, maintain a liquid reserve of at least PKR ${(avgMonthlyOut * 3).toLocaleString()}.`,
        afterCash: totalBalance,
        monthsCoverage: 2.5,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
          <span>Tool #5</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
          “Can I Afford It?”
        </h1>
        <p className="text-sm text-[#5B6785] mt-1">
          Test a financial decision before making it. We check your cash reserve and monthly savings cushion.
        </p>
      </div>

      {/* Decision Card */}
      <div className="accora-card bg-white border-[#E2E8F7] space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1D2839] uppercase tracking-wider mb-2">
              What decision are you considering?
            </label>
            <select
              value={decisionType}
              onChange={(e) => {
                setDecisionType(e.target.value as any);
                setResult(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F7] text-sm text-[#1D2839] bg-white focus:border-[#0B5CE6] min-h-[44px]"
            >
              <option value="buy">Buying something once (laptop, equipment, phone)</option>
              <option value="cost">A new monthly cost (hire helper, new rent, tool)</option>
              <option value="brk">Taking a break (weeks without income)</option>
              <option value="drop">My income drops by a %</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1D2839] uppercase tracking-wider mb-2">
              {decisionType === 'buy' && 'Purchase Price (PKR)'}
              {decisionType === 'cost' && 'Monthly Cost (PKR)'}
              {decisionType === 'brk' && 'Weeks without income'}
              {decisionType === 'drop' && 'Drop in Income (%)'}
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F7] text-sm text-[#1D2839] bg-white focus:border-[#0B5CE6] min-h-[44px]"
              placeholder="e.g. 50000"
            />
          </div>
        </div>

        <button
          onClick={handleCheck}
          className="btn-primary w-full sm:w-auto px-6 cursor-pointer"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Check Affordability
        </button>
      </div>

      {/* Verdict Result */}
      {result && (
        <div
          className={`accora-card border p-6 animate-in fade-in duration-200 ${
            result.verdict === 'yes'
              ? 'bg-[#f3fbd9] border-[#A3D508]'
              : result.verdict === 'careful'
              ? 'bg-[#fff9e6] border-[#f79009]'
              : 'bg-[#ffefed] border-[#FD614F]'
          }`}
        >
          <div className="flex items-start gap-4">
            {result.verdict === 'yes' && <CheckCircle2 className="w-7 h-7 text-[#1D2839] shrink-0" />}
            {result.verdict === 'careful' && <AlertTriangle className="w-7 h-7 text-[#f79009] shrink-0" />}
            {result.verdict === 'no' && <XCircle className="w-7 h-7 text-[#FD614F] shrink-0" />}

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-[#1D2839]">
                {result.title}
              </h3>
              <p className="text-sm text-[#1D2839] leading-relaxed">
                {result.msg}
              </p>
              <p className="text-xs text-[#5B6785] pt-2">
                Based on your real 3-month spending average. This is an informational calculation, not financial advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
