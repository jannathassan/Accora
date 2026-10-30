import { useState, useMemo } from 'react';
import { useMoneyStore } from '../store/moneyStore';
import { Plus, AlertCircle } from 'lucide-react';
import { monthsBetween, getCurrentMonth } from '../utils/calculations';

export default function BudgetsPage() {
  const {
    budgets,
    goals,
    transactions,
    setBudgetLimit,
    addSavingsGoal,
    contributeToGoal,
  } = useMoneyStore();

  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newCat, setNewCat] = useState('Groceries');
  const [newLimit, setNewLimit] = useState('');

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDate, setGoalDate] = useState('2027-06');

  const currentYm = getCurrentMonth();

  // Compute spent amount per budget category from verified transactions this month
  const categorySpending = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'out' && t.date.slice(0, 7) === currentYm)
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions, currentYm]);

  const handleSaveBudget = async () => {
    const lim = parseFloat(newLimit) || 0;
    if (lim <= 0) return;
    await setBudgetLimit(newCat, lim);
    setNewLimit('');
    setShowAddBudget(false);
  };

  const handleCreateGoal = async () => {
    const tgt = parseFloat(goalTarget) || 0;
    if (!goalName || tgt <= 0) return;
    await addSavingsGoal({
      name: goalName.trim(),
      target: tgt,
      byDate: goalDate,
    });
    setGoalName('');
    setGoalTarget('');
    setShowAddGoal(false);
  };

  const handleContribute = async (goalId: string) => {
    const amtStr = prompt('How much did you save for this goal (PKR)?', '5000');
    const amt = parseFloat(amtStr || '0');
    if (amt > 0) {
      await contributeToGoal(goalId, amt);
    }
  };

  const commonCategories = [
    'Groceries', 'Rent', 'Utilities', 'Transport', 'School fees',
    'Medical', 'Stock', 'Salaries', 'Ads', 'Software', 'Eating out', 'Shopping', 'Other'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans">
      
      {/* ── Header ── */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f0fe] text-[#0B5CE6] text-xs font-bold uppercase tracking-wider mb-2">
          <span>Tool #7</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D2839]">
          Budget &amp; Savings Goals
        </h1>
        <p className="text-sm text-[#5B6785] mt-1">
          Set monthly limits per category with progress bars and warnings at 80%. Track target savings with monthly contribution targets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ── Left Column: Monthly Budgets ── */}
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F7]">
            <div>
              <h2 className="text-base font-bold text-[#1D2839]">Monthly Category Budgets</h2>
              <p className="text-xs text-[#5B6785]">Progress for {currentYm}</p>
            </div>
            <button
              onClick={() => setShowAddBudget(!showAddBudget)}
              className="btn-lime text-xs py-1.5 px-3 shadow-2xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set Limit</span>
            </button>
          </div>

          {showAddBudget && (
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] space-y-3 animate-in fade-in duration-150">
              <h3 className="font-bold text-xs text-[#1D2839]">Set Category Budget</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[#5B6785] mb-1 font-semibold">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg bg-white"
                  >
                    {commonCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#5B6785] mb-1 font-semibold">Monthly Limit (PKR)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 35000"
                    value={newLimit}
                    onChange={(e) => setNewLimit(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg bg-white font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
                  className="btn-outline text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Save Limit
                </button>
              </div>
            </div>
          )}

          {/* Budget Bars List (Lime -> Amber at 80% -> Coral at 100%) */}
          <div className="space-y-4 pt-1">
            {Object.keys(budgets).length > 0 ? (
              Object.entries(budgets).map(([cat, limit]) => {
                const spent = categorySpending[cat] || 0;
                const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
                const isOver = pct >= 100;
                const isWarning = pct >= 80 && !isOver;

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1D2839]">{cat}</span>
                      <span className="text-[#5B6785]">
                        <strong className="text-[#1D2839]">PKR {spent.toLocaleString()}</strong> of PKR {limit.toLocaleString()} ({pct}%)
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-[#E2E8F7] overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOver
                            ? 'bg-[#FD614F]'
                            : isWarning
                            ? 'bg-[#f79009]'
                            : 'bg-[#A3D508]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {isOver && (
                      <p className="text-[11px] font-semibold text-[#FD614F] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        100% budget reached for this month!
                      </p>
                    )}
                    {isWarning && (
                      <p className="text-[11px] font-semibold text-[#f79009] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        80% limit warning: slow down spending.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#5B6785] py-4 text-center">
                No budget limits set yet. Click &ldquo;Set Limit&rdquo; to start tracking.
              </p>
            )}
          </div>
        </div>

        {/* ── Right Column: Savings Goals ── */}
        <div className="accora-card bg-white border-[#E2E8F7] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F7]">
            <div>
              <h2 className="text-base font-bold text-[#1D2839]">Savings Goals</h2>
              <p className="text-xs text-[#5B6785]">Auto-calculated monthly savings plans</p>
            </div>
            <button
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="btn-lime text-xs py-1.5 px-3 shadow-2xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          </div>

          {showAddGoal && (
            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F7] space-y-3 animate-in fade-in duration-150">
              <h3 className="font-bold text-xs text-[#1D2839]">Create New Savings Goal</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[#5B6785] mb-1 font-semibold">Goal Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Emergency Reserve"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#5B6785] mb-1 font-semibold">Target (PKR)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 250000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#5B6785] mb-1 font-semibold">Target Date</label>
                  <input
                    type="month"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F7] rounded-lg bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="btn-outline text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateGoal}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Save Goal
                </button>
              </div>
            </div>
          )}

          {/* Goals List */}
          <div className="space-y-4 pt-1">
            {goals.length > 0 ? (
              goals.map((g) => {
                const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
                const remaining = Math.max(0, g.target - g.saved);
                const monthsRemaining = Math.max(1, monthsBetween(currentYm, g.byDate));
                const perMonthTarget = Math.round(remaining / monthsRemaining);

                return (
                  <div
                    key={g.id}
                    className="p-4 rounded-xl border border-[#E2E8F7] bg-[#F4F7FC]/50 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-[#1D2839] text-sm">{g.name}</h3>
                        <p className="text-xs text-[#5B6785]">Target: {g.byDate}</p>
                      </div>
                      <button
                        onClick={() => handleContribute(g.id)}
                        className="btn-lime text-xs py-1.5 px-3 shadow-2xs font-bold"
                      >
                        + Add savings
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#1D2839] pt-1">
                      <span><strong>PKR {g.saved.toLocaleString()}</strong> saved</span>
                      <span>Target: <strong>PKR {g.target.toLocaleString()}</strong> ({pct}%)</span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-[#E2E8F7] overflow-hidden">
                      <div
                        className="h-full bg-[#0B5CE6] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#5B6785]">
                      Save about <strong className="text-[#0B5CE6]">PKR {perMonthTarget.toLocaleString()} / month</strong> to reach this goal by {g.byDate}.
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#5B6785] py-4 text-center">
                No savings goals created yet. Click &ldquo;Add Goal&rdquo; to set one!
              </p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
