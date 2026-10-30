import { useState } from 'react';
import { useMoneyStore } from '../store/moneyStore';
import { evaluateAffordability, type AffordabilityResult } from '../utils/calculations';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Bookmark,
} from 'lucide-react';

interface SavedScenario {
  id: string;
  type: string;
  amount: number;
  verdict: string;
  date: string;
}

export default function AffordabilityPage() {
  const { transactions, startingBalance, showToast } = useMoneyStore();
  const [decisionType, setDecisionType] = useState<'buy' | 'cost' | 'brk' | 'drop'>('buy');
  const [amount, setAmount] = useState<string>('50000');
  const [result, setResult] = useState<AffordabilityResult | null>(null);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);

  const handleCheck = () => {
    const val = parseFloat(amount) || 0;
    if (val <= 0) return;

    const res = evaluateAffordability(transactions, decisionType, val, startingBalance);
    setResult(res);
  };

  const handleSaveScenario = () => {
    if (!result) return;
    const val = parseFloat(amount) || 0;
    const newScenario: SavedScenario = {
      id: `sc-${Date.now()}`,
      type: decisionType,
      amount: val,
      verdict: result.title,
      date: new Date().toISOString().slice(0, 10),
    };

    setSavedScenarios((prev) => [newScenario, ...prev]);
    showToast({
      message: 'Decision scenario saved to your list.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 font-sans">
      
      {/* ── Header ── */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
          <span>Tool #5</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
          “Can I Afford It?”
        </h1>
        <p className="text-sm text-[#5B6785] mt-1">
          Test a decision before spending money. We calculate the impact on your emergency runway and monthly savings.
        </p>
      </div>

      {/* ── Decision Form ── */}
      <div className="accora-card bg-white border-[#E2E8F7] space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1D2839] uppercase tracking-wider mb-2">
              What are you considering?
            </label>
            <select
              value={decisionType}
              onChange={(e) => {
                setDecisionType(e.target.value as any);
                setResult(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F7] text-sm text-[#1D2839] bg-white focus:border-[#0B5CE6] min-h-[44px]"
            >
              <option value="buy">Buying something once (phone, equipment, machine)</option>
              <option value="cost">A new monthly cost (hire helper, new rent, software)</option>
              <option value="brk">Taking a break (weeks without earnings)</option>
              <option value="drop">My income drops by a %</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1D2839] uppercase tracking-wider mb-2">
              {decisionType === 'buy' && 'Purchase Price (PKR)'}
              {decisionType === 'cost' && 'Monthly Cost (PKR)'}
              {decisionType === 'brk' && 'Weeks Without Income'}
              {decisionType === 'drop' && 'Expected Drop in Income (%)'}
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
          <span>Check Affordability</span>
        </button>
      </div>

      {/* ── Verdict Result ── */}
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
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {result.verdict === 'yes' && <CheckCircle2 className="w-8 h-8 text-[#1D2839] shrink-0" />}
              {result.verdict === 'careful' && <AlertTriangle className="w-8 h-8 text-[#f79009] shrink-0" />}
              {result.verdict === 'no' && <XCircle className="w-8 h-8 text-[#FD614F] shrink-0" />}

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B6785]">
                  Verdict
                </span>
                <h2 className="text-2xl font-extrabold text-[#1D2839]">
                  {result.title}
                </h2>
                <p className="text-sm text-[#1D2839] leading-relaxed pt-1">
                  {result.message}
                </p>
                <div className="pt-2 flex items-center gap-4 text-xs text-[#5B6785]">
                  <span>Remaining cash: <strong>PKR {Math.round(result.remainingCash).toLocaleString()}</strong></span>
                  <span>Spending buffer: <strong>{result.monthsBuffer.toFixed(1)} months</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveScenario}
              className="btn-outline text-xs py-2 px-3.5 bg-white shrink-0 flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Scenario</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Saved Scenarios List ── */}
      {savedScenarios.length > 0 && (
        <div className="accora-card bg-white border-[#E2E8F7] p-5 space-y-3">
          <h3 className="font-bold text-sm text-[#1D2839]">Saved Scenarios</h3>
          <div className="space-y-2">
            {savedScenarios.map((sc) => (
              <div
                key={sc.id}
                className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] flex items-center justify-between text-xs"
              >
                <div>
                  <strong className="text-[#1D2839] capitalize">{sc.type}</strong>
                  <span className="text-[#5B6785] ml-2">PKR {sc.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[#0B5CE6]">{sc.verdict}</span>
                  <span className="text-[#5B6785] text-[11px]">{sc.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
